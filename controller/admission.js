const InStock = require("../models/inStock");
const Storage = require("../models/storage");
const Admission = require("../models/admission");
const Patient = require("../models/patient");
const moment = require("moment");
const services = [
  { _id: 'PCS', name: 'Pharmacie centrale' },
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
exports.getadmissionspage = async (req, res) => {
    const { patientId } = req.params;
   const{serviceABV} = req.query;
  try {
    const admissions = await Admission.find({ patientId: patientId })
    .populate("patientId")
    .sort({ date: -1 }); // -1 for descending order (newest to oldest)
     const patient = await Patient.findById(patientId);
     const admissionDate = moment().format('YYYY-MM-DD');
     res.render("Admission/index", { admissions,moment,patient,admissionDate,serviceABV });
   } catch (err) {
     res.status(500).send({ message: err.message });
   }
 
};
exports.createAdmission = async (req, res) => {
    const { patientId } = req.params;
    const { date, acte, admissionType, service, status,pharmacyserviceABV } = req.body;
    const{serviceABV} = req.query;
  try {
  
     const newAdmission = new Admission({
        patientId, 
        date,
        acte,
        admissionType,
        service,
        pharmacyserviceABV,
        createdBy: req.user._id,
        status: "Pending",
      });
      await newAdmission.save();
      res.redirect("/admission/"+patientId+"?serviceABV="+serviceABV);
  
   } catch (err) {
     res.status(500).send({ message: err.message });
   }
 
};
