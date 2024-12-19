const mongoose = require("mongoose");

const opts = {
  toJSON: {
    virtuals: true,
  },
};

const VirtualInStockSchema = new mongoose.Schema(
  { 
    medicamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicament', required: true },
    quantity: { type: Number, required: true },
    serialNumber: { type: Number },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date },
    barcode: { type: String },
    receivedQuantity: {
      type: Number,
      trim: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
  opts
);

module.exports = mongoose.model("VirtualInStock", VirtualInStockSchema);