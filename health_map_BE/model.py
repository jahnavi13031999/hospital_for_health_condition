import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score
from imblearn.over_sampling import SMOTE
import joblib
import logging
import os
from tqdm import tqdm

# Enable logging
logging.basicConfig(level=logging.INFO)

def preprocess_and_train(data, data_updated=False):
    """
    Preprocess the data and train the machine learning model.

    Parameters:
    data (pd.DataFrame): The dataset to be preprocessed and used for training.
    data_updated (bool): Flag indicating if the data has been updated. Default is False.

    Returns:
    None
    """
    # Get the current working directory
    cwd = os.getcwd()
    model_filename = "rf_model.pkl"
    model_path = os.path.join(cwd, model_filename)

    # Handle missing values in numeric columns using mean imputation
    numeric_cols = ['Denominator', 'Score', 'Lower Estimate', 'Higher Estimate']
    for col in tqdm(numeric_cols, desc="Imputing missing values", unit="column"):
        data[col] = pd.to_numeric(data[col], errors='coerce')  # Convert non-numeric values to NaN

    num_imputer = SimpleImputer(strategy='mean')
    data[numeric_cols] = num_imputer.fit_transform(data[numeric_cols])

    # Convert data types
    data = data.convert_dtypes()

    # Ensure all columns have consistent data types
    for col in tqdm(data.columns, desc="Ensuring consistent data types", unit="column"):
        if data[col].dtype == 'object':
            data[col] = data[col].astype(str)

    # Convert date columns
    date_cols = ['Start Date', 'End Date']
    for col in tqdm(date_cols, desc="Processing date columns", unit="column"):
        if col in data.columns:
            data[col] = pd.to_datetime(data[col], errors='coerce')

    # Calculate duration between dates if both exist
    if 'Start Date' in data.columns and 'End Date' in data.columns:
        data['Measure Duration'] = (data['End Date'] - data['Start Date']).dt.days

    # Remove outliers using IQR
    def remove_outliers_iqr(df, columns, threshold=3):
        df_clean = df.copy()
        for col in tqdm(columns, desc="Removing outliers using IQR", unit="column"):
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - threshold * IQR
            upper = Q3 + threshold * IQR
            df_clean = df_clean[(df_clean[col] >= lower) & (df_clean[col] <= upper)]
        return df_clean

    data = remove_outliers_iqr(data, numeric_cols)

    # Encode categorical variables
    categorical_cols = ['City/Town', 'State', 'County/Parish', 'Measure ID', 'Measure Name', 'Compared to National']
    label_encoders = {}
    for col in tqdm(categorical_cols, desc="Encoding categorical variables", unit="column"):
        if col in data.columns:
            le = LabelEncoder()
            data[col] = le.fit_transform(data[col].astype(str))
            label_encoders[col] = le

    # Create derived features
    tqdm.pandas(desc="Creating derived features")
    data['Performance_Range'] = data['Higher Estimate'] - data['Lower Estimate']
    data['Score_Per_Denominator'] = data['Score'] / data['Denominator']

    # Drop unnecessary columns
    data = data.drop(
        columns=[
            'Footnote',
            'Facility ID',
            'Facility Name',
            'Address',
            'City/Town',
            'State',
            'County/Parish',
            'Telephone Number',
            'Measure Name',
            'Start Date',
            'End Date',
        ],
        errors='ignore',
    )

    # Dynamically define bins for Score
    num_bins = 3
    score_min = data['Score'].min()
    score_max = data['Score'].max()
    bins = np.linspace(score_min, score_max, num_bins + 1)
    labels = ['Low', 'Medium', 'High']
    data['Score_Category'] = pd.cut(data['Score'], bins=bins, labels=labels, include_lowest=True)

    try:
        X = data.drop(columns=['Score', 'Score_Category'])
        y = data['Score_Category']
    except KeyError as e:
        logging.error(f"Error in dropping columns: {str(e)}", exc_info=True)
        logging.error(f"Available columns: {data.columns}", exc_info=True)
        return

    # Ensure there are no NaN values in X before applying SMOTE
    if X.isnull().values.any():
        logging.warning("Found NaN values in feature matrix X. Imputing missing values...")
        
        # Use SimpleImputer to fill missing values with the mean (for numeric columns)
        imputer = SimpleImputer(strategy='mean')
        X = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)
        
        # Confirm no NaN values remain
        if X.isnull().values.any():
            logging.error("Imputation failed. NaN values still present in feature matrix X.")
            return
    else:
        logging.info("No NaN values found in feature matrix X. Proceeding with SMOTE.")

    # Proceed if no errors
    if 'Score_Category' in data.columns:
        # Encoding target labels for SMOTE
        le_y = LabelEncoder()
        y = le_y.fit_transform(y)

        # Scaling Features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Splitting into Train and Test Sets
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

        # Applying SMOTE for Resampling
        smote = SMOTE(random_state=42)
        X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

        # Check if model file exists
        if os.path.exists(model_path):
            # Load the existing model
            rf_model = joblib.load(model_path)
            logging.info(f"Model loaded from {model_path}")
        else:
            # Train and evaluate model
            rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
            train_evaluate_model(rf_model, X_resampled, X_test, y_resampled, y_test, le_y)

            # Save the trained model to a .pkl file
            joblib.dump(rf_model, model_path)
            logging.info(f"Model successfully saved to {model_path}")

        # Check if data is updated
        if data_updated:
            # Retrain and update the model
            rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
            train_evaluate_model(rf_model, X_resampled, X_test, y_resampled, y_test, le_y)

            # Save the updated model to a .pkl file
            joblib.dump(rf_model, model_path)
            logging.info(f"Model updated and saved to {model_path}")
    else:
        logging.error("Cannot proceed with SMOTE due to missing 'Score_Category'.")

def train_evaluate_model(model, X_train, X_test, y_train, y_test, label_encoder):
    """
    Train and evaluate the machine learning model.

    Parameters:
    model: The machine learning model to be trained.
    X_train (np.ndarray): The training features.
    X_test (np.ndarray): The testing features.
    y_train (np.ndarray): The training labels.
    y_test (np.ndarray): The testing labels.
    label_encoder (LabelEncoder): The label encoder used for encoding the target labels.

    Returns:
    None
    """
    tqdm.write("Training the model...")
    with tqdm(total=100, desc="Training Progress") as pbar:
        model.fit(X_train, y_train)
        pbar.update(100)

    y_pred = model.predict(X_test)
    y_test_labels = label_encoder.inverse_transform(y_test)
    y_pred_labels = label_encoder.inverse_transform(y_pred)

    print("Classification Report:")
    print(classification_report(y_test_labels, y_pred_labels))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test_labels, y_pred_labels))
    print("Accuracy Score:", accuracy_score(y_test_labels, y_pred_labels))
    print("Precision Score:", precision_score(y_test_labels, y_pred_labels, average='weighted'))


