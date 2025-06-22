const express = require("express");
const router = express.Router();
const { isLoggedIn,isAdmin,isPharmacienPrincipal, isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const {
    getAllDispensings,
    createDispensing,
    getSessionDispensings,
    createSessionDispensings,
    deleteDispensing,
    processScan
} = require("../controller/dispensing");
router
  .route("/:serviceABV")
  .get(isLoggedIn,isResponsableService, catchAsync(getAllDispensings));

  router
  .route("/:serviceABV/new")
  .get(isLoggedIn,isPharmacienPrincipal, catchAsync(createDispensing));

router
  .route("/delete/:dispensingId")
  .post(isLoggedIn,isResponsableService, catchAsync(deleteDispensing));

router
  .route("/:serviceABV/:dispensingId")
  .get(isLoggedIn,isResponsableService, catchAsync(getSessionDispensings))
  .post(isLoggedIn,isPharmacienPrincipal, catchAsync(createSessionDispensings));

router
  .route("/:serviceABV/:dispensingId/scan")
  .post(isLoggedIn, isResponsableService, catchAsync(processScan));
  

module.exports = router;
