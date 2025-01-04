const InStock = require("../models/inStock");
const Prescription = require("../models/prescription");
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

exports.getServicePrescriptionPage = async (req, res) => {
  const { serviceABV } = req.params;

  // Find the service by ABV (serviceAbbreviation)
  const service = services.find(s => s._id === serviceABV);

  if (!service) {
    return res.status(404).send({ message: "Service not found." });
  }

  try {
    // Use the service name (from serviceABV) to filter in both destination and source fields
    const demands = await Prescription.find({serviceABV:serviceABV}).populate("createdBy", "username");
  
    res.render("demand/index", { demands, serviceABV });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
exports.getCreatePrescriptionPage = async (req, res) => {
  const  patientId  = req.params.patientId;
  const serviceABV = req.params.serviceABV;
  const patient = await Patient.findById(patientId);
   const medicaments = await InStock.find()
            .populate({
              path: "storageId",
              match: { serviceABV }, // Filter by serviceABV during population
              select: "serviceABV", // Only fetch serviceABV field
            }).populate('medicamentId')
            .exec();
      console.log(serviceABV);
    res.render("Prescription/new", { medicaments,patient,serviceABV });
  
};