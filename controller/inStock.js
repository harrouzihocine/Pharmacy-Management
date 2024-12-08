const InStock = require('../models/inStock');  // Assuming you have an InStock model
const Medicament = require('../models/medicament'); // Assuming you have a Medicament model
const Storage = require('../models/storage'); // Assuming you have a Storage model
const MedicamentSettings = require('../models/medicamentSettings');
const moment = require('moment');
const bwipjs = require('bwip-js');
// Function to generate barcode
const generateBarcode = (medicamentId, batchNumber, expiryDate) => {
  return `${medicamentId}-${batchNumber}-${expiryDate ? moment(expiryDate).format('YYYY-MM-DD') : 'N/A'}`;
};
module.exports.serviceLocations = async (req, res, next) => {
  const { serviceId } = req.params;

try {
  // Fetch storages for the selected service
  const storages = await Storage.find({ serviceABV: serviceId });
     // Calculate the number of locations for each storage
     const storagesWithCounts = storages.map(storage => ({
      ...storage.toObject(), // Convert Mongoose document to plain object
      locationCount: storage.locations.length, // Count the number of locations
    }));

  // Render the storages view, passing the storages and the service name
 
  res.json(storagesWithCounts);
} catch (err) {
  console.error(err);
  res.status(500).send('Server Error');
}
};
exports.addMedicamentToStorage = async (req, res) => {
  try {
    // Extract form data
    const { medicamentId, service, storageId, quantity, batchNumber, expiryDate, barcode } = req.body;

    // Validate data
    if (!medicamentId || !storageId || !quantity || !batchNumber || !service) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    // Find the medicament by ID
    const medicament = await Medicament.findById(medicamentId);
    if (!medicament) {
      return res.status(404).json({ message: 'Medicament not found.' });
    }

    // Find the storage by ID
    const storage = await Storage.findById(storageId);
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found.' });
    }

   

    

    // Check if an entry already exists for the medicament, batch, and expiry
    const existingInStock = await InStock.findOne({
      medicamentId,
      storageId,
      batchNumber,
      expiryDate,
    });

    if (existingInStock) {
      // Update the quantity of the existing record
      existingInStock.quantity += parseInt(quantity, 10);
      await existingInStock.save();
    } else {
      // Create new inStock entry
      const newInStock = new InStock({
        medicamentId,
        storageId,
        locationCode: storage.locations.locationCode, // Assuming storage has a locationCode field
        quantity,
        createdBy: req.user._id,
        batchNumber,
        expiryDate,
      
      });

      // Save the new inStock entry
      await newInStock.save();
    }

    // Send success response
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

  
exports.StorageMedicaments = async function (req, res) {
    try {
        const storageId = req.params.storageId;
   
        // Find the storage by ID
        const storage = await Storage.findById(storageId);
        if (!storage) {
          return res.status(404).json({ message: 'Storage not found' });
        }
    
        // Fetch medicaments in the specified storage
        const items = await InStock.find({ storageId })
          .populate('medicamentId') 
          .populate('storageId')
          .exec();
    
        // Render the view with the storage and its medicaments
        res.render('InStock/storageStockDetails', { storage, items });
    
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error, please try again later.' });
      }
};
exports.assignLocation = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { selectedlocationCode } = req.body;

        // Validate input
        if (!selectedlocationCode) {
            return res.status(400).json({ message: 'Location code is required.' });
        }

        // Find the inStock item
        const item = await InStock.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'InStock item not found.' });
        }

        // Update the locationCode
        item.locationCode = selectedlocationCode;
        await item.save();

        // Redirect back to storage details page
        res.redirect('back');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.unassignLocation = async (req, res) => {
    try {
      const { itemId } = req.params; // Get the inStock item ID from the route parameter
  
      // Find the inStock item by its ID
      const item = await InStock.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: 'InStock item not found.' });
      }
  
      // Clear the locationCode
      item.locationCode = null;
      await item.save(); // Save the updated item
  
      // Redirect back to the storage details page or send a success message
      res.redirect('back');
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  exports.stockDetails = async (req, res) => {
    try {
      const { medicamentId } = req.params;
  const medicament = await Medicament.findById(medicamentId);
 
      // Fetch all stock details for the given medicamentId
      const stockDetails = await InStock.find({ medicamentId })
        .populate('medicamentId') // Populate medicament details if needed
        .populate('storageId')
        .exec();
    // Check if the stock is expiring soon
    for (let stockItem of stockDetails) {
      stockItem.isExpiringSoon = await stockItem.getExpirationStatus();
    }

 
      // Render a page to display the stock details
      res.render('InStock/AllStockDetails', { stockDetails,designantion:medicament.designation });
     
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error.');
    }
  };
 

exports.serviceStockDetails = async (req, res) => {
  const { serviceABV } = req.params;
  try {
    // Find all storages for the given serviceABV
    const storages = await Storage.find({ serviceABV });
    if (!storages || storages.length === 0) {
      return res.status(404).send('No storages found for this service.');
    }

    // Extract storage IDs
    const storageIds = storages.map((storage) => storage._id);

    // Fetch inStock data for these storageIds
    const stockDetails = await InStock
      .find({ storageId: { $in: storageIds } })
      .populate('medicamentId', 'code_interne designation nom_commercial') // Populate medicament details
      .populate('storageId', 'storageName serviceABV'); // Populate storage details

    // Generate barcodes for each stockItem
    for (let stockItem of stockDetails) {
      stockItem.isExpiringSoon = await stockItem.getExpirationStatus();

      // Generate barcode for the medicament code_interne (or any other field you want)
      const barcodeData = stockItem.barcode;
      const normalizedData = barcodeData.length > 12
      ? barcodeData.slice(12, 24) // Truncate if too long
      : (barcodeData.padEnd(12, '0')); // Pad with zeros if too short
      try {
        const barcodeImage = await bwipjs.toBuffer({
          bcid: 'code128',    // Barcode type
          text: normalizedData,  // Text to encode (medicament code)
          scale: 3,           // Scale the barcode image
          height: 10,         // Height of the barcode
          includetext: true,  // Include text below the barcode
        });

        // Add the barcode as a base64-encoded PNG image to the stockItem object
        stockItem.barcode = `data:image/png;base64,${barcodeImage.toString('base64')}`;
        stockItem.originalBarcode = barcodeData; // Save the original barcode for user input
      } catch (barcodeError) {
        console.error('Error generating barcode:', barcodeError);
      }
    }

    // Aggregate all locations from storages
    const Locations = storages.reduce((locations, storage) => {
      if (storage.locations) {
        locations.push(...storage.locations);
      }
      return locations;
    }, []);

    // Render the view and pass the stock details along with barcode data
    res.render('InStock/serviceStockDetails', {
      stockDetails,
      serviceName: serviceABV,
      Locations,
    });
  } catch (err) {
    console.error('Error fetching stock details by service:', err);
    res.status(500).send('Error fetching stock details.');
  }
};

    exports.getMedicamentsByService = async (req, res) => {
      const { serviceABV } = req.params;
    
      try {
        // Fetch all storages for the given service
        const storages = await Storage.find({ serviceABV });
        const storageIds = storages.map((storage) => storage._id);
    
        if (!storages.length) {
          return res.render('InStock/serviceMedicaments', {
            serviceName: serviceABV,
            medicaments: [],
          });
        }
    
        // Aggregate quantities for each medicament
        const medicaments = await InStock.aggregate([
          { $match: { storageId: { $in: storageIds } } }, // Filter by storages of this service
          {
            $group: {
              _id: '$medicamentId',
              totalQuantity: { $sum: '$quantity' },
            },
          },
          {
            $lookup: {
              from: 'medicaments', // Reference to medicaments collection
              localField: '_id',
              foreignField: '_id',
              as: 'medicamentDetails',
            },
          },
          { $unwind: '$medicamentDetails' }, // Flatten medicament details
        ]);
    
        // Map medicament settings to their corresponding medicament
        const medicamentSettings = await MedicamentSettings.find({ serviceABV });
        const settingsMap = medicamentSettings.reduce((map, setting) => {
          map[setting.medicamentId.toString()] = setting.minQuantity;
          return map;
        }, {});
    
        // Add minQuantity to each medicament
        const medicamentsWithSettings = medicaments.map((medicament) => ({
          ...medicament,
          minQuantity: settingsMap[medicament._id.toString()] || 'N/A',
        }));
    
        res.render('InStock/serviceMedicaments', { 
          serviceName: serviceABV, 
          medicaments: medicamentsWithSettings,
        });
      } catch (err) {
        console.error('Error fetching medicaments by service:', err);
        res.status(500).send('Error fetching medicaments.');
      }
    };
    
    exports.getMedicamentsdetailsByService = async (req, res) => {
      const { medicamentId, serviceABV } = req.params;
    
      try {
        // Find all storages for the given service
        const storages = await Storage.find({ serviceABV });
        const storageIds = storages.map((storage) => storage._id);
    
        if (!storages.length) {
          return res.render('InStock/medicamentDetails', {
            medicament: null,
            stockDetails: [],
            locations: [],
            serviceName: serviceABV,
          });
        }
    
        // Fetch medicament details
        const medicament = await Medicament.findById(medicamentId);
        if (!medicament) {
          return res.status(404).send('Medicament not found.');
        }
    
        // Fetch stock details for this medicament in the service's storages
        const stockDetails = await InStock.find({
          medicamentId,
          storageId: { $in: storageIds },
        }).populate('storageId');
        for (let stockItem of stockDetails) {
          stockItem.isExpiringSoon = await stockItem.getExpirationStatus();
        };
        
    
        // Combine locations from all storages
        const locations = storages.reduce((acc, storage) => {
          if (storage.locations) {
            acc.push(...storage.locations);
          }
          return acc;
        }, []);
        
    
        res.render('InStock/MedicamentStockDetails', {
          medicament,
          stockDetails,
          locations,
          serviceName: serviceABV,
        });
      } catch (err) {
        console.error('Error fetching medicament details by service:', err);
        res.status(500).send('Error fetching medicament details.');
      }
    };
    module.exports.medicamentSettings = async (req, res, next) => {

      try {
    const { serviceName, medicamentId, minquantity } = req.body;

    // Validate the required fields
    if (!serviceName || !medicamentId || minquantity === undefined) {
      return res.status(400).json({ error: 'serviceABV, medicamentId, and minQuantity are required.' });
    }

    // Ensure minQuantity is a positive number
    if (minquantity < 0) {
      return res.status(400).json({ error: 'minQuantity must be a non-negative number.' });
    }

    // Update or create the minimum quantity record
    const updatedRecord = await MedicamentSettings.findOneAndUpdate(
      { serviceABV:serviceName, medicamentId:medicamentId },
      { minQuantity:minquantity },
      { upsert: true, new: true } // Creates a new document if none exists
    );

    // Respond with the updated record
    res.redirect('back');
  } catch (error) {
    console.error('Error updating minimum quantity:', error);
    res.status(500).json({ error: 'An error occurred while updating the minimum quantity.' });
  }

    };

    // Controller function to generate barcodes for existing InStock medicaments
    exports.updateBarCode = async (req, res) => {
     
      const { BarCode,stockId } = req.body; // The new barcode value
    
      try {
        // Find the medicament in the stock using medicamentId
        const stockItem = await InStock.findById(stockId);
    
        if (!stockItem) {
          return res.status(404).send('Stock item not found.');
        }
    
        // Update the barcode value in the stock item
        stockItem.barcode = BarCode; // or whatever field needs updating
        await stockItem.save();
    
        // Redirect back to the stock details page after saving
        res.redirect(`back`);
      } catch (err) {
        console.error('Error updating barcode:', err);
        res.status(500).send('Error updating barcode.');
      }
    };