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
    getEditBCPage,
    updateBonCommande,
    addBCAttachments,
    deleteBCAttachments,
    getBCAttachments,
    createBCFromDemand,
    getCreateEmptyBCPage,
    CreateFromEmptyBC,
    getBCDetailsPage,
    updateStatusBC,
    getBonReceptionPage,
    getBonReceptioncreationPage,
    createBonReception,
    cancelBC,
    getEditBonReceptioncreationPage,
    getBonReceptionDetailsPage,
    cancelBonReception,
    addRAttachments,
    deleteRAttachments,
    getRAttachments,
    updateBonReception,
    getBEPage,
    getNewBEPage,
    CreateBEPage,
    getBEDetailsPage,
    CreateBEitemPage,
    validateBEPage,
    getUpdateBEItemPage,
    updateBEItem,
    deleteBEItem,

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
 .post(  isLoggedIn,isPharmacienPrincipal,catchAsync(createFromEmptyFactureProforma));
  router.route("/approvisionnement/facture-proforma/create").post( isLoggedIn,isAchteur,catchAsync(createFactureProforma))
  router.route("/approvisionnement/BC").get( isLoggedIn,isAchteur,catchAsync(getBCPage))
  router.route("/approvisionnement/BC/create").post( isLoggedIn,isAchteur, upload.array("attachments"),catchAsync(createBC))
  router.route("/approvisionnement/BC/new").get(isLoggedIn,isAchteur,catchAsync(getCreateEmptyBCPage))
  .post(isLoggedIn,isAchteur,catchAsync(CreateFromEmptyBC))
  router.route("/approvisionnement/BC/add-attachments").post( isLoggedIn,isAchteur, upload.array("attachments"),catchAsync(addBCAttachments))
  router.route("/approvisionnement/BC/createBCFromDemand").post( isLoggedIn,isAchteur,catchAsync(createBCFromDemand))
  router.route("/approvisionnement/BC/update-status").post( isLoggedIn,isAchteur,catchAsync(updateStatusBC))
  router.route("/approvisionnement/BC/attachments/:BCId").get( isLoggedIn,isAchteur,catchAsync(getBCAttachments))
  router.route("/approvisionnement/BC/delete-attachment").post( isLoggedIn,isAchteur,catchAsync(deleteBCAttachments))
  router.route("/approvisionnement/BC/details/:BCId").get( isLoggedIn,isAchteur,catchAsync(getBCDetailsPage))
  router.route("/approvisionnement/BC/edit/:BCId").get( isLoggedIn,isAchteur,catchAsync(getEditBCPage))
  .post(isLoggedIn,isAchteur,catchAsync(updateBonCommande))
  router.route("/approvisionnement/BC/cancel/:BCId").get( isLoggedIn,isAchteur,catchAsync(cancelBC))
  .put(isLoggedIn,isAchteur,catchAsync(updateBonReception))
  router.route("/approvisionnement/R").get( isLoggedIn,isAchteur,catchAsync(getBonReceptionPage))
  router.route("/approvisionnement/R/new").get( isLoggedIn,isAchteur,catchAsync(getBonReceptioncreationPage))
  .post( isLoggedIn,isAchteur,catchAsync(createBonReception))
  router.route("/approvisionnement/R/add-attachments").post( isLoggedIn,isAchteur, upload.array("attachments"),catchAsync(addRAttachments))
  router.route("/approvisionnement/R/delete-attachment").post( isLoggedIn,isAchteur,catchAsync(deleteRAttachments))
  router.route("/approvisionnement/R/edit/:RId").get( isLoggedIn,isAchteur,catchAsync(getEditBonReceptioncreationPage))
  .put(isLoggedIn,isAchteur,catchAsync(updateBonReception))
  router.route("/approvisionnement/R/cancel/:RId").get( isLoggedIn,isAchteur,catchAsync(cancelBonReception))
  router.route("/approvisionnement/R/details/:RId").get( isLoggedIn,isAchteur,catchAsync(getBonReceptionDetailsPage))
  router.route("/approvisionnement/R/attachments/:RId").get( isLoggedIn,isAchteur,catchAsync(getRAttachments))
  router.route("/approvisionnement/BE").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getBEPage))
  router.route("/approvisionnement/BE/new").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getNewBEPage))
  .post( isLoggedIn,isPharmacienPrincipal,catchAsync(CreateBEPage))
  router.route("/approvisionnement/BE/:BEID").get( isLoggedIn,isPharmacienPrincipal,catchAsync(getBEDetailsPage))
  .post( isLoggedIn,isPharmacienPrincipal,catchAsync(CreateBEitemPage))
  router.route("/approvisionnement/BE/validate/:BEID").post( isLoggedIn,isPharmacienPrincipal,catchAsync(validateBEPage))
  router.route("/approvisionnement/BE/:BEID/:itemId").get(isLoggedIn, isPharmacienPrincipal, catchAsync(getUpdateBEItemPage))
  .put(isLoggedIn,isPharmacienPrincipal,catchAsync(updateBEItem))
  .delete(isLoggedIn,isPharmacienPrincipal,catchAsync(deleteBEItem));
  
module.exports = router;
