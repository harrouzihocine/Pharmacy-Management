const express = require("express");
const {
  isLoggedIn,
  isAdmin,
  isPharmacienPrincipal,
  isResponsableService,
  isAchteur,
} = require("../middleware/authMiddleware");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {
  getcreateInventoryPage,
  createInventory,
  getinventoriespage,
  getInventoryDetailsPage,
  addInventoryItem,
  addUserToInventory,
  removeUserFromInventory,
  getInventoryUsers,
  validateUserInventory,
  getUsersInventories,
  deleteInventoryItem,
  updateInventoryItem,
  exportInventoryItemsToExcel,
  hideInventoryItem
} = require("../controller/inventory");
router.route("/").get(isLoggedIn, isResponsableService,catchAsync(getinventoriespage));
router
  .route("/new")
  .get(isLoggedIn, isPharmacienPrincipal,catchAsync(getcreateInventoryPage))
  .post(isLoggedIn, isPharmacienPrincipal,catchAsync(createInventory));
router
  .route("/:inventoryId")
  .get(isLoggedIn, isResponsableService,catchAsync(getUsersInventories))
  .post(isLoggedIn, isResponsableService,catchAsync(addInventoryItem));
  
router
.route("/item/:itemId")
.put(isLoggedIn, isResponsableService,catchAsync(updateInventoryItem))
.delete(isLoggedIn, isResponsableService,catchAsync(deleteInventoryItem))
.patch(isLoggedIn, isPharmacienPrincipal,catchAsync(hideInventoryItem));

router.route("/add-user/:inventoryID").get(isLoggedIn, isResponsableService,catchAsync(addUserToInventory));
router.route("/:inventoryId/remove-user/:userId").get(isLoggedIn, isPharmacienPrincipal,catchAsync(removeUserFromInventory));
router.route("/users/:inventoryID").get(isLoggedIn, isResponsableService,(getInventoryUsers));
router
  .route("/:inventoryId/user/:userId")
  .get(isLoggedIn, isPharmacienPrincipal,catchAsync(getInventoryDetailsPage))
  .post(isLoggedIn, isResponsableService,catchAsync(validateUserInventory));
  router
  .route("/export/:inventoryId").get(isLoggedIn, isPharmacienPrincipal,catchAsync(exportInventoryItemsToExcel))
module.exports = router;
