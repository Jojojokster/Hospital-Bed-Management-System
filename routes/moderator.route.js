const sequelize = require('../config/database'); // Import Sequelize User model
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { patientValidator } = require('../utils/validators');
const { Bed, Patient, ReadmissionLog } = require('../models'); // Import models

// Route to fetch all patients
router.get('/patients', async (req, res, next) => {
  try {
    // Fetch all patients and their associated beds
    const patients = await Patient.findAll({
      where: { discharged: false, },
      include: [{ model: Bed, required: false }], // Include Bed information (optional)
    });

    // Add a flag to indicate if the patient is assigned to a bed
    // Also include bed details if the patient is assigned to a bed
    const patientsWithBedDetails = patients.map(patient => {
      const patientData = patient.toJSON();
      const bedDetails = patient.Bed
        ? {
          bed_number: patient.Bed.bed_number,
          ward: patient.Bed.ward,
          room: patient.Bed.room,
          floor: patient.Bed.floor,
        }
        : null;

      return {
        ...patientData,
        isAssignedToBed: !!patient.Bed, // True if the patient has an associated bed
        bedDetails, // Include bed details if assigned, otherwise null
      };
    });

    res.render('manage-patients', { patients: patientsWithBedDetails, currentPage: 'managepatients' });
  } catch (error) {
    next(error);
  }
});

// Route to fetch a single patient by ID
router.get('/patient/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate if the ID is numeric
    if (!Number.isInteger(Number(id))) {
      req.flash('error', 'Invalid id');
      return res.redirect('/moderator/patients');
    }

    // Find the patient by primary key
    const patient = await Patient.findByPk(id);

    if (!patient) {
      req.flash('error', 'User not found');
      return res.redirect('/modarator/patients');
    }

    res.render('patientinfo', { patient, currentPage: 'patientinfo' });
  } catch (error) {
    next(error);
  }
});


// Route to fetch reassignment logs for a patient
router.get('/patient/:id/readmissions', async (req, res, next) => {
  try {
      const { id } = req.params;

      // Find the patient by primary key
      const patient = await Patient.findByPk(id);

      // Fetch reassignment logs for the patient
      const logs = await ReadmissionLog.findAll({
          where: { patient_id: id },
          order: [['readmission_date', 'DESC']], // Order by most recent first
      });

      //res.json(logs); // Return the logs as JSON

      res.render('patientreadmissions', { logs, patient, currentPage: 'patientreadmissions' });
  } catch (error) {
      next(error);
  }
});

// Route to render the register patient page
router.get('/patientregister', async (req, res, next) => {
  res.render('register-patient', { currentPage: 'registerpatient' });
});

// Route to register a new patient
router.post(
  '/patientregister',
  patientValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash('error', error.msg);
        });
        return res.render('register-patient', {
          email: req.body.email,
          messages: req.flash(),
        });
      }

      // const { email } = req.body;

      // Create the patient
      const patient = await Patient.create({
        ...req.body,
        reason_for_stay: req.body.reason_for_stay, // Ensure reason_for_stay is saved
      });

      req.flash('success', `${patient.patient_forename} registered successfully.`);
      res.redirect('/moderator/patientregister');
    } catch (error) {
      if (error.message === 'PatientReadmitted') {
        req.flash('success', 'Patient readmitted successfully');
        res.redirect('/moderator/patientregister'); // Redirect to the patients page
      } else {
        next(error);
      }
    }
  }
);

// Route to update a patient's details
router.post('/update-patient', async (req, res, next) => {
  try {
    const {
      patient_id,
      patient_forename,
      patient_surname,
      email,
      phone,
      admission,
      reason_for_stay,
      extension_reason,
      dialysisrenalendstage,
      asthma,
      irondef,
      pneum,
      substancedependence,
      psychologicaldisordermajor,
      depress,
      psychother,
      fibrosisandother,
      malnutrition,
      hemo,
      hematocrit,
      neutrophils,
      sodium,
      glucose,
      bloodureanitro,
      creatinine,
      bmi,
      respiration,
    } = req.body;

    // Check for required fields in the request body
    if (!patient_id) {
      req.flash('error', 'Patient ID is required');
      return res.redirect('back');
    }

    // Validate if the patient_id is numeric
    if (!Number.isInteger(Number(patient_id))) {
      req.flash('error', 'Invalid patient_id');
      return res.redirect('back');
    }

    // Dynamically construct the update object
    const updateFields = {};
    if (patient_forename) updateFields.patient_forename = patient_forename;
    if (patient_surname) updateFields.patient_surname = patient_surname;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (admission) updateFields.admission = admission;
    if (reason_for_stay) updateFields.reason_for_stay = reason_for_stay;
    if (extension_reason) updateFields.extension_reason = extension_reason;

    // Handle boolean fields
    updateFields.dialysisrenalendstage = dialysisrenalendstage === 'true'; // Convert string to boolean
    updateFields.asthma = asthma === 'true';
    updateFields.irondef = irondef === 'true';
    updateFields.pneum = pneum === 'true';
    updateFields.substancedependence = substancedependence === 'true';
    updateFields.psychologicaldisordermajor = psychologicaldisordermajor === 'true';
    updateFields.depress = depress === 'true';
    updateFields.psychother = psychother === 'true';
    updateFields.fibrosisandother = fibrosisandother === 'true';
    updateFields.malnutrition = malnutrition === 'true';
    updateFields.hemo = hemo === 'true';

    // Handle numeric fields
    if (hematocrit) updateFields.hematocrit = parseFloat(hematocrit);
    if (neutrophils) updateFields.neutrophils = parseFloat(neutrophils);
    if (sodium) updateFields.sodium = parseFloat(sodium);
    if (glucose) updateFields.glucose = parseFloat(glucose);
    if (bloodureanitro) updateFields.bloodureanitro = parseFloat(bloodureanitro);
    if (creatinine) updateFields.creatinine = parseFloat(creatinine);
    if (bmi) updateFields.bmi = parseFloat(bmi);
    if (respiration) updateFields.respiration = parseFloat(respiration);

    // Ensure at least one field is provided for update
    if (Object.keys(updateFields).length === 0) {
      req.flash('error', 'No fields provided for update');
      return res.redirect('back');
    }

    // Update the patient's details in the database
    const [updatedRowsCount] = await Patient.update(
      updateFields, // Update only the fields provided in the request
      { where: { patient_id } } // Find the patient by patient_id
    );

    if (updatedRowsCount === 0) {
      req.flash('error', 'Patient not found');
      return res.redirect('back');
    }

    // Fetch the updated patient to display the success message
    const updatedPatient = await Patient.findByPk(patient_id);
    req.flash('info', `Updated details for ${updatedPatient.patient_surname}`);
    console.log(req.body);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

// Route to update a patient's details
router.post('/update-readmission', async (req, res, next) => {
  try{
  const { readmission_reason, patient_id } = req.body

  // Check for required fields in the request body
  if (!patient_id) {
    req.flash('error', 'Patient ID is required');
    return res.redirect('back');
  }

  // Validate if the patient_id is numeric
  if (!Number.isInteger(Number(patient_id))) {
    req.flash('error', 'Invalid patient_id');
    return res.redirect('back');
  }

  // Dynamically construct the update object
  const updateFields = {};
  if (readmission_reason) updateFields.readmission_reason = readmission_reason;

  // Ensure at least one field is provided for update -- Also added here in case more fields are implemented later
  if (Object.keys(updateFields).length === 0) {
    req.flash('error', 'No fields provided for update');
    return res.redirect('back');
  }

  // Update the patient's readmission in the database
  const [updatedRowsCount] = await ReadmissionLog.update(
    updateFields, // Update only the fields provided in the request
    { where: { patient_id } } // Find the patient by patient_id
  );

  if (updatedRowsCount === 0) {
    req.flash('error', 'Patient not found');
    return res.redirect('back');
  }

  // Fetch the updated patient to display the success message
  const updatedPatient = await Patient.findByPk(patient_id);
  req.flash('info', `Updated Re-Admission for ${updatedPatient.patient_surname}`);
  console.log(req.body);
  res.redirect('back');
  
  } catch (error) {
    next(error);
  }
})


// Route to assign a bed to a patient
router.post('/assign-bed', async (req, res) => {
  try {
    const { bed_number, patient_id, duration } = req.body;

    // Validate bed exists and is available
    const bed = await Bed.findOne({
      where: {
        bed_number: bed_number,
        status: 'available', // Ensure bed is available
      },
    });

    if (!bed) {
      req.flash('error', 'Invalid bed number or bed not available');
      return res.redirect('back');
    }

    // Calculate expected availability
    const expected_availability = new Date();
    expected_availability.setDate(expected_availability.getDate() + parseInt(duration));

    // Update the bed
    await bed.update({
      status: 'occupied',
      patient_id,
      expected_availability,
    });

    req.flash('success', `Bed ${bed_number} assigned successfully`);
    res.redirect('/moderator/patients');
  } catch (error) {
    req.flash('error', 'Failed to assign bed');
    res.redirect('back');
  }
});

// Route to extend a patient's stay
router.post('/extend-stay', async (req, res) => {
  try {
    const { bed_number, duration, extension_reason, patient_id } = req.body;

    // Validate that extension_reason is provided
    if (!extension_reason) {
      req.flash('error', 'Extension reason is required');
      return res.redirect('back');
    }

    // Find the bed
    const bed = await Bed.findOne({
      where: { patient_id },
      include: [{ model: Patient }],
    });

    if (!bed || bed.status !== 'occupied') {
      req.flash('error', 'Bed not occupied');
      return res.redirect('back');
    }

    // Calculate new expected availability (existing date + duration)
    const newExpectedAvailability = new Date(bed.expected_availability);
    newExpectedAvailability.setDate(newExpectedAvailability.getDate() + parseInt(duration));

    // Update the bed and patient
    await bed.update({
      expected_availability: newExpectedAvailability,
    });

    await Patient.update(
      { extension_reason }, // Save the extension reason
      { where: { patient_id } }
    );

    req.flash(
      'info',
      `Extended stay for ${bed.patient.email} in bed ${bed.bed_number} until ${newExpectedAvailability.toLocaleDateString()} (Reason: ${extension_reason})`
    );
    res.redirect('/moderator/manage-beds');
  } catch (error) {
    console.error('Error extending stay:', error);
    req.flash('error', 'Failed to extend stay');
    res.redirect('back');
  }
});

// Route to render the manage beds page
router.get('/manage-beds', async (req, res) => {
  try {
    // Fetch all beds from the database
    const beds = await Bed.findAll();

    // Render the manage-beds page with the list of beds
    res.render('manage-beds', { beds, currentPage: 'managebeds' });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to load beds');
    res.redirect('back');
  }
});

// Route to discharge a patient
router.post('/discharge-patient', async (req, res) => {
  try {
    const { patient_id } = req.body;

    // Find the bed assigned to the patient
    const bed = await Bed.findOne({ where: { patient_id } });
    const patient = await Patient.findOne({ where: { patient_id } });

    if (!bed) {
      req.flash('warning', 'Patient is not assigned to any bed');
      return res.redirect('back');
    }

    // Update the bed to "available" and clear patient association
    await bed.update({
      status: 'available',
      patient_id: null,
      expected_availability: null,
    });

    await patient.update({
      discharged: true
    })

    req.flash('success', 'Patient discharged successfully');
    res.redirect('/moderator/patients');
  } catch (error) {
    console.error('Error discharging patient:', error);
    req.flash('error', 'Failed to discharge patient');
    res.redirect('back');
  }
});

// Route to reassign a patient
router.post('/reassign-patient', async (req, res) => {
  try {
    const { patient_id } = req.body;

    // Find the bed assigned to the patient
    const bed = await Bed.findOne({ where: { patient_id } });

    if (!bed) {
      req.flash('warning', 'Patient is not assigned to any bed');
      return res.redirect('back');
    }

    // Update the bed to "available" and clear patient association
    await bed.update({
      status: 'available',
      patient_id: null,
      expected_availability: null,
    });

    req.flash('success', 'Patient removed from bed successfully');
    res.redirect('/moderator/patients');
  } catch (error) {
    console.error('Error discharging patient:', error);
    req.flash('error', 'Failed to remove patient from bed');
    res.redirect('back');
  }
});

// Route to add multiple beds
router.post('/add-beds', async (req, res) => {
  const { room, floor, ward, count } = req.body;

  // Validate inputs
  if (!room || !floor || !count || isNaN(count) || count < 1) {
    req.flash('error', 'Room, floor, and count are required, and count must be a positive number.');
    return res.redirect('back');
  }

  try {
    // Generate bed numbers like "ROOM-1", "ROOM-2", etc.
    const existingBeds = await Bed.findAll({ where: { room } });
    const existingNumbers = existingBeds
      .map(bed => bed.bed_number.split('-')[1])
      .filter(num => !isNaN(num))
      .map(Number);

    let startNumber = 1;
    if (existingNumbers.length > 0) {
      startNumber = Math.max(...existingNumbers) + 1;
    }

    // Create beds in bulk
    const bedsToAdd = [];
    for (let i = 0; i < count; i++) {
      const bedNumber = `${room}-${startNumber + i}`;
      bedsToAdd.push({
        bed_number: bedNumber,
        room,
        floor,
        ward,
        status: 'available',
      });
    }

    await Bed.bulkCreate(bedsToAdd);
    req.flash('info', `Added ${count} beds to room ${room}`);
    res.redirect('back');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to add beds. Ensure bed numbers are unique.');
    res.redirect('back');
  }
});

module.exports = router;