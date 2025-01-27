const Location = require("../models/location");
const Storage = require("../models/storage");
const InStock = require("../models/inStock");
const User = require("../models/user");
const endroits = [
  "Local-1_G : Côté gauche du couloir sous-sol",
  "Local-2_D : Côté gauche du couloir sous-sol",
  "Zone tampon : entre les deux locaux",
  "Local-3 : Côté droite du couloir sous-sol",
  "Zone tampon : Bureau responsable appro.",
  "Local : couloir sous-sol",
  "Salle des analyses médicales",
  "Salle de prélèvement",
  "Laboratoire bactériologie : couloir sous-sol",
  "Local de pharmacie de service",
  "Chambre d'hospitalisation cardiologie N°….",
  "Bureau N° 9 : Couloir de consultations",
  "Bloc septique",
  "Salle de consultations",
  "Salle déchoquage 1",
  "Salle déchoquage 2",
  "Salle d'attente IRM",
  "Bureau responsable de service",
  "Couloir des urgences / blocs opératoires",
  "Local de stock de service : sous-pente",
  "Salle de stérilisation",
  "Local de produits d'orthopédie",
  "Salle de réanimation",
  "Salle de chirurgie 1",
  "Salle de chirurgie 2",
  "Salle de cathétérisme",
  "Bureau N° 3 : Couloir de consultations",
  "Sous-sol",
  "Bureau du DAF",
  "Bureau des archives du DAF"
]

const services = [
  { _id: 'PCS', name: 'Pharmacie centrale' },
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
// Add a new storage,
exports.addStorage = async (req, res, next) => {
    try {
      const { service,endroitDescription,endroitCode,serviceABV,storageName,  locationType } = req.body;
      const storage = new Storage({ service,endroitDescription,endroitCode,serviceABV,storageName, locationType });
      await storage.save();
      return res.redirect('/storage');
    } catch (error) {
      next(error);
    }
  };
  // Get all depots
  exports.getStorage = async (req, res, next) => {
    try {
      const userServices = req.user.services.map(service => service.serviceABV); // Get user's accessible service abbreviations
  
      // Step 1: Fetch storage data
      const storageData = await Storage.aggregate([
        {
          $match: { serviceABV: { $in: userServices } } // Filter by user's services
        },
        {
          $group: {
            _id: "$service", // Group by service name
            storageCount: { $sum: 1 }, // Count storages per service
            serviceABV: { $first: "$serviceABV" }, // Include serviceABV
            locationType: { $first: "$locationType" }, // Include locationType
            serviceId: { $first: "$_id" } // Include service ID
          }
        }
      ]);
  
      // Step 2: Find InStock data
        const inStockData = await InStock.find()
                .populate({
                  path: "storageId",
                  select: "serviceABV", // Only fetch serviceABV field
                })
                .exec(); // Populate storageId to get the associated serviceABV
      console.log(inStockData)
      // Initialize a map to store expired counts by serviceABV
      const expiredMap = {};
  
      // Step 3: Check expiration status for each InStock item
      for (const stock of inStockData) {
        const expirationStatus = await stock.getExpirationStatus();
        
       
  
        if (expirationStatus === "Expired" || expirationStatus === "Expiring Soon") {
          const serviceABV = stock.storageId.serviceABV; // Get the serviceABV from populated storageId
          
         
  
          // Count expired/expiring soon items per serviceABV
          if (!expiredMap[serviceABV]) {
            expiredMap[serviceABV] = 0;
          }
          expiredMap[serviceABV]++;
        }
      }
  
      // Step 4: Combine storageData with expired medicament counts
      const fullServiceData = storageData.map(storage => ({
        ...storage,
        expiredCount: expiredMap[storage.serviceABV] || 0 // Default to 0 if no expired medicaments
      }));
  
  // Step 5: Sort the services by service name (or serviceABV)
  fullServiceData.sort((a, b) => a._id.localeCompare(b._id)); // Sort by service name (_id), or use a.serviceABV if you want to sort by abbreviation
      // Render the services with notification counts
      res.render("Storage/index", { services: fullServiceData });
    } catch (error) {
      console.error("Error fetching storage data:", error);
      next(error); // Pass errors to middleware
    }
  };
  
  

    // Get add form
exports.showAddStorageForm = async (req, res, next) => {
   
      res.render('Storage/new', { services: services, endroits: endroits }); 
   
  };
  exports.unassignLocation = async (req, res) => {
    const { locationId,storageId } = req.params;
    console.log(locationId, storageId);
   
    // Remove the location ID from the Storage's locations array
    await Storage.updateOne(
      { _id: storageId }, // Target the specific storage by ID
      { $pull: { locations: { _id: locationId } } } // Remove the object matching locationCode
    );

    res.redirect("back");
  };
  exports.getaddLocationsForm = async (req, res) => {
    try {
      const { storageId } = req.params;
      // Get the storage by its ID
      const storage = await Storage.findById(storageId);
      
      // Get all locations that are not already assigned to this storage
       const locations = await Location.find({ assignedStorage: null }); 
  
      res.render('Storage/addLocations', { storage, locations });
    } catch (err) {
      console.log(err);
      res.status(500).send("Error fetching storage or locations");
    }
  };
 // Inside the route where you assign locations to storage
 exports.assignLocationsToStorage = async (req, res, next) => {
    try {
        const { storageId } = req.params;
        const {
          outilRangement,
          outilNumero,
          bloc,
          niveauRayon,
        } = req.body;
        const storage = await Storage.findById(storageId);
        // Generate locationCode based on input
      let locationCode = `${storage.locationType}-${storage.serviceABV}${storage.endroitCode}`;

      if (outilRangement === "RY") {
        if (!bloc || !niveauRayon) {
          return res.status(400).json({
            error: "Veuillez fournir les détails du rayonnage (numéro, bloc, niveau).",
          });
        }
        locationCode += `-RY${outilNumero}-${bloc}${niveauRayon}`;
      } else {
        if (!outilNumero) {
          return res.status(400).json({ error: "Veuillez fournir le numéro de l'outil de rangement." });
        }
        locationCode += `-${outilRangement}${outilNumero}`;
      }
       // Prepare the new location object
    const newLocation = {
      locationCode,
      outilRangement,
      outilNumero,
      bloc,
      niveauRayon,
    };

    // Push the new location to the locations array in the storage document
    storage.locations.push(newLocation);

    // Save the updated storage document
    await storage.save();
        // Redirect to the storage details page
        res.redirect(`back`);
    } catch (err) {
        console.error("Error assigning locations:", err);
        res.status(500).send("Error assigning locations");
    }
};

  
  

module.exports.serviceLocations = async (req, res, next) => {
    const { serviceId } = req.params;

  try {
    // Fetch storages for the selected service
    const storages = await Storage.find({ serviceABV: serviceId });
       // Calculate the number of locations for each storage
       const storagesWithCounts = storages.map(storage => ({
        ...storage.toObject(), // Convert Mongoose document to plain object
        locationCount: storage.locations.length, // Count the number of locations
      }));
  
    // Render the storages view, passing the storages and the service name
    res.render('storage/serviceStorages', { storages: storagesWithCounts, serviceId });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
  };
  module.exports.storageLocations = async (req, res, next) => {
    const { serviceId, storageId } = req.params;
  
    try {
      // Fetch the storage details by storageId and populate the 'locations' field
      const storage = await Storage.findById(storageId);
      
    
  
      if (storage) {

        // Render the storage with its locations
        res.render('Storage/storageLocations', { storage, serviceId });
      } else {
        res.status(404).send('Storage not found');
      }
    } catch (err) {
      console.error("Error fetching storage or populating locations: ", err);
      res.status(500).send('Server Error');
    }
  };
  exports.locationDetails = async (req, res, next) => {
    try {
      const { serviceId, storageId, locationId } = req.params;
  
      // Fetch the storage and location details (if needed)
      const storage = await Storage.findById(storageId);
      const location = storage.locations.id(locationId); 
  
      if (!location) {
        return res.status(404).send('Location not found.');
      }
  
      // Fetch medicaments for this location
      const medicaments = await InStock.find({ locationCode: location.locationCode })
        .populate('medicamentId')
        .exec();
  
      // Render a page to display medicaments
      res.render('storage/locationDetails', {
        serviceId,
        storage,
        location,
        medicaments,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error.');
    }
};