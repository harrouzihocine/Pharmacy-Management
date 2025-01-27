const express = require('express');
const { isLoggedIn,isAdmin,isPharmacienPrincipal,isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
    getadmissionspage,
    createAdmission
  } = require("../controller/admission");
  router.route("/:patientId").get(isLoggedIn,isResponsableService,catchAsync(getadmissionspage))
  .post(isAdmin,isResponsableService,catchAsync(createAdmission));
 
module.exports = router;
