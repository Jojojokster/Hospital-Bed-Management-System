const axios = require('axios');

async function predictLengthOfStay(patientData) {
    try {
        // Send the patient data to the Python API
        const response = await axios.post('http://localhost:5000/predict', patientData);

        // Extract the predicted length of stay
        const predictedLength = response.data.predicted_length_of_stay;

        return predictedLength;
    } catch (error) {
        console.error("Error predicting length of stay:", error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { predictLengthOfStay };