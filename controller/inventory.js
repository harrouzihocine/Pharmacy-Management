const User = require("../models/user");
const Medicament = require("../models/medicament"); // Assuming you have a Medicament model
const Storage = require("../models/storage"); // Assuming you have a Storage model
const Inventory = require("../models/inventory");
const InventoryItem = require("../models/InventoryItem");
const UserInventory = require("../models/userInventory");
const Fournisseur = require("../models/fournisseur");
const xlsx = require("xlsx");
const { ObjectId } = require('mongodb');

module.exports.getcreateInventoryPage = async (req, res, next) => {
  const groupedStorages = await Storage.aggregate([
    {
      $group: {
        _id: "$serviceABV", // Group by serviceABV
        storages: {
          $push: {
            storageName: "$storageName",
            endroitCode: "$endroitCode",
            endroitDescription: "$endroitDescription",
            service: "$service",
          },
        },
      },
    },
    { $sort: { _id: 1 } }, // Optional: Sort by serviceABV alphabetically
  ]);
  res.render("Inventory/new-inventory", { groupedStorages });
};

module.exports.getinventoriespage = async (req, res, next) => {
  try {
    // Fetch all inventories
    const inventories = await Inventory.find().sort({ createdAt: -1 });

    // Check if the user is associated with any inventory
    const userInventories = await UserInventory.find({}).select(
      "inventoryTemplate status createdBy"
    ); // Fetch inventoryTemplate and status fields only

    // Filter inventories based on the logged-in user
    const filteredUserInventories = userInventories.filter(
      (item) => item.createdBy?.toString() === req.user._id.toString()
    );

    // Get an array of inventoryTemplate IDs as strings
    const userInventoryIds = filteredUserInventories.map((item) =>
      item.inventoryTemplate.toString()
    );

    // Update status for inventories based on UserInventory statuses
    for (const inventory of inventories) {
      const associatedUserInventories = userInventories.filter(
        (userInventory) =>
          userInventory.inventoryTemplate.toString() ===
          inventory._id.toString()
      );

      // If no associated user inventories, set inventory status to 'Draft'
      if (associatedUserInventories.length === 0) {
        inventory.status = "Draft";
      } else {
        // Check if all associated user inventories are 'Validated'
        const allValidated = associatedUserInventories.every(
          (userInventory) => userInventory.status === "Validated"
        );

        // If all associated user inventories are validated, update inventory status to 'Validated', else 'Draft'
        inventory.status = allValidated ? "Validated" : "Draft";
      }

      // Save the updated inventory status
      await inventory.save();
    }

    // Pass both inventories and the userInventoryIds to the view
    res.render("Inventory/index", { inventories, userInventoryIds });
  } catch (error) {
    next(error); // Handle errors appropriately
  }
};

module.exports.getInventoryDetailsPage = async (req, res, next) => {
  const inventoryId = req.params.inventoryId;
  const userId = req.params.userId;

  try {
    // Fetch inventory details
    const inventory = await Inventory.findById(inventoryId);
    const fournisseurs = await Fournisseur.find();
    
    const userInventory = await UserInventory.findOne({
      inventoryTemplate: inventoryId,
      createdBy: userId,
    }); // Fetch only the status field

    // Fetch all inventory items for this inventory
    const inventoryItems = await InventoryItem.find({
      inventoryId,
      createdBy: userId,
    })
      .populate("medicamentId", "designation boite_de" ) 
      .lean(); 

    // Fetch all medicaments for adding new items
    const medicaments = await Medicament.find().sort({ code_interne: 1 });

    // Fetch user details
    const user = await User.findById(userId);

    // Fetch grouped storages for dropdown or information
    const groupedStorages = await Storage.aggregate([
      {
        $group: {
          _id: "$serviceABV", // Group by serviceABV
          storages: {
            $push: {
              storageName: "$storageName",
              endroitCode: "$endroitCode",
              endroitDescription: "$endroitDescription",
              service: "$service",
            },
          },
        },
      },
      { $sort: { _id: 1 } }, // Optional: Sort by serviceABV alphabetically
    ]);

    const status = userInventory.status;

    // Render page with data
    res.render("Inventory/inventory-details", {
      user,
      inventory,
      inventoryItems,
      medicaments,
      groupedStorages,
      fournisseurs,
      status, // Include status in the response
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    next(error); // Handle errors appropriately
  }
};

module.exports.createInventory = async (req, res, next) => {
  try {
    const { title, description, serviceABV, storageName } = req.body;

    // Create a new object and add properties conditionally
    const newInventoryData = {
      title,
      description,
      createdBy: req.user.username,
    };

    if (serviceABV) {
      newInventoryData.serviceABV = serviceABV;
    }

    if (storageName) {
      newInventoryData.storageName = storageName;
    }

    // Create a new Inventory instance with the filtered data
    const newInventory = new Inventory(newInventoryData);

    await newInventory.save();

    // Redirect to the workflow selection page
    res.redirect(`/inventory`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la création de l'inventaire");
  }
};

exports.addInventoryItem = async (req, res) => {
  try {
    const inventoryId = req.params.inventoryId;
    let {
      medicamentId,
      serviceABV,
      storageName,
      batchNumber,
      serialNumber,
      expiryDate,
      tva,
      physicalQuantity,
      purchasePrice,
      remarks,
      fournisseurId,
      NFacture,
      NBL,
      BLDate,
      factureDate,
      boite_de
    } = req.body;
      byBox = req.body.byBox === "on";
      QTEbyBox = req.body.QTEbyBox === "on";
    // Validate required fields (if not already handled by form validation)
    if (!inventoryId || !medicamentId || !physicalQuantity) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled!" });
    }
  
    if (isNaN(boite_de) || boite_de <= 0) {
      boite_de = 1;
    }
    if (byBox) {
      purchasePrice = purchasePrice / boite_de;
    }
    if (QTEbyBox) {
      physicalQuantity = physicalQuantity * boite_de;
    }
    // Create a new inventory item
    const inventoryItem = new InventoryItem({
      inventoryId,
      medicamentId,
      serviceABV,
      storageName,
      batchNumber,
      expiryDate,
      tva,
      serialNumber, 
      physicalQuantity,
      purchasePrice,
      fournisseurId,
      remarks,
      NFacture,
      NBL,
      BLDate,
      factureDate,
      byBox,
      QTEbyBox,
      boite_de,
      createdBy: req.user._id,
    });

    // Save to the database
    await inventoryItem.save();

    // Respond with success
    res.redirect(`back`);
  } catch (error) {
    console.error("Error adding inventory item:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
module.exports.getUpdateItemPage = async (req, res, next) => {
  const inventoryId = req.params.inventoryId;
  const itemId = req.params.itemId;
  const userId = req.query.userId;

  try {
    // Fetch inventory details
    const inventory = await Inventory.findById(inventoryId);
    const fournisseurs = await Fournisseur.find();
    // Check the status of the UserInventory for the given inventoryId and userId
    

    // Fetch all inventory items for this inventory
    const item = await InventoryItem.find({
      _id: itemId,
    })
      .populate("medicamentId", "designation") // Populate medicament details (e.g., name or designation)
      .lean(); // Convert Mongoose documents to plain objects for rendering
       // Reverse the previous calculations to get the original values
    if (item[0].byBox) {
      item[0].purchasePrice = item[0].purchasePrice * item[0].boite_de;
    }
    if (item[0].QTEbyBox) {
      item[0].physicalQuantity = item[0].physicalQuantity / item[0].boite_de;
    }
      const medicaments = await Medicament.find();
    // Fetch grouped storages for dropdown or information
    const groupedStorages = await Storage.aggregate([
      {
        $group: {
          _id: "$serviceABV", // Group by serviceABV
          storages: {
            $push: {
              storageName: "$storageName",
              endroitCode: "$endroitCode",
              endroitDescription: "$endroitDescription",
              service: "$service",
            },
          },
        },
      },
      { $sort: { _id: 1 } }, // Optional: Sort by serviceABV alphabetically
    ]);

  
    // Render page with data
    res.render("Inventory/edit-item", {
      inventory,
      item:item[0],
      groupedStorages,
      fournisseurs,
      medicaments,
      user:userId
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    next(error); // Handle errors appropriately
  }
};
exports.updateInventoryItem = async (req, res) => {
  try {
    const inventoryItemId = req.params.itemId; 
    let {
      medicamentId,
      serviceABV,
      storageName,
      batchNumber,
      serialNumber,
      expiryDate,
      tva,
      physicalQuantity,
      purchasePrice,
      fournisseurId,
      NFacture,
      NBL,
      BLDate,
      factureDate,
      remarks,
      inventory,
      boite_de,
      user
    } = req.body;
    const byBox = req.body.byBox === "on";
    const QTEbyBox = req.body.QTEbyBox === "on";
 
    if (
      !inventoryItemId ||
      !medicamentId ||

      !physicalQuantity
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled!" });
    }
    if (isNaN(boite_de) || boite_de <= 0) {
      boite_de = 1;
    }
  
    // Find the inventory item by its ID and inventory ID
    const inventoryItem = await InventoryItem.findOne({ _id: inventoryItemId });

    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found!" });
    }
    if (byBox) {
      inventoryItem.purchasePrice = purchasePrice / boite_de;
    
    }else{
      inventoryItem.purchasePrice = purchasePrice;
     
    }
    if (QTEbyBox) {
      inventoryItem.physicalQuantity = physicalQuantity * boite_de;
    
    }else{
      inventoryItem.physicalQuantity = physicalQuantity;
    }
  
    inventoryItem.medicamentId = medicamentId;
    inventoryItem.serviceABV = serviceABV;
    inventoryItem.storageName = storageName;
    inventoryItem.batchNumber = batchNumber || inventoryItem.batchNumber; 
    inventoryItem.serialNumber = serialNumber || inventoryItem.serialNumber; 
    inventoryItem.expiryDate = expiryDate || inventoryItem.expiryDate; 
    inventoryItem.fournisseurId = fournisseurId;
    inventoryItem.NFacture = NFacture;
    inventoryItem.factureDate = factureDate;
    inventoryItem.NBL = NBL;
    inventoryItem.BLDate = BLDate;
    inventoryItem.tva = tva;
    inventoryItem.remarks = remarks ; 
    inventoryItem.updatedBy = req.user._id;
    inventoryItem.byBox = byBox;
    inventoryItem.QTEbyBox = QTEbyBox;
    inventoryItem.boite_de = boite_de || inventoryItem.boite_de;

    // Save the updated inventory item
    await inventoryItem.save();

    // Respond with success
    res.redirect(`/inventory/${inventory}/user/${user}`);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

module.exports.addUserToInventory = async (req, res, next) => {
  try {
    const inventoryId = req.params.inventoryID;

    const newUserInventory = new UserInventory({
      inventoryTemplate: inventoryId,
      createdBy: req.user._id,
    });

    await newUserInventory.save();
    res.redirect(`/inventory`);
  } catch (error) {
    res.status(500).json({ message: "Error creating user inventory", error });
  }
};
module.exports.removeUserFromInventory = async (req, res, next) => {
  try {
    const inventoryId = req.params.inventoryId;
    const userId = req.params.userId;

    // Check if the user has created any items in the specified inventory
    const itemsCreatedByUser = await InventoryItem.find({
      inventoryId: inventoryId,
      createdBy: userId,
    });
    // If the user has created items in the inventory, do not remove them
    if (itemsCreatedByUser.length > 0) {
      return res
        .status(400)
        .json({
          message: "User has created items in this inventory, cannot remove",
        });
    }

    // If no items are created by the user in the inventory, proceed to remove the user
    const userInventory = await UserInventory.findOneAndDelete({
      inventoryTemplate: inventoryId,
      createdBy: userId,
    });

    if (!userInventory) {
      return res
        .status(404)
        .json({ message: "User not found in the inventory" });
    }

    res.redirect(`/inventory/users/${inventoryId}`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing user from inventory", error });
  }
};
module.exports.getInventoryUsers = async (req, res, next) => {
  try {
    const inventoryId = req.params.inventoryID;
    const inventory = await Inventory.findById(inventoryId);
    const usersInventory = await UserInventory.find({
      inventoryTemplate: inventoryId,
    }).populate("createdBy");

    res.render("Inventory/inventory-users", {
      usersInventory,
      inventory,
      currentuser: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user inventory", error });
  }
};
module.exports.validateUserInventory = async (req, res, next) => {
  const inventoryId = req.params.inventoryId;
  const userId = req.params.userId;
  const { status } = req.body;

  try {
    const updatedUserInventory = await UserInventory.findOneAndUpdate(
      { inventoryTemplate: inventoryId, createdBy: userId },
      { status },
      { new: true }
    );

    if (!updatedUserInventory) {
      console.error("Inventory not found:", { inventoryId, userId });
      return res.status(404).send({ message: "Inventory not found." });
    }

    res.status(200).send({
      message: `Inventory status updated to ${status} successfully.`,
      inventory: updatedUserInventory,
    });
  } catch (error) {
    console.error("Error updating inventory status:", error);
    res.status(500).send({ message: "Error updating inventory status." });
  }
};
module.exports.getUsersInventories = async (req, res, next) => {
  try {
    const inventoryId = req.params.inventoryId;

    // Validate the inventoryId
    if (!inventoryId) {
      return res.status(400).json({ message: "Inventory ID is required." });
    }

    // Fetch inventory details
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found." });
    }

    // Fetch inventory items for the given inventoryId and sort them
    const inventoryItems = await InventoryItem.find({ inventoryId })
      .populate("medicamentId") // Populates medicament details
      .populate("createdBy") // Populates user details (optional)
      .sort({
        "medicamentId.designation": 1, // Sorts alphabetically by medicament name (ascending)
        batchNumber: 1, // Sorts by batch number (ascending)
        serialNumber: 1, // Sorts by serial number (ascending)
      })
      .exec();

    // Calculate the total of purchasePrice of all inventory items
    const total = inventoryItems.reduce(
      (sum, item) => sum + item.purchasePrice,
      0
    );
    const itemCount = inventoryItems.length;

    // Update the total in the Inventory model
    inventory.total = total;
    await inventory.save();

    // Fetch users related to the inventory
    const users = await UserInventory.find({ inventoryTemplate: inventoryId })
      .select("createdBy")
      .populate("createdBy", "username");

    // Render the view with the fetched data, including the updated total
    res.render("Inventory/users-inventory", {
      inventory,
      inventoryItems,
      users,
      total,
      itemCount,
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;

    // Attempt to find and delete the item
    const deletedItem = await InventoryItem.findOneAndDelete({ _id: itemId });

    if (deletedItem) {
      // If the item was deleted successfully, respond with a success message
      res.json({ success: true, message: "Item deleted successfully." });
    } else {
      // If the item was not found, respond with an error message
      res.json({ success: false, message: "Item not found." });
    }
  } catch (error) {
    // Handle any potential errors
    console.error(error);
    res.json({
      success: false,
      message: "An error occurred while deleting the item.",
    });
  }
};

module.exports.exportInventoryItemsToExcel = async (req, res, next) => {
  const { inventoryId } = req.params;
  const { template } = req.query; // Extract the template from the query parameters

  try {
    // Fetch data from InventoryItem collection
    const inventoryItems = await InventoryItem.find({
      inventoryId: inventoryId,
      visibility: true,
    }).populate("inventoryId medicamentId createdBy");

    // Check if no items are found
    if (!inventoryItems || inventoryItems.length === 0) {
      return res
        .status(404)
        .json({ message: "No inventory items found for this inventoryId." });
    }

    let data = [];

    // Template-specific processing
    if (template === "bigtable") {
      // Original "Big Table" logic
      data = inventoryItems.map((item) => ({
        Designation: item.medicamentId ? item.medicamentId.designation : "N/A",
        Forme: item.medicamentId ? item.medicamentId.forme : "N/A",
        Boite_de: item.medicamentId ? item.medicamentId.boite_de : "N/A",
        ServiceABV: item.serviceABV || "All Services",
        StorageName: item.storageName || "All Storages",
        BatchNumber: item.batchNumber,
        SerialNumber: item.serialNumber || "N/A",
        ExpiryDate: item.expiryDate
          ? item.expiryDate.toLocaleDateString()
          : "N/A",
        Quantity: item.physicalQuantity,
        PurchasePrice: item.purchasePrice || 0,
        TVA: item.tva || "N/A",
        MontantHT:
          (item.purchasePrice ? item.purchasePrice : 0) *
            item.physicalQuantity || 0,
        Remarks: item.remarks || "N/A",
        CreatedBy: item.createdBy ? item.createdBy.username : "N/A",
      }));
    } else if (
      template === "byservices" ||
      template === "byservicesandstorages"
    ) {
      // Group inventory items by medicamentId
      const groupedItems = inventoryItems.reduce((acc, item) => {
        const key = item.medicamentId
          ? item.medicamentId.designation
          : "Unknown";
        if (!acc[key]) {
          acc[key] = {};
        }

        const serviceKey = item.serviceABV || "All Services";
        if (!acc[key][serviceKey]) {
          acc[key][serviceKey] = 0;
        }

        acc[key][serviceKey] += item.physicalQuantity;

        if (template === "byservicesandstorages") {
          const storageKey = item.storageName || "All Storages";
          if (!acc[key][`${serviceKey}:${storageKey}`]) {
            acc[key][`${serviceKey}:${storageKey}`] = 0;
          }
          acc[key][`${serviceKey}:${storageKey}`] += item.physicalQuantity;
        }

        return acc;
      }, {});

      // Transform grouped data into rows
      data = Object.entries(groupedItems).map(([medicament, services]) => {
        const row = { Medicament: medicament };

        Object.entries(services).forEach(([key, quantity]) => {
          row[key] = quantity;
        });

        return row;
      });
    } else {
      return res.status(400).json({ message: "Invalid template specified." });
    }

    // Create a worksheet from the data
    const ws = xlsx.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "InventoryItems");

    // Write the workbook to a file
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `inventory_items-${template}-${date}.xlsx`;
    xlsx.writeFile(wb, fileName);

    // Send the file as a response
    res.download(fileName); // This will send the Excel file to the client
  } catch (err) {
    console.error("Error exporting data to Excel:", err);
    res
      .status(500)
      .json({ message: "Error exporting data to Excel.", error: err.message });
  }
};
module.exports.hideInventoryItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const { visibility } = req.body;

    console.log("Controller reached");
    console.log("itemId:", itemId);
    console.log("visibility:", visibility);

    // Update the visibility status of the item
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      itemId,
      { visibility },
      { new: true } // Return the updated document
    );

    if (updatedItem) {
      res.json({
        success: true,
        message: visibility
          ? "Item made visible successfully."
          : "Item hidden successfully.",
      });
    } else {
      res.json({ success: false, message: "Item not found." });
    }
  } catch (error) {
    console.error("Error updating visibility:", error);
    res.json({
      success: false,
      message: "An error occurred while updating the item's visibility.",
    });
  }
};
module.exports.getMinPurchasePrice = async (req, res, next) => {
  const { inventoryId, medicamentId } = req.body;
  
    try {
      const result = await InventoryItem.findOne({
        inventoryId: inventoryId,
        medicamentId: medicamentId,
        purchasePrice: { $ne: null }, 
      })
        .sort({ purchasePrice: 1 }) 
        .limit(1);
      
      const medicament = await Medicament.findOne({
        _id: medicamentId,
      });
      console.log("med", medicament);
        if (result!==null) {
            res.json({ minPurchasePrice: result.purchasePrice, boite_de: medicament.boite_de, byBox: result.byBox});
        } else {
            res.json({ minPurchasePrice: null, boite_de: medicament.boite_de });
        }
    } catch (error) {
        console.error('Error fetching minimum purchase price:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
