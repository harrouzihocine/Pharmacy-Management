const express = require('express');
const { isLoggedIn,isAdmin,isPharmacienPrincipal,isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const {
    getNewPurchaseRequestPage,
    getPurshaseRequestPage,
    createPurchaseRequest,
    validatePurchaseRequest,
    cancelPurchaseRequest

  } = require("../controller/achat");
  router.route("/demands").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getPurshaseRequestPage));
  router.route("/demands/new").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getNewPurchaseRequestPage))
  .post(  isLoggedIn,isPharmacienPrincipal,catchAsync(createPurchaseRequest));
  router.route("/demands/:requestId").get( isLoggedIn,isPharmacienPrincipal,catchAsync(validatePurchaseRequest))
  router.route("/demands/validate/:requestId").get( isLoggedIn,isPharmacienPrincipal,catchAsync(validatePurchaseRequest))
  router.route("/demands/cancel/:requestId").get( isLoggedIn,isPharmacienPrincipal,catchAsync(cancelPurchaseRequest))
module.exports = router;
