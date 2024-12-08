const Medicament = require('../models/medicament');
const xlsx = require('xlsx');
// Display all medications
exports.showAllMedicaments = async (req, res) => {
    try {
        const medicaments = await Medicament.find();
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
            numero_enregistrement_pch: row['N°ENREGISTREMENT (PCH)'],
            code_pch: row['CODE (PCH)'],
            dci_pch: row['DCI (PCH)'],
            designation: row['Désignation'],
            type_medicament: row['Type de Médicament'],
            nbre_article_commun: row['Nbre article commun'],
            code_interne: row['Code interne'], // Should be unique
            forme: row['Forme'],
            dosage: row['Dosage'],
            nom_commercial: row['NOM COMMERCIAL ou LABO']
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
