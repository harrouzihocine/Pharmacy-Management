const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  isLoggedIn,
  isAdmin,
  isPharmacienPrincipal,
  isResponsableService,
  isAchteur,
} = require("../middleware/authMiddleware");
const catchAsync = require("../utils/catchAsync");
const {
  addMedicamentToStorage,
  serviceLocations,
  StorageMedicaments,
  assignLocation,
  unassignLocation,
  stockDetails,
  serviceStockDetails,
  getMedicamentsByService,
  getMedicamentsdetailsByService,
  medicamentSettings,
  updateBarCode,
  getExpiredMedicamentsByService,
} = require("../controller/inStock");
router
  .route("/:serviceId/storages")
  .get(isLoggedIn, isResponsableService, catchAsync(serviceLocations));
router
  .route("/stock-details/:medicamentId")
  .get(isLoggedIn, isResponsableService, catchAsync(stockDetails));
router
  .route("/service/stock-details/:serviceABV")
  .get(isLoggedIn, isResponsableService, catchAsync(serviceStockDetails));
router
  .route("/service/:serviceABV")
  .get(isLoggedIn, isResponsableService, catchAsync(getMedicamentsByService));
router
  .route("/service/expired/:serviceABV")
  .get(
    isLoggedIn,
    isResponsableService,
    catchAsync(getExpiredMedicamentsByService)
  );
router
  .route("/service/medicament-details/:serviceABV/:medicamentId")
  .get(
    isLoggedIn,
    isResponsableService,
    catchAsync(getMedicamentsdetailsByService)
  );
router
  .route("/service/medicament-details/settings")
  .post(isLoggedIn, isResponsableService, catchAsync(medicamentSettings));

router
  .route("/")
  .post(isLoggedIn, isResponsableService, catchAsync(addMedicamentToStorage));
router
  .route("/:storageId")
  .get(isLoggedIn, isResponsableService, catchAsync(StorageMedicaments));
router
  .route("/assign-location/:itemId")
  .post(isLoggedIn, isResponsableService, catchAsync(assignLocation));
router
  .route("/remove-medicament/:itemId")
  .post(isLoggedIn, isResponsableService, catchAsync(unassignLocation));
router
  .route("/updateBarCode")
  .post(isLoggedIn, isResponsableService, catchAsync(updateBarCode));

module.exports = router;
