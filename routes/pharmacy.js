const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn,isAdmin,isPharmacienPrincipal, isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const {
  getSelectedMedicaments,
  selectMedicament,
  unselectMedicament,
  settingsMedicament,
 
  } = require("../controller/pharmacy");
  router.route("/").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getSelectedMedicaments));
  router.route("/select").post(isLoggedIn,isPharmacienPrincipal,catchAsync(selectMedicament));
  router.route("/unselect").post(isLoggedIn,isPharmacienPrincipal,catchAsync(unselectMedicament));
  router.route("/settings").post(isLoggedIn,isPharmacienPrincipal,catchAsync(settingsMedicament));

  


module.exports = router;
