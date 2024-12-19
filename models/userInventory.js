const mongoose = require('mongoose');

const UserInventorySchema = new mongoose.Schema({
  inventoryTemplate: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Inventory',  // Reference to the Inventory template
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Reference to the User model
    required: true 
  },
 
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserInventory', UserInventorySchema);
