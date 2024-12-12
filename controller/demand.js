const Demand = require('../models/demand'); 
const InStock = require('../models/inStock'); 
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
        const demands = await Demand.find()
        .populate("createdBy", "username") // Populate `createdBy` with the `name` field
        .select("-medicaments"); // Exclude `medicaments` from the response
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
exports.createDemand = async (req, res) => {
  try {
    const { source, destination, comment, Medicament, otherMedicaments } = req.body;
    const { serviceABV } = req.params;

    // Validate required fields
    if (!source || !destination || !Medicament) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Filter valid medicaments
    const medicaments = Object.values(Medicament)
      .filter((med) => med.medicamentId && med.quantity && med.priority)
      .map((med) => ({
        medicamentId: med.medicamentId,
        quantity: med.quantity,
        priority: med.priority,
      }));

    if (medicaments.length === 0) {
      return res.status(400).json({ message: 'No valid medicaments provided.' });
    }

    // Create and save the demand
    const newDemand = new Demand({
      source,
      destination,
      comment,
      medicaments,
      otherMedicaments,
      createdBy: req.user._id,
    });

    await newDemand.save();

    // Redirect to a success page or respond with a success message
    res.redirect('/demand/demands/' + serviceABV);
  } catch (error) {
    console.error('Error creating demand:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


  exports.getDemandDetailsPage = async (req, res) => {
    const { demandId } = req.params;
    try {
        // Fetch the demand with necessary population
        const demand = await Demand.findById(demandId)
            .populate("createdBy", "username") // Populate `createdBy` with the `username` field
            .populate("medicaments.medicamentId"); // Populate `medicamentId` with details

        // Access destination directly from the demand object
        const source = demand.source;
        console.log("Destination:", source); // Log the destination to debug

        if (!source) {
            return res.status(404).send({ message: "Destination not found." });
        }
        const sourceStock = await InStock.aggregate([
            {
              $lookup: {
                from: 'storages',
                localField: 'storageId',
                foreignField: '_id',
                as: 'storageDetails'
              }
            },
            { $unwind: '$storageDetails' },
            { $match: { 'storageDetails.service': source, quantity: { $gt: 0 } } },
            {
              $lookup: {
                from: 'medicaments',
                localField: 'medicamentId',
                foreignField: '_id',
                as: 'medicamentDetails'
              }
            },
            { 
              $sort: { 'expiryDate': 1 }  // Sorting by expiryDate in ascending order (1 for ascending, -1 for descending)
            },
            { 
              $project: { 
                medicamentId: 1, 
                quantity: 1, 
                batchNumber: 1,
                locationCode: 1,
                barcode: 1,
                expiryDate: 1 
              }
            }
          ]);
          
          
          

        // Filter out stocks where the `storageId` is null
        const filteredStock = sourceStock.filter(stock => stock.storageId !== null);

        // Send the filtered stock data as the response
        res.render('demand/demand-details', { demand, sourceStock: filteredStock });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

