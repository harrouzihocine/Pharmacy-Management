const express = require('express');
const { isLoggedIn,isAdmin,isPharmacienPrincipal, isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
   getDemandsPage,
   getAddDemandPage,
   getDemandDetailsPage,
   createDemand,
   initiateTransfer,
   rejectDemand,
getReceivedDemandPage,
receiveDemand
  } = require("../controller/demand");
  router.route("/demands/:serviceABV").get(isLoggedIn,isResponsableService,catchAsync(getDemandsPage));
  router.route("/initiateTransfer").post(isLoggedIn,isResponsableService,catchAsync(initiateTransfer));
  router.route("/demand-details/:demandId").get(isLoggedIn,isResponsableService,catchAsync(getDemandDetailsPage));
  router.route("/demand-details/reject").post(isLoggedIn,isResponsableService,catchAsync(rejectDemand));
  router.route("/:demandId").get(isLoggedIn,isResponsableService,catchAsync(getReceivedDemandPage)).post(isLoggedIn,isResponsableService,catchAsync(receiveDemand));
  router.route("/:serviceABV/newdemand").get(isLoggedIn,isResponsableService,catchAsync(getAddDemandPage)).post(isLoggedIn,isResponsableService,catchAsync(createDemand));

module.exports = router;
