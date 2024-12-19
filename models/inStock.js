const mongoose = require("mongoose");
const Pharmacy = require("./pharmacy");
const Medicament = require("./medicament");
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
    purchase_price: { type: Number},
    serialNumber: { type: Number},
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
inStockSchema.pre("save", async function (next) {
  if (!this.barcode) {
    try {
      // Fetch the associated Medicament
      const medicament = await Medicament.findById(this.medicamentId);

      if (!medicament) {
        return next(new Error("Medicament not found."));
      }

      // Construct the barcode using code_interne, batchNumber, and expiryDate
      const formattedExpiryDate = moment(this.expiryDate).format("YYYYMMDD"); // Format expiry date (optional)
      this.barcode = `${medicament.code_interne}-${this.batchNumber}-${formattedExpiryDate}`;

      // Ensure the barcode is unique
      const existingBarcode = await this.constructor.findOne({ barcode: this.barcode });
      if (existingBarcode) {
        return next(new Error("The generated barcode already exists."));
      }
    } catch (error) {
      return next(error);
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
