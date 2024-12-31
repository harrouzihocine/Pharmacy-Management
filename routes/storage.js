const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  isAdmin,
  isPharmacienPrincipal,
  isResponsableService,
  isAchteur,
} = require("../middleware/authMiddleware");
const {
  getStorage,
  addStorage,
  showAddStorageForm,
  getaddLocationsForm,
  assignLocationsToStorage,
  unassignLocation,
  serviceLocations,
  storageLocations,
  locationDetails,
} = require("../controller/storage");

router.route("/").get(isLoggedIn, isResponsableService, catchAsync(getStorage));
router
  .route("/new")
  .get(isLoggedIn, isPharmacienPrincipal, catchAsync(showAddStorageForm))
  .post(isLoggedIn, isPharmacienPrincipal, catchAsync(addStorage));
router
  .route("/:storageId/add-locations")
  .get(isLoggedIn, isResponsableService, catchAsync(getaddLocationsForm))
  .post(isLoggedIn, isResponsableService, catchAsync(assignLocationsToStorage));
router
  .route("/:storageId/unassign/:locationId")
  .get(isLoggedIn, isResponsableService, catchAsync(unassignLocation));
router
  .route("/:serviceId/storages")
  .get(isLoggedIn, isResponsableService, catchAsync(serviceLocations));
router
  .route("/:serviceId/:storageId")
  .get(isLoggedIn, isResponsableService, catchAsync(storageLocations));
router
  .route("/:serviceId/:storageId/:locationId")
  .get(isLoggedIn, isResponsableService, catchAsync(locationDetails));

module.exports = router;
