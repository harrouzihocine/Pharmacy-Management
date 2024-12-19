const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {
   
    getcreateInventoryPage,
    createInventory,
    chooseWorkflow,
    getinventoriespage,
    getInventoryDetailsPage,
    addInventoryItem,
    validateInventory
   
  } = require("../controller/inventory");
router.route("/new").get(catchAsync(getcreateInventoryPage)).post(catchAsync(createInventory));
router.route("/:inventoryId").get(catchAsync(getInventoryDetailsPage )).post(catchAsync(addInventoryItem  ));
router.route("/").get(catchAsync(getinventoriespage));
router.route("/validate/:inventoryID").post(catchAsync(validateInventory));


module.exports = router;