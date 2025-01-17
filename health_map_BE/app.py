import json
import requests
import datetime
from flask import Flask, render_template, request, jsonify
import pandas as pd
import base64
from io import BytesIO
from os import getenv
import pathlib
import os
from flask_cors import CORS
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from functools import lru_cache
import time

app = Flask(__name__)
# Enable CORS with credentials support
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:8080",
            "http://localhost:3000",
            "http://localhost:5173",
            "https://lovable.dev",
            "https://gptengineer.app"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})



# Helper function to fetch coordinates and calculate distance
def get_coordinates(state: str) -> Optional[Tuple[float, float]]:
    geolocator = Nominatim(user_agent="location_distance_calculator")
    try:
        location = geolocator.geocode(state)
        if location:
            return location.latitude, location.longitude
        return None
    except (GeocoderTimedOut, GeocoderServiceError):
        return None

# Calculate the distance between two locations based on their coordinates
def calculate_distance(state1: str, state2: str) -> Optional[float]:
    coords1 = get_coordinates(state1)
    coords2 = get_coordinates(state2)
    
    if coords1 and coords2:
        return geodesic(coords1, coords2).miles
    return None

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Load the dataset once when the app starts
try:
    dataset = pd.read_csv(r"Hospital inmoratlity.csv")
    # print("Available columns:", dataset.columns.tolist())
    
    # Clean column names and handle missing values
    dataset = dataset.fillna('')  
    
    # Updated column mapping to match actual CSV columns
    column_mapping = {
        'Facility ID': 'Provider ID',
        'Facility Name': 'Hospital Name',
        'Address': 'Address',
        'City/Town': 'City',
        'State': 'State',
        'ZIP Code': 'ZIP Code',
        'County/Parish': 'County',
        'Score': 'Score',
        'Measure Name': 'Measure Name',
        'Lower Estimate': 'Lower Estimate',
        'Higher Estimate': 'Higher Estimate',
        'Denominator': 'Denominator'
    }
    
    dataset = dataset.rename(columns=column_mapping)
    # print("After mapping:", dataset.columns.tolist())
    
    # Verify required columns
    required_columns = ['Provider ID', 'Hospital Name', 'Address', 'City', 
                       'State', 'ZIP Code', 'County', 'Score', 'Measure Name',
                       'Lower Estimate', 'Higher Estimate', 'Denominator']
    
    missing_columns = [col for col in required_columns if col not in dataset.columns]
    if missing_columns:
        print(f"Missing columns: {missing_columns}")
        raise ValueError(f"Missing required columns: {missing_columns}")

except Exception as e:
    print(f"Detailed error loading dataset: {str(e)}")
    dataset = pd.DataFrame()

@dataclass
class Hospital:
    id: str
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    county: str
    score: float
    measure_name: str
    denominator: str
    lower_estimate: str
    higher_estimate: str

    @classmethod
    def from_row(cls, row) -> 'Hospital':
        # Handle 'Not Available' or empty score
        try:
            score = float(row['Score']) if row['Score'] and row['Score'] != 'Not Available' else 25.0
        except (ValueError, TypeError):
            score = 25.0  # Default score for invalid/missing data

        return cls(
            id=str(row['Facility ID']),
            name=str(row['Facility Name']),
            address=str(row['Address']),
            city=str(row['City/Town']),
            state=str(row['State']),
            zip_code=str(row['ZIP Code']),
            county=str(row['County/Parish']),
            score=score,
            measure_name=str(row['Measure Name']),
            denominator=str(row['Denominator']),
            lower_estimate=str(row['Lower Estimate']),
            higher_estimate=str(row['Higher Estimate'])
        )

    def to_dict(self) -> Dict:
        has_data = self.score != 25.0
        performance = self.calculate_performance()
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zipCode": self.zip_code,
            "county": self.county,
            "score": self.score,
            "hasData": has_data,
            "ratings": self.calculate_ratings(has_data),
            "performanceLevel": performance[0],
            "description": self.generate_description(performance[1]),
            "statistics": {
                "denominator": self.denominator,
                "lowerEstimate": self.lower_estimate,
                "higherEstimate": self.higher_estimate,
                "measureName": self.measure_name
            }
        }

    def calculate_performance(self) -> tuple[str, str]:
        if self.score == 25:
            return "No Rating", "data not available"
        
        levels = [
            (8, "Excellent", "significantly better than national average"),
            (12, "Good", "better than national average"),
            (16, "Average", "similar to national average"),
            (20, "Below Average", "worse than national average"),
            (float('inf'), "Poor", "significantly worse than national average")
        ]
        
        for threshold, level, detail in levels:
            if self.score <= threshold:
                return level, detail
        return "Poor", "significantly worse than national average"

    def calculate_ratings(self, has_data: bool) -> Dict:
        if not has_data:
            return {"overall": None, "quality": None, "safety": None}
        overall = max(1, min(5, 5 - (self.score / 5)))
        return {
            "overall": round(overall, 1),
            "quality": round(overall * 0.8, 1),
            "safety": round(overall * 0.9, 1)
        }

    def generate_description(self, performance_detail: str) -> str:
        return (
            f"Hospital in {self.city}, {self.state} - "
            f"Performance is {performance_detail}. "
            f"Based on {self.denominator} patients. "
            f"Mortality rate estimate ranges from {self.lower_estimate}% "
            f"to {self.higher_estimate}%."
        )

@app.route('/api/locations/search', methods=['GET'])
def search_locations():
    
    if dataset.empty:
        return jsonify({"error": "Dataset not available"}), 500

    query = request.args.get('query', '').strip()
    field = request.args.get('field', 'City')
    if not query or len(query) < 2:
        return jsonify([]), 200

    try:
        # Map of valid fields to their dataset column names
        field_mapping = {
            'City': 'City',
            'State': 'State',
            'County': 'County'
        }
        
        # print(field)
        if field not in field_mapping:
            return jsonify({"error": f"Invalid field. Valid fields are: {', '.join(field_mapping.keys())}"}), 400
            
        # Get unique values from dataset that match the query
        column = field_mapping[field]
        # Convert to string and handle case-insensitive search
        matching_rows = dataset[dataset[column].astype(str).str.contains(query, case=False, na=False)]
        
        # Get unique cities
        unique_locations = matching_rows.groupby(['City', 'State', 'County', 'ZIP Code']).first().reset_index()
        
        # Prepare results
        # Get unique display strings first
        display_strings = unique_locations.apply(lambda x: f"{x['City']}, {x['State']}", axis=1).unique()
        
        # Create results from unique display strings
        results = []
        for i, display_string in enumerate(display_strings[:10]):  # Limit to 10 results
            city, state = display_string.split(", ")
            row = unique_locations[
                (unique_locations['City'] == city) & 
                (unique_locations['State'] == state)
            ].iloc[0]
            
            results.append({
                "id": str(i + 1),
                "city": str(row.get("City", "")),
                "state": str(row.get("State", "")), 
                "county": str(row.get("County", "")),
                "displayString": display_string
            })
        return jsonify(results), 200
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/hospitals/search', methods=['GET'])
def search_hospitals():
    try:
        # Load dataset
        dataset = pd.read_csv("Hospital inmoratlity.csv")
        dataset = dataset.fillna('')

        # Get search parameters
        location = request.args.get('location', '').strip()
        health_issue = request.args.get('healthIssue', '').strip()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))

        if not location:
            return jsonify({"error": "Location is required"}), 400

        city, state = location.split(', ') if ', ' in location else (location, '')

        # Filter hospitals
        def filter_hospitals(df: pd.DataFrame, city_match: bool = True) -> List[Hospital]:
            mask = df['State'].str.lower() == state.lower()
            if city_match:
                mask &= df['City/Town'].str.lower() == city.lower()
            else:
                mask &= df['City/Town'].str.lower() != city.lower()
            
            if health_issue:
                mask &= df['Measure Name'].str.contains(health_issue, case=False, na=False)
            
            return [Hospital.from_row(row) for _, row in df[mask].iterrows()]

        # Get hospitals by location
        city_hospitals = filter_hospitals(dataset, city_match=True)
        state_hospitals = [
            h for h in filter_hospitals(dataset, city_match=False)
            if h.calculate_performance()[0] in ["Good", "Excellent"]
        ]

        # Get top 5 hospitals outside the state, sorted by performance
        other_hospitals = [
            h for h in (Hospital.from_row(row) for _, row in dataset[dataset['State'].str.lower() != state.lower()].iterrows())
            if h.calculate_performance()[0] == "Excellent"
        ]

        # Sort the other hospitals by their performance score (assuming the score is in calculate_performance())
        other_hospitals_sorted = sorted(other_hospitals, key=lambda h: h.calculate_performance()[1], reverse=True)[:5]

        # Convert to response format
        grouped_hospitals = {
            "cityHospitals": [h.to_dict() for h in city_hospitals],
            "stateHospitals": [h.to_dict() for h in state_hospitals],
            "otherHospitals": [h.to_dict() for h in other_hospitals_sorted]
        }

        total_results = sum(len(hospitals) for hospitals in grouped_hospitals.values())

        response_data = {
            "hospitals": grouped_hospitals,
            "availability": {
                "hasLocalHospitals": len(grouped_hospitals["cityHospitals"]) > 0,
                "hasStateHospitals": len(grouped_hospitals["stateHospitals"]) > 0,
                "hasOtherHospitals": len(grouped_hospitals["otherHospitals"]) > 0
            },
            "total_pages": (total_results + per_page - 1) // per_page,
            "page": page
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/conditions/search', methods=['GET'])
def search_conditions():
    if dataset.empty:
        return jsonify({"error": "Dataset not available"}), 500

    query = request.args.get('query', '').strip()
    if not query or len(query) < 2:
        return jsonify([]), 200

    try:
        # Filter the dataset to match health conditions (Measure Name in your case)
        matching_rows = dataset[dataset['Measure Name'].str.contains(query, case=False, na=False)]

        # Prepare the results
        results = matching_rows['Measure Name'].unique()
        
        return jsonify(results.tolist()), 200

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True)