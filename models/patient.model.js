const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { predictLengthOfStay } = require('../public/predictLOS')
require('dotenv').config();

// Define the Patient model with additional fields
const Patient = sequelize.define('Patient', {
    patient_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    patient_forename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patient_surname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rcount: {
        type: DataTypes.ENUM("0", "1", "2", "3", "4", "5+"),
        allowNull: false,
        defaultValue: 0,
    },
    gender: {
        type: DataTypes.ENUM("F", "M"),
        allowNull: false,
    },
    admission: {
        type: DataTypes.ENUM(
            "emergency", 
            "outpatient", 
            "inpatient", 
            "day_patient", 
            "urgent", 
            "routine", 
            "elective", 
            "direct", 
            "holding"
        ),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reason_for_stay: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    extension_reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    discharged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // Binary columns (medical conditions)
    dialysisrenalendstage: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    asthma: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    irondef: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    pneum: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    substancedependence: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    psychologicaldisordermajor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    depress: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    psychother: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    fibrosisandother: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    malnutrition: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    hemo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // Numeric columns (lab results or measurements)
    hematocrit: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    neutrophils: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    sodium: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    glucose: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    bloodureanitro: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    creatinine: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    bmi: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    pulse: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    respiration: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    secondarydiagnosisnonicd9: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    predicted_length_of_stay: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null, // Default is null until prediction is made
    },
}, {
    timestamps: true, // Enable createdAt and updatedAt
});

function calculateTrueBinaryFields(patientData) {
    // List of binary fields in the dataset
    const binaryFields = [
        "dialysisrenalendstage",
        "asthma",
        "irondef",
        "pneum",
        "substancedependence",
        "psychologicaldisordermajor",
        "depress",
        "psychother",
        "fibrosisandother",
        "malnutrition",
        "hemo",
        "secondarydiagnosisnonicd9"
    ];

    // Calculate the total number of binary fields that are true
    let trueCount = 0;
    for (const field of binaryFields) {
        if (patientData[field] === 1) {
            trueCount++;
        }
    }

    // Add the new field to the patientData object
    patientData.numberofissues = trueCount;

    return patientData;
}

// Sequelize Hooks
Patient.beforeCreate(async (patient, options) => {

    const patientData = {
        gender: patient.gender, // Encode gender as binary (1 for Female, 0 for Male)
        rcount: patient.rcount || 0, // Use 0 as default if rcount is not provided
        dialysisrenalendstage: patient.dialysisrenalendstage ? 1 : 0, // Binary field
        asthma: patient.asthma ? 1 : 0, // Binary field
        irondef: patient.irondef ? 1 : 0, // Binary field
        pneum: patient.pneum ? 1 : 0, // Binary field
        substancedependence: patient.substancedependence ? 1 : 0, // Binary field
        psychologicaldisordermajor: patient.psychologicaldisordermajor ? 1 : 0, // Binary field
        depress: patient.depress ? 1 : 0, // Binary field
        psychother: patient.psychother ? 1 : 0, // Binary field
        fibrosisandother: patient.fibrosisandother ? 1 : 0, // Binary field
        malnutrition: patient.malnutrition ? 1 : 0, // Binary field
        hemo: patient.hemo ? 1 : 0, // Binary field
        hematocrit: patient.hematocrit || 45, // Default to a healthy value if not provided
        neutrophils: patient.neutrophils || 50, // Default to a healthy value if not provided
        sodium: patient.sodium || 140, // Default to a healthy value if not provided
        glucose: patient.glucose || 100, // Default to a healthy value if not provided
        bloodureanitro: patient.bloodureanitro || 15, // Default to a healthy value if not provided
        creatinine: patient.creatinine || 1.0, // Default to a healthy value if not provided
        bmi: patient.bmi || 22, // Default to a healthy value if not provided
        pulse: patient.pulse || 72, // Default to a healthy value if not provided
        respiration: patient.respiration || 16, // Default to a healthy value if not provided
        secondarydiagnosisnonicd9: patient.secondarydiagnosisnonicd9 || 0, // Default to 0 if not provided
    };

    const updatedPatientData = calculateTrueBinaryFields(patientData)

    console.log(updatedPatientData)

     // Predict the length of stay
     const predictedLength = await predictLengthOfStay(updatedPatientData);

     // Update the patient record with the prediction
     patient.predicted_length_of_stay = predictedLength;

    // Check if a patient with the same name already exists
    const existingPatient = await Patient.findOne({
        where: {
            patient_forename: patient.patient_forename,
            patient_surname: patient.patient_surname,
            discharged: true, // Only consider discharged patients
        },
    });

    if (existingPatient) {
        // Increment the rcount of the existing patient
        const rcountValues = ["0", "1", "2", "3", "4", "5+"]; // Define the ENUM values
        const currentIndex = rcountValues.indexOf(existingPatient.rcount); // Find the current index
        const nextIndex = Math.min(currentIndex + 1, rcountValues.length - 1); // Increment, but cap at "5+"
        existingPatient.rcount = rcountValues[nextIndex]; // Update rcount to the next value
    
        // Mark the patient as not discharged
        existingPatient.discharged = false;
    
        // Log the reassignment
        await ReadmissionLog.create({
            patient_id: existingPatient.patient_id,
            reason: patient.reason_for_stay || "No reason provided",
        });
    
        // Save the updated patient record
        await existingPatient.save();
    
        // Prevent creating a new patient record
        throw new Error('PatientReadmitted'); // Use a custom error to indicate readmission
    }
});

Patient.afterUpdate(async (patient, options) => {
    // If the patient is discharged, set discharged = true
    if (patient.discharged) {
        console.log(`Patient ${patient.patient_forename} ${patient.patient_surname} has been discharged.`);
    }
});

module.exports = { sequelize, Patient };