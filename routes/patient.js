const express = require('express');
const { isLoggedIn,isAdmin,isPharmacienPrincipal, isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
    getPatientList,
    createPatient
  } = require("../controller/patient");
  router.route("/:serviceABV").get(isLoggedIn,isResponsableService,catchAsync(getPatientList));
  router.route("/").post(isLoggedIn,isResponsableService,catchAsync(createPatient));
  
module.exports = router;
