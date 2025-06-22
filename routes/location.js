const express = require("express");
const upload = require("../middleware/upload"); // Import the Multer middleware
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  isAdmin,
  isPharmacienPrincipal,
  isResponsableService,
  isAchteur,
} = require("../middleware/authMiddleware");
const path = require("path");
const multer = require("multer");
const {
  showCreationForm,
  createLocation,
  showLocations,
  showUploadLocationsForm,
  importLocations,
} = require("../controller/location");

router.route("/").get( isLoggedIn, isResponsableService,catchAsync(showLocations));
//show upload page
router.route("/upload").get(isLoggedIn, isResponsableService,catchAsync(showUploadLocationsForm));
router
  .route("/new")
  .get(isLoggedIn, isResponsableService,catchAsync(showCreationForm))
  .post(isLoggedIn, isResponsableService,catchAsync(createLocation));

//import the location from excel
router
  .route("/import_emplacement")
  .post(upload.single("file"), catchAsync(importLocations));

//download the templated location
router.get("/download-template", (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public/templates/locations_template.xlsx"
  );
  res.download(filePath, "locations_template.xlsx", (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      res.status(500).send("Error downloading the template.");
    }
  });
});

module.exports = router;
