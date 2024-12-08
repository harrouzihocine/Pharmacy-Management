const express = require("express");
const upload = require('../middleware/upload'); // Import the Multer middleware
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const path = require('path');
const multer = require("multer");
const {
  showCreationForm,
  createLocation,
  showLocations,
  showUploadLocationsForm,
  importLocations 
} = require("../controller/location");



router
.route("/").get(catchAsync(showLocations));
//show upload page
router
.route("/upload").get(catchAsync(showUploadLocationsForm));
router
  .route("/new")
  .get(catchAsync(showCreationForm))
  .post(catchAsync(createLocation));
  
  //import the location from excel
  router
  .route('/import_emplacement')
  .post(upload.single('file'), catchAsync(importLocations));
 
  //download the templated location
router.get('/download-template', (req, res) => {
  const filePath = path.join(__dirname, '../public/templates/locations_template.xlsx');
  res.download(filePath, 'locations_template.xlsx', (err) => {
    if (err) {
      console.error('Error downloading the file:', err);
      res.status(500).send('Error downloading the template.');
    }
  });
});


module.exports = router;
