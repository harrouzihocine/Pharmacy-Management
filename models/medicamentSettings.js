const mongoose = require('mongoose');

const medicamentSettingsSchema = new mongoose.Schema({
  serviceABV: { 
    type: String, 
    required: true,  // Reference to the service (e.g., "Cardiology")
  },
  medicamentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medicament', 
    required: true  // Reference to the Medicament model
  },
  minQuantity: { 
    type: Number, 
    required: true  // The minimum quantity for this medicament in this service
  },
});

module.exports = mongoose.model('medicamentSettings', medicamentSettingsSchema);
