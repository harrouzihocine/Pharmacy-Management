const express = require("express");
const { isLoggedIn } = require('../middleware/authMiddleware');
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
router.route("/").get(catchAsync(getinventoriespage));
router
  .route("/new")
  .get(catchAsync(getcreateInventoryPage))
  .post(catchAsync(createInventory));
router
  .route("/:inventoryId")
  .get(catchAsync(getUsersInventories))
  .post(catchAsync(addInventoryItem));
  
router
.route("/item/:itemId")
.put(catchAsync(updateInventoryItem))
.delete(catchAsync(deleteInventoryItem))
.patch(catchAsync(hideInventoryItem));

router.route("/add-user/:inventoryID").get(catchAsync(addUserToInventory));
router.route("/:inventoryId/remove-user/:userId").get(catchAsync(removeUserFromInventory));
router.route("/users/:inventoryID").get(catchAsync(getInventoryUsers));
router
  .route("/:inventoryId/user/:userId")
  .get(catchAsync(getInventoryDetailsPage))
  .post(catchAsync(validateUserInventory));
  router
  .route("/export/:inventoryId").get(catchAsync(exportInventoryItemsToExcel))
module.exports = router;
