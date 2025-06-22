const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Draft', 'Validated'], default: 'Draft' }, // Draft or Validated
  serviceABV: { type: String},
  storageName:  { type: String},
  total: { type: String},
  isEmpty: { type: Boolean, default: false }, // New field to indicate if inventory is empty or pre-filled

},
 {
   timestamps: true,
 });

module.exports = mongoose.model('Inventory', InventorySchema);
