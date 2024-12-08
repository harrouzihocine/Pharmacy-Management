const express = require('express');
const router = express.Router({ mergeParams: true });
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
   
  } = require("../controller/inStock");
router.route("/:serviceId/storages").get(catchAsync(serviceLocations));
router.route("/stock-details/:medicamentId").get(catchAsync(stockDetails));
router.route("/service/stock-details/:serviceABV").get(catchAsync(serviceStockDetails));
router.route("/service/:serviceABV").get(catchAsync(getMedicamentsByService));
router.route("/service/medicament-details/:serviceABV/:medicamentId").get(catchAsync(getMedicamentsdetailsByService));
router.route("/service/medicament-details/settings").post(catchAsync(medicamentSettings));

router.route("/").post(catchAsync(addMedicamentToStorage));
router.route("/:storageId").get(catchAsync(StorageMedicaments));
router.route("/assign-location/:itemId").post(catchAsync(assignLocation));
router.route("/remove-medicament/:itemId").post(catchAsync(unassignLocation));
router.route("/updateBarCode").post(catchAsync(updateBarCode));


module.exports = router;