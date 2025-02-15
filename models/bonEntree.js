
const { min } = require("moment");
const mongoose = require("mongoose");

const BonEntreeSchema = new mongoose.Schema(
  {
    bonEntreeCode: {
      type: String,
      unique: true,
      required: true,
    },
    bonReceptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BonDeReception",
    },
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
    },
    status: {
      type: String,
      enum: ["Draft", "Validated"],
      default: "Draft",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min:0,
    },
    serviceABV: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const BonEntree = mongoose.model("BonEntree", BonEntreeSchema);

module.exports = BonEntree;
