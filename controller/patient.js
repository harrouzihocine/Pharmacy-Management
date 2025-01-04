const Patient = require("../models/patient");

const services = [
  { _id: "APP", name: "Approvisionnement" },
  { _id: "CON", name: "Consultations" },
  { _id: "RAD", name: "Radiologie" },
  { _id: "LAM", name: "Laboratoire d'analyse médicale" },
  { _id: "LAP", name: "Laboratoire d'anatomie-pathologique" },
  { _id: "HMU", name: "Hospitalisation multidisciplinaire" },
  { _id: "HCA", name: "Hospitalisation de cardiologie" },
  { _id: "URG", name: "Urgences médicales" },
  { _id: "BOP", name: "Blocs opératoires" },
  { _id: "CAT", name: "Cathétérisme" },
  { _id: "REA", name: "Réanimation" },
  { _id: "MIN", name: "Médecine Interne" },
  { _id: "MPR", name: "Médecine physique et réadaptation" },
  { _id: "DAF", name: "Direction administrative et finance" },
];

exports.getPatientList = async (req, res) => {
  const { serviceABV } = req.params;



  try {
    const patients = await Patient.find();

    res.render("Patient/index", { patients, serviceABV });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
exports.createPatient = async (req, res) => {
    const {patient} = req.body;
    try {
      // Create a new patient document from the request body
      const newPatient = new Patient({
        first_name: patient.firstName,
        last_name: patient.lastName,
        date_of_birth: patient.birthdate,
        gender: patient.gender,
        address: patient.address || '',  // Default to empty string if address is not provided
        phone: patient.phone || '',  // Default to empty string if phone is not provided
      });
  
      // Save the new patient to the database
      await newPatient.save();
  
      // Respond with a success message
      req.flash("success", "Patient is created successfully");
      return res.redirect("back");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding patient", error: error.message });
    }
  };
  