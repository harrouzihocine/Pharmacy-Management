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
initiatereceiveDemand,
transferMedicamentsToInStock,
approvereceiveDemand

  } = require("../controller/demand");
  router.route("/demands/:serviceABV").get(isLoggedIn,isResponsableService,catchAsync(getDemandsPage));
  router.route("/initiateTransfer").post(isLoggedIn,isResponsableService,catchAsync(initiateTransfer));
  router.route("/demand-details/:demandId").get(isLoggedIn,isResponsableService,catchAsync(getDemandDetailsPage));
  router.route("/:demandId/transfer").get(isLoggedIn,isResponsableService,catchAsync(transferMedicamentsToInStock));
  router.route("/:demandId/approve").get(isLoggedIn,isResponsableService,catchAsync(approvereceiveDemand));
  router.route("/demand-details/reject").post(isLoggedIn,isResponsableService,catchAsync(rejectDemand));
  router.route("/:demandId").get(isLoggedIn,isResponsableService,catchAsync(getReceivedDemandPage)).post(isLoggedIn,isResponsableService,catchAsync(initiatereceiveDemand));
  router.route("/:serviceABV/newdemand").get(isLoggedIn,isResponsableService,catchAsync(getAddDemandPage)).post(isLoggedIn,isResponsableService,catchAsync(createDemand));

module.exports = router;
