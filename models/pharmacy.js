const mongoose = require("mongoose");

const PharmacySchema = new mongoose.Schema({
  medicamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicament", required: true },
  minquantity:{type:Number, default:0},
  PreExpirationAlert: {type: Number, default: 60},
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Tracks the user who added it
  addedAt: { type: Date, default: Date.now }, // Timestamp for tracking
});

module.exports = mongoose.model("Pharmacy", PharmacySchema);
