const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema(
  {
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    medicamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicament', required: true },
    serviceABV: { type: String }, // Service identifier
    storageName: { type: String }, // Storage name
    batchNumber: { type: String, required: true }, // Batch number
    serialNumber: { type: String }, // Optional serial number
    physicalQuantity: { type: Number, required: true }, // Physical quantity
    purchasePrice: { type: Number, required: true }, // Purchase price
    systemQuantity: { type: Number, default: 0 }, // Default system quantity
    remarks: { type: String }, // Additional remarks
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
