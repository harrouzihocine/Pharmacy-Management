const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema(
  {
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    medicamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicament', required: true },
    fournisseurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', default: null },

    serviceABV: { type: String }, // Service identifier
    storageName: { type: String }, // Storage name
    batchNumber: { type: String}, // Batch number
    serialNumber: { type: String }, // Optional serial number
    expiryDate: { type: Date}, // Expiry date
    tva: { type: Number}, // tva
    physicalQuantity: { type: Number, required: true }, // Physical quantity
    purchasePrice: { type: Number, default: 0 }, // Purchase price
    byBox: { type:Boolean, default: false},
    QTEbyBox: { type: Boolean, default: false },
    boite_de: { type: Number, default: 1  },
    NFacture: { type: String }, // NFacture
    factureDate: { type: Date }, // factureDate
    NBL: { type: String }, // NBL
    BLDate: { type: Date}, // BLDate
    systemQuantity: { type: Number, default: 0 },
    visibility: { type:Boolean, default: true}, // Visibility
    remarks: { type: String }, // Additional remarks
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
