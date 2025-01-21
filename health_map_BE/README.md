# HealthMap Finder

HealthMap Finder is a comprehensive web application designed to assist users in locating healthcare facilities based on their geographical location and specific health conditions. The application offers personalized hospital recommendations and detailed insights into each facility's performance metrics.

## Features

- **Location-Based Search**: Find hospitals near you by entering your location or using geolocation services.
- **Condition-Specific Search**: Search for hospitals that specialize in treating specific health conditions.
- **Detailed Hospital Information**: Access performance ratings, statistics, and other relevant details for each hospital.
- **User-Friendly Interface**: Enjoy a responsive and intuitive UI designed for ease of use.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Flask, Pandas, Geopy
- **Database**: CSV file for hospital data
- **APIs**: Custom API endpoints for searching locations and conditions

## Prerequisites

- **Frontend**: Node.js and npm
- **Backend**: Python 3.x, Flask, Pandas, Geopy

## Setup Instructions

### Frontend

1. **Navigate to the Frontend Directory**:
   ```bash
   cd healthmap-finder
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

### Backend

1. **Navigate to the Backend Directory**:
   ```bash
   cd healthmapfinderflask
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:

   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install Required Python Packages**:
   ```bash
   pip install -r req.txt
   ```

5. **Run the Flask Application**:
   ```bash
   python app.py
   ```

## Usage

- **Access the Application**: Open your browser and navigate to `http://localhost:5173`.
- **Search for Hospitals**: Use the search form to input your location and health condition.
- **View Results**: Browse through the list of recommended hospitals and explore detailed information about each facility.

## API Endpoints

- **GET /api/locations/search**: Retrieve a list of locations based on a search query.
- **GET /api/hospitals/search**: Find hospitals based on location and health conditions.
- **GET /api/conditions/search**: Search for health conditions.

## Contributing

We welcome contributions! If you have suggestions or improvements, please fork the repository and submit a pull request. Ensure your code adheres to the project's coding standards and includes relevant tests.

## Machine Learning

In the provided code, the goal is to predict the performance category of healthcare facilities based on various features related to their operations and outcomes. Specifically, the prediction task involves classifying the facilities into one of three categories: 'Low', 'Medium', or 'High' performance. This classification is based on the 'Score' column, which is dynamically binned into these three categories.

### Key Steps in the Process
#### Data Preprocessing:

   - Handling Missing Values: Numeric columns such as 'Denominator', 'Score', 'Lower Estimate', and 'Higher Estimate' are imputed using the mean strategy to handle missing values.
   - Data Type Conversion: Columns are converted to appropriate data types, ensuring numeric columns are treated as numeric and date columns are parsed as datetime objects.
   - Outlier Removal: Outliers in numeric columns are removed using the Interquartile Range (IQR) method.
   - Categorical Encoding: Categorical variables are encoded using LabelEncoder, and one-hot encoding is applied to the 'Measure ID' column if it exists.
   - Feature Engineering: Derived features such as 'Performance_Range' and 'Score_Per_Denominator' are created. Temporal features are added by extracting the season from the 'Start Date'.
#### Feature Selection:
   Unnecessary columns are dropped from the dataset to focus on relevant features for the prediction task.
#### Binning the Target Variable:
   The 'Score' column is dynamically binned into three categories: 'Low', 'Medium', and 'High'. This creates the target variable 'Score_Category' for the classification task.
#### Model Training and Evaluation:

   The dataset is split into features (X) and the target variable (y).
   The target labels are encoded, and the features are scaled using StandardScaler.
   The data is split into training and testing sets.
   SMOTE (Synthetic Minority Over-sampling Technique) is applied to handle class imbalance in the training data.
   A RandomForestClassifier model is trained on the resampled training data and evaluated on the test data.
   The trained model is saved to a .pkl file for future use.
#### Model Updating:

   If new data is provided and the data_updated flag is set to True, the model is retrained with the updated data and the .pkl file is updated.
   Prediction Task
   The prediction task involves classifying healthcare facilities into performance categories based on their operational and outcome metrics. The features used for 
   
#### prediction include:

   Facility Information: Facility ID, Facility Name, Address, City/Town, State, ZIP Code, County/Parish, Telephone Number.
   Measure Information: Measure ID, Measure Name, Compared to National.
   Outcome Metrics: Denominator, Score, Lower Estimate, Higher Estimate.
   Temporal Information: Start Date, End Date.
The target variable is the 'Score_Category', which indicates the performance category of the facility ('Low', 'Medium', or 'High').

### Technical Explanation
   The process involves several technical steps, including data preprocessing, feature engineering, handling class imbalance, and model training. The use of a RandomForestClassifier allows for robust classification based on the provided features. The model is evaluated using standard metrics, and the trained model is saved for future predictions. The system is designed to handle updates to the data, ensuring that the model remains current and accurate.







{
    "Facility ID": "010002",
    "Facility Name": "NORTHWEST MEDICAL CENTER",
    "Address": "1234 MEDICAL DRIVE",
    "City/Town": "TUSCALOOSA",
    "State": "AL",
    "ZIP Code": "35401",
    "County/Parish": "TUSCALOOSA",
    "Telephone Number": "(205) 555-1234",
    "Measure ID": "COMP_HIP_KNEE",
    "Measure Name": "Rate of complications for hip/knee replacement patients",
    "Compared to National": "No Different Than the National Rate",
    "Denominator": 45,
    "Score": 4.2,
    "Lower Estimate": 2.1,
    "Higher Estimate": 6.3,
    "Footnote": "",
    "Start Date": "2020-07-01",
    "End Date": "2023-03-31"
}