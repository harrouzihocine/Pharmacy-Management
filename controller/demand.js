const Demand = require('../models/demand'); 
const Pharmacy = require('../models/pharmacy'); 
const services = [
    { _id: 'APP', name: 'Approvisionnement' },
    { _id: 'CON', name: 'Consultations' },
    { _id: 'RAD', name: 'Radiologie' },
    { _id: 'LAM', name: "Laboratoire d'analyse médicale" },
    { _id: 'LAP', name: "Laboratoire d'anatomie-pathologique" },
    { _id: 'HMU', name: 'Hospitalisation multidisciplinaire' },
    { _id: 'HCA', name: 'Hospitalisation de cardiologie' },
    { _id: 'URG', name: 'Urgences médicales' },
    { _id: 'BOP', name: 'Blocs opératoires' },
    { _id: 'CAT', name: 'Cathétérisme' },
    { _id: 'REA', name: 'Réanimation' },
    { _id: 'MIN', name: 'Médecine Interne' },
    { _id: 'MPR', name: 'Médecine physique et réadaptation' },
    { _id: 'DAF', name: 'Direction administrative et finance' },
  ];

exports.getDemandsPage = async (req, res) => {
    const {serviceABV} = req.params;
    try {
        const demands = await Demand.find();
        res.render('demand/index', { demands,serviceABV });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
exports.getAddDemandPage = async (req, res) => {
    const {serviceABV} = req.params;
    try {
        const Medicaments = await Pharmacy.find().populate("medicamentId");
       
        res.render('demand/new-demand', { Medicaments,serviceABV,services: services });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
