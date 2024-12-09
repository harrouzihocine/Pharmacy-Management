const mongoose = require("mongoose");
const Medicament = require("./medicament");

const demandSchema = new mongoose.Schema(
  {
    demandNumber: {
      type: String,
      required: true,
      unique: true, // Ensure uniqueness for each demand
    },
    createdDate: {
      type: Date,
      default: Date.now, // Automatically set the creation date
    },
    status: {
      type: String,
      enum: ["En attente", "Approuvé", "Rejeté", "Terminé"], // Status options
      default: "En attente",
    },
    sourceDepot: {
      type: String,
      required: true,
    },
    destinationDepot: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicament", // Reference to the product collection
          required: true,
        },
        requestedQuantity: {
          type: Number,
          required: true,
          min: 1, // Quantity must be at least 1
        },
       
        sourceAvailability: {
          type: Number,
          required: true, // Ensure stock availability is checked
        },
        remarks: {
          type: String,
          trim: true,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0, // Automatically calculated
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Demand", demandSchema);
