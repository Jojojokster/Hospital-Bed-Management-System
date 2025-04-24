from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = joblib.load("length_of_stay_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Get input data from the request
        data = request.get_json()

        # Preprocess the input data
        input_data = preprocess_input(data)

        # Ensure the input data is a DataFrame with the correct shape
        if isinstance(input_data, pd.Series):
            input_data = input_data.to_frame().T  # Convert Series to DataFrame

        # Make predictions
        prediction = model.predict(input_data)

        # Return the prediction
        return jsonify({"predicted_length_of_stay": int(prediction[0])})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


def preprocess_input(data):
    """
    Preprocesses the input data to match the format expected by the model.
    """
    # Define default values for missing data
    default_values = {
        "gender": "F",
        "rcount": "0",
        "dialysisrenalendstage": 0,
        "asthma": 0,
        "irondef": 0,
        "pneum": 0,
        "substancedependence": 0,
        "psychologicaldisordermajor": 0,
        "depress": 0,
        "psychother": 0,
        "fibrosisandother": 0,
        "malnutrition": 0,
        "hemo": 0,
        "hematocrit": 45.0,
        "neutrophils": 50.0,
        "sodium": 140.0,
        "glucose": 100.0,
        "bloodureanitro": 15.0,
        "creatinine": 1.0,
        "bmi": 22.0,
        "pulse": 72,
        "respiration": 16.0,
        "secondarydiagnosisnonicd9": 0,
        "numberofissues": 0,
    }

    # Update defaults with provided data
    input_data = {key: data.get(key, default_values[key]) for key in default_values}

    # Create a DataFrame with the expected features
    df = pd.DataFrame([input_data])

    # Convert categorical columns to category type
    df["gender"] = df["gender"].astype("category")
    df["rcount"] = df["rcount"].astype("category")

    # Convert numerical columns to appropriate types
    numerical_columns = [
        "hematocrit", "neutrophils", "sodium", "glucose", "bloodureanitro",
        "creatinine", "bmi", "respiration"
    ]
    df[numerical_columns] = df[numerical_columns].astype(float)

    integer_columns = [
        "dialysisrenalendstage", "asthma", "irondef", "pneum", "substancedependence",
        "psychologicaldisordermajor", "depress", "psychother", "fibrosisandother",
        "malnutrition", "hemo", "pulse", "secondarydiagnosisnonicd9", "numberofissues"
    ]
    df[integer_columns] = df[integer_columns].astype(int)

    # Ensure the columns are in the correct order
    expected_features = [
        "rcount", "gender", "dialysisrenalendstage", "asthma", "irondef", "pneum",
        "substancedependence", "psychologicaldisordermajor", "depress", "psychother",
        "fibrosisandother", "malnutrition", "hemo", "hematocrit", "neutrophils",
        "sodium", "glucose", "bloodureanitro", "creatinine", "bmi", "pulse",
        "respiration", "secondarydiagnosisnonicd9", "numberofissues"
    ]
    df = df[expected_features]

    return df


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)