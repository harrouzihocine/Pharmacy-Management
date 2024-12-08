const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");

const {
  getSelectedMedicaments,
  selectMedicament,
  unselectMedicament,
  settingsMedicament,
     
  } = require("../controller/pharmacy");
  router.route("/").get(catchAsync(getSelectedMedicaments));

  router.route("/select").post(catchAsync(selectMedicament));
  router.route("/unselect").post(catchAsync(unselectMedicament));
  router.route("/settings").post(catchAsync(settingsMedicament));
  


module.exports = router;
