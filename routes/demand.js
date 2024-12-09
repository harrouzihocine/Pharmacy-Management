const express = require('express');
const { isLoggedIn, isAdmin, isTechnician } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
   getDemandsPage,
   getAddDemandPage,
   CreateDemand,
   
  } = require("../controller/demand");
  router.route("/demands/:serviceABV").get(catchAsync(getDemandsPage));
  router.route("/:serviceABV/newdemand").get(catchAsync(getAddDemandPage));
  
module.exports = router;
