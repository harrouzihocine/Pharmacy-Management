const express = require('express');
const { isLoggedIn,isAdmin,isPharmacienPrincipal,isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const upload = require("../middleware/upload");
const router = express.Router();
const {
    getNewPurchaseRequestPage,
    getPurshaseRequestPage,
    createPurchaseRequest,
    getPurchaseRequestDetailsPage,
    validatePurchaseRequest,
    cancelPurchaseRequest,
    deleteitemPurchaseRequest,
    getApprovisionementPage,
    getApprovisionementDemandsPage,
    getApprovisionementDemandDetailsPage,
    getNewFactureProformaPage,
    createFromEmptyFactureProforma,
    createFactureProforma,
    getFactureProformaPage,
    getFactureProformaDetailsPage,
    cancelFactureProforma,
    getBCPage,
    createBC,
    addAttachments,
    getAttachments,
    createBCFromDemand,
    getBCDetailsPage,
    updateStatusBC

  } = require("../controller/achat");
  router.route("/").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getApprovisionementPage));
  router.route("/demands").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getPurshaseRequestPage));
  router.route("/demands/new").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getNewPurchaseRequestPage))
  .post(  isLoggedIn,isPharmacienPrincipal,catchAsync(createPurchaseRequest));
  router.route("/demands/:requestId").get( isLoggedIn,isPharmacienPrincipal,catchAsync(validatePurchaseRequest))
  router.route("/demands/details/:requestId").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getPurchaseRequestDetailsPage))
  router.route("/demands/validate/:requestId").get( isLoggedIn,isPharmacienPrincipal,catchAsync(validatePurchaseRequest))
  router.route("/demands/cancel/:requestId").get( isLoggedIn,isPharmacienPrincipal,catchAsync(cancelPurchaseRequest))
  router.route("/demands/delete/:requestId/:itemId").delete( isLoggedIn,isPharmacienPrincipal,catchAsync(deleteitemPurchaseRequest))
  router.route("/approvisionnement/demands").get( isLoggedIn,isAchteur,catchAsync(getApprovisionementDemandsPage))
  router.route("/approvisionnement/demands/details/:requestId").get( isLoggedIn,isAchteur,catchAsync(getApprovisionementDemandDetailsPage))
  router.route("/approvisionnement/facture-proforma").get( isLoggedIn,isAchteur,catchAsync(getFactureProformaPage))
  router.route("/approvisionnement/facture-proforma/details/:factureProformaId").get( isLoggedIn,isAchteur,catchAsync(getFactureProformaDetailsPage))
  router.route("/approvisionnement/facture-proforma/cancel/:factureProformaId").get( isLoggedIn,isAchteur,catchAsync(cancelFactureProforma))
  router.route("/approvisionnement/facture-proforma/new").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getNewFactureProformaPage))
 .post(  isLoggedIn,isPharmacienPrincipal,upload.array("attachments"),catchAsync(createFromEmptyFactureProforma));
  router.route("/approvisionnement/facture-proforma/create").post( isLoggedIn,isAchteur,catchAsync(createFactureProforma))
  router.route("/approvisionnement/BC").get( isLoggedIn,isAchteur,catchAsync(getBCPage))
  router.route("/approvisionnement/BC/create").post( isLoggedIn,isAchteur, upload.array("attachments"),catchAsync(createBC))
  router.route("/approvisionnement/BC/add-attachments").post( isLoggedIn,isAchteur, upload.array("attachments"),catchAsync(addAttachments))
  router.route("/approvisionnement/BC/createBCFromDemand").post( isLoggedIn,isAchteur,catchAsync(createBCFromDemand))
  router.route("/approvisionnement/BC/update-status").post( isLoggedIn,isAchteur,catchAsync(updateStatusBC))
  router.route("/approvisionnement/BC/attachments/:BCId").get( isLoggedIn,isAchteur,catchAsync(getAttachments))
  router.route("/approvisionnement/BC/details/:BCId").get( isLoggedIn,isAchteur,catchAsync(getBCDetailsPage))
 
module.exports = router;
