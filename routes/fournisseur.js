const express = require("express");
const router = express.Router();
const { isLoggedIn,isAdmin,isPharmacienPrincipal, isResponsableService, isAchteur  } = require('../middleware/authMiddleware');
const catchAsync = require("../utils/catchAsync");
const {
  createFournisseur,
  listeFournisseur,
  deleteFournisseur,
  updateFournisseur,
  generatepdf,
  createContact,
  listeContacts,
  deleteContact
} = require("../controller//fournisseur");
router.route("/generatepdf").get(isLoggedIn, catchAsync(generatepdf));

router
  .route("/")
  .get(isLoggedIn,isAchteur, catchAsync(listeFournisseur))
  .post(isLoggedIn,isAchteur, catchAsync(createFournisseur));
router
  .route("/:id")
  .get(isLoggedIn,isAchteur, catchAsync(listeContacts))
  .post(isLoggedIn,isAchteur, catchAsync(createContact))
  .delete(isLoggedIn,isAchteur, catchAsync(deleteFournisseur))
  .put(isLoggedIn,isAchteur, catchAsync(updateFournisseur));
router.route("/:fournisseurId/contact/:contactId").delete(isLoggedIn,isAchteur, catchAsync(deleteContact));
module.exports = router;
