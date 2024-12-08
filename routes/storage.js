const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");

const {
    getStorage,
    addStorage,
    showAddStorageForm,
    getAssignLocationsForm,
    assignLocationsToStorage ,
    unassignLocation,
    serviceLocations,
    storageLocations,
    locationDetails
} = require("../controller/storage");



router.route("/").get(catchAsync(getStorage));
router.route("/new").get(catchAsync(showAddStorageForm)).post(catchAsync(addStorage));
router.route("/:storageId/assign-locations").get(catchAsync(getAssignLocationsForm)).post(catchAsync(assignLocationsToStorage ));
router.route("/:storageId/unassign/:locationId").get(catchAsync(unassignLocation));
router.route("/:serviceId/storages").get(catchAsync(serviceLocations));
router.route("/:serviceId/:storageId").get(catchAsync(storageLocations));
router.route("/:serviceId/:storageId/:locationId").get(catchAsync(locationDetails));

module.exports = router;