const Location = require("../models/location");

const xlsx = require("xlsx");

// ===================================== Register Page (GET) =================================
module.exports.showCreationForm = (req, res) => {
  res.render("Location/new"); // Ensure you have a `register.ejs` file
};
module.exports.createLocation = async (req, res) => {
    try {
      const {
        locationType,
        destinationService,
        endroitCode,
        endroitDescription,
        outilRangement,
        outilNumero,
        bloc,
        niveauRayon,
      } = req.body;
      // Generate locationCode based on input
      let locationCode = `${locationType}-${destinationService}${endroitCode}`;
  
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
  
      // Check if the location already exists
      const existingLocation = await Location.findOne({ locationCode });
      if (existingLocation) {
        return res.status(409).json({ error: "Le code d'emplacement existe déjà." });
      }
  
      // Create the new location
      const newLocation = new Location({
        locationCode,
        locationType,
        destinationService,
        endroitCode,
        endroitDescription,
        outilRangement,
        outilNumero,
        bloc: outilRangement === "RY" ? bloc : null,
        niveauRayon: outilRangement === "RY" ? niveauRayon : null,
      });
  
      // Save the location to the database
      await newLocation.save();
  
      // Return success response
      return res.redirect('/location');
    } catch (error) {
      console.error("Erreur lors de la création de l'emplacement:", error);
      return res.render('Location/index');
    }
  };
  module.exports.showLocations = async (req, res) => {
    try {
      const locations = await Location.find(); // Fetch all locations from the database
      res.render('Location/index', { locations }); // Pass the data to the EJS view
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  module.exports.showUploadLocationsForm = (req, res) => {
    res.render("Location/upload"); // Ensure you have a `register.ejs` file
  };
 
  // Function to handle the import of emplacement from Excel file
module.exports.importLocations = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read the uploaded Excel file
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Read the first sheet
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet to a JSON object
    const data = xlsx.utils.sheet_to_json(sheet);

    // Iterate over the rows and create Location documents
    const locationPromises = data.map(async (row) => {
      const location = new Location({
        locationCode: row.locationCode,
        locationType: row.locationType,
        destinationService: row.destinationService,
        endroitCode: row.endroitCode,
        endroitDescription: row.endroitDescription,
        outilRangement: row.outilRangement,
        outilNumero: row.outilNumero,
        bloc: row.bloc || null, // Optional field
        niveauRayon: row.niveauRayon || null, // Optional field
      });

      // Save each location to the database
      await location.save();
    });

    // Wait for all the locations to be saved
    await Promise.all(locationPromises);

    // Send a success response
    res.redirect('/location');
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};