const Medicament = require('../models/medicament');
const xlsx = require('xlsx');
// Display all medications
exports.showAllMedicaments = async (req, res) => {
    try {
      const medicaments = await Medicament.find().sort({ code_interne: 1 }); 
      res.render('medicament/index', { medicaments });
      
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

module.exports.showUpLoadMedicamentsForm = (req, res) => {
    res.render("medicament/upload"); // Ensure you have a `register.ejs` file
  };

// Import medications from a CSV file
module.exports.importMedicaments = async (req, res, next) => {
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
  
      // Iterate over the rows and create Medicament documents
      const medicamentPromises = data.map(async (row) => {
        const medicament = new Medicament({
          code_interne: row['Code interne'],
            code_pch: row['CODE (PCH)'],
            designation: row['Désignation'],
            type_medicament: row['Type de Médicament'],
            forme: row['Forme'],
            boite_de: row['Boite de'],
          });
  
        // Save each medicament to the database
        await medicament.save();
      });
  
      // Wait for all the medicaments to be saved
      await Promise.all(medicamentPromises);
  
      // Send a success response
      res.redirect('/medicament'); // Redirect to a page to display the medicaments
    } catch (error) {
      next(error); // Pass error to the error handler
    }
  };

// Controller to handle editing a Medicament
exports.editMedicament = async (req, res) => {
  const medicamentId = req.params.medicamentId; // Get Medicament ID from URL
  const {
    code_pch,
    designation,
    nom_commercial,
    type_medicament,
    forme,
    boite_de,
    
  } = req.body; // Destructure form fields from request body

  try {
    // Find the medicament by ID and update its values
    const updatedMedicament = await Medicament.findByIdAndUpdate(
      medicamentId,
      {
        code_pch,
        designation,
        nom_commercial,
        type_medicament,
        forme,
        boite_de,
       
      },
      { new: true, runValidators: true } // Return updated document and validate data
    );

    if (!updatedMedicament) {
      return res.status(404).send("Medicament not found");
    }

    // Redirect to a success page or reload current page
    res.redirect(`/medicament/${medicamentId}`); // Adjust the redirection path as needed
  } catch (error) {
    console.error("Error updating Medicament:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.addMedicament = async (req, res) => {
  const {
    code_pch,
    designation,
    nom_commercial,
    type_medicament,
    forme,
    boite_de,
  } = req.body; // Destructure form fields from request body

  try {
    // Find the latest code_interne number from the Medicament collection
    const lastMedicament = await Medicament.findOne().sort({ code_interne: -1 }).exec();

    // Determine the next code_interne by incrementing the last one by 1 (or starting from 1 if no records exist)
    const nextCodeInterne = lastMedicament ? lastMedicament.code_interne + 1 : 1;

    // Create a new medicament using the data from the form
    const newMedicament = new Medicament({
      code_pch,
      designation,
      nom_commercial,
      type_medicament,
      forme,
      boite_de,
      code_interne: nextCodeInterne, // Assign the next available code_interne
    });

    // Save the new medicament to the database
    await newMedicament.save();

    // Redirect to the medicament list page or a success page
    res.redirect("/medicament"); // Adjust the redirection path as needed
  } catch (error) {
    console.error("Error adding Medicament:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.medicamentDetails = async (req, res) => {
  try {
    const medicament = await Medicament.findById(req.params.medicamentId);
    if (!medicament) {
        return res.status(404).send('Medicament not found');
    }
    res.render('Medicament/medicament-details', { medicament });
} catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
}
  
};