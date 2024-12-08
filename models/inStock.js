const mongoose = require("mongoose");
const Pharmacy = require("./pharmacy");
const moment = require("moment"); // Optional, for date calculations
const opts = {
  toJSON: {
    virtuals: true,
  },
};

const inStockSchema = new mongoose.Schema(
  {
    medicamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicament",
      required: true,
    },
    storageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Storage",
      required: true,
    },
    locationCode: { type: String },
    barcode: { type: String },
    quantity: { type: Number, required: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  opts
);

// Pre-save middleware to generate barcode automatically
inStockSchema.pre("save", async function(next) {
  if (!this.barcode) {
    // Generate barcode if not provided
    this.barcode = `${this._id}`;

    // Check if the barcode is unique
    const existingBarcode = await this.constructor.findOne({ barcode: this.barcode });
    if (existingBarcode) {
      return next(new Error("The generated or provided barcode already exists."));
    }
  }
  next();
});

// Virtual attribute for checking expiration status
inStockSchema.methods.getExpirationStatus = async function () {
  const pharmacy = await Pharmacy.findOne({ medicamentId: this.medicamentId });
  if (!pharmacy || !this.expiryDate) return "No Expiration Data";

  // Ensure expiryDate is a Date object
  const expiryDate = new Date(this.expiryDate);
  if (isNaN(expiryDate.getTime())) {
    return "Invalid Expiry Date"; // Check if expiryDate is invalid
  }

  // Calculate the number of days until expiration
  const daysUntilExpiration = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
  
  console.log("Expiry Date:", expiryDate);
  console.log("Days Until Expiration:", daysUntilExpiration);

  if (daysUntilExpiration < 0) {
    return "Expired"; // Already expired
  } else if (daysUntilExpiration <= pharmacy.PreExpirationAlert) {
    return "Expiring Soon"; // Within the pre-expiration alert window
  } else {
    return "Valid"; // Safe and not expiring soon
  }
};

module.exports = mongoose.model("InStock", inStockSchema);
