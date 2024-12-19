const InStock = require("../models/inStock"); // Assuming you have an InStock model
const Medicament = require("../models/medicament"); // Assuming you have a Medicament model
const Storage = require("../models/storage"); // Assuming you have a Storage model
const Inventory = require("../models/inventory");
const InventoryItem = require('../models/InventoryItem');

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
  res.render("Inventory/new-inventory",{groupedStorages});
};

module.exports.getinventoriespage = async (req, res, next) => {
    try {
      const inventories = await Inventory.find().sort({ createdAt: -1 }); // Newest first
      res.render("Inventory/index", { inventories });
    } catch (error) {
      next(error); // Handle errors appropriately
    }
  };

  
  module.exports.getInventoryDetailsPage = async (req, res, next) => {
    const inventoryId = req.params.inventoryId;
  
    try {
      // Fetch inventory details
      const inventory = await Inventory.findById(inventoryId);
  
      // Fetch all inventory items for this inventory
      const inventoryItems = await InventoryItem.find({ inventoryId })
        .populate('medicamentId', 'designation') // Populate medicament details (e.g., name or designation)
        .lean(); // Convert Mongoose documents to plain objects for rendering
  
      // Fetch all medicaments for adding new items
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
      res.render('Inventory/inventory-details', {
        inventory,
        inventoryItems,
        medicaments,
        groupedStorages,
      });
    } catch (error) {
      console.error('Error fetching inventory details:', error);
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
   const inventoryId = req.params.inventoryId
    const {
      
      medicamentId,
      serviceABV,
      storageName,
      batchNumber,
      serialNumber,
      physicalQuantity,
      purchasePrice,
      remarks
    } = req.body;
    // Validate required fields (if not already handled by form validation)
    if (!inventoryId || !medicamentId || !batchNumber || !physicalQuantity ) {
      return res.status(400).json({ error: 'All required fields must be filled!' });
    }

    // Create a new inventory item
    const inventoryItem = new InventoryItem({
      inventoryId,
      medicamentId,
      serviceABV,
      storageName,
      batchNumber,
      serialNumber, // Optional
      physicalQuantity,
      purchasePrice,
      remarks
    });

    // Save to the database
    await inventoryItem.save();

    // Respond with success
   res.redirect(`/inventory/${inventoryId}`);

  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

module.exports.validateInventory = async (req, res, next) => {
  const inventoryId = req.params.inventoryID;
  const { status } = req.body; // Expect status ('Draft' or 'Validated') in the request body
 
  
  try {
    // Find and update the inventory status dynamically based on the request body
    const updatedInventory = await Inventory.findOneAndUpdate(
      { _id: inventoryId }, // MongoDB uses `_id` for the primary key
      { status }, // Use the dynamic status from the request
      { new: true } // Return the updated document
    );

    console.log('Updated Inventory:', updatedInventory);

    if (!updatedInventory) {
      return res.status(404).send({ message: 'Inventory not found.' });
    }

    res.status(200).send({
      message: `Inventory status updated to ${status} successfully.`,
      inventory: updatedInventory
    });
  } catch (error) {
    console.error('Error updating inventory status:', error); // Log the error for debugging
    res.status(500).send({ message: 'Error updating inventory status.' });
  }
};

