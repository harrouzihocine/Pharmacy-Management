const express = require("express");
const {
  isLoggedIn,
  isAdmin,
  isPharmacienPrincipal,
  isResponsableService,
  isAchteur,
} = require("../middleware/authMiddleware");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
  getServicePrescriptionPage,
  getCreatePrescriptionPage,
  createPrescription,
  getPrescriptionsPage,
  getPrescriptiondetailsPage,
  distockMedicaments,
  distockedMedicamentsDetails,
  ActivateMedicament
} = require("../controller/prescription");
router
  .route("/demands/:serviceABV")
  .get(
    isLoggedIn,
    isResponsableService,
    catchAsync(getServicePrescriptionPage)
  );
  router
  .route("/details/:prescriptionId")
  .get(
    isLoggedIn,
    isResponsableService,
    catchAsync(getPrescriptiondetailsPage));

router
  .route("/medicaments/:medicamentId")
  .post(isLoggedIn, isResponsableService, catchAsync(distockMedicaments));

router
  .route("/:patientId/:admissionId")
  .get(isLoggedIn, isResponsableService, catchAsync(getCreatePrescriptionPage))
  .post(isLoggedIn, isResponsableService, catchAsync(createPrescription));
 
router
  .route("/prescriptions/:patientId/:admissionId")
  .get(isLoggedIn, isResponsableService, catchAsync(getPrescriptionsPage));

router
  .route("/dispensements/:prescriptionId/:medicamentId")
  .get(isLoggedIn, isResponsableService, catchAsync(distockedMedicamentsDetails));
  router
  .route("/medicaments/delete/:prescriptionId/:medicamentId")
  .get(isLoggedIn, isResponsableService, catchAsync(ActivateMedicament));
module.exports = router;
