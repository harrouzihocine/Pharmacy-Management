const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Draft', 'Validated'], default: 'Draft' }, // Draft or Validated
  serviceABV: { type: String},
  storageName:  { type: String},
  total: { type: String},

},
 {
   timestamps: true,
 });

module.exports = mongoose.model('Inventory', InventorySchema);
