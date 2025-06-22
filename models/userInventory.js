const mongoose = require('mongoose');

const UserInventorySchema = new mongoose.Schema({
  inventoryTemplate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Inventory',  // Reference to the Inventory template
    required: true 
  },
  status: { type: String, enum: ['Draft', 'Validated'], default: 'Draft' }, // Draft or Validated
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
 
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserInventory', UserInventorySchema);
