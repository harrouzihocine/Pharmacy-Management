const express = require('express');
const { isLoggedIn, isAdmin, isTechnician } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
   getDemandsPage,
   getAddDemandPage,
   getDemandDetailsPage,
   createDemand,
   
  } = require("../controller/demand");
  router.route("/demands/:serviceABV").get(catchAsync(getDemandsPage));
  router.route("/demand-details/:demandId").get(catchAsync(getDemandDetailsPage));
  router.route("/:serviceABV/newdemand").get(catchAsync(getAddDemandPage)).post(catchAsync(createDemand));
  
module.exports = router;
