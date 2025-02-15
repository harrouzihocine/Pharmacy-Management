const mongoose = require("mongoose");
const BonEntreeItemSchema = new mongoose.Schema(
  {
    bonEntreeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BonEntree",
      required: true,
    },
    medicamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicament",
      required: true,
    },
    storageName: { type: String },
    batchNumber: {
      type: String,
    
    },
    serialNumber: {
      type: String,
    },
    expiryDate: {
      type: Date,
     
    },
    boite_de: {
      type: Number,
      default: 1,
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
     
    },
    sellPrice: {
      type: Number,
     
    },
    tva: {
      type: Number,
     
    },

    byBox: {
      type: Boolean,
      default: false,
    },
    QTEbyBox: {
      type: Number,
      default: 1,
    },

    remarks: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for total amount
BonEntreeItemSchema.virtual("totalAmount").get(function () {
  const priceWithTVA = this.unitPrice * (1 + this.tva / 100);
  return this.quantity * priceWithTVA;
});

const BonEntreeItem = mongoose.model("BonEntreeItem", BonEntreeItemSchema);

module.exports = BonEntreeItem;
