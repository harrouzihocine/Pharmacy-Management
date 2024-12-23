const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const upload = require('../middleware/upload'); // Import the Multer middleware
const path = require('path');
const {
    importMedicaments,
    showAllMedicaments,
    showUpLoadMedicamentsForm,
    addMedicament,
    editMedicament,
    medicamentDetails
    
  } = require("../controller/medicament");
router.route("/").get(catchAsync(showAllMedicaments)).post(catchAsync(addMedicament));

// Route to import medications

router
.route('/importMedicaments')
.post(upload.single('file'), catchAsync(importMedicaments));
router.route("/upload").get(catchAsync(showUpLoadMedicamentsForm));
router.route("/:medicamentId").get(catchAsync(medicamentDetails)).post(catchAsync(editMedicament));

router.get('/downloadTemplate', (req, res) => {
    const filePath = path.join(__dirname, '../public/templates/medicaments_template.xlsx');
    res.download(filePath, 'medicaments_template.xlsx', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('Error downloading the template.');
      }
    });
  });
module.exports = router;