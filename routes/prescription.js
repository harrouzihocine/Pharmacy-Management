const express = require('express');
const { isLoggedIn,isAdmin,isPharmacienPrincipal, isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
    getServicePrescriptionPage,
    getCreatePrescriptionPage
  } = require("../controller/prescription");
  router.route("/demands/:serviceABV").get(isLoggedIn,isResponsableService,catchAsync(getServicePrescriptionPage));
  router.route("/:serviceABV/:patientId").get(isLoggedIn,isResponsableService,catchAsync(getCreatePrescriptionPage));
  
module.exports = router;
