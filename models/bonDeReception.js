const mongoose = require("mongoose");

// Define the schema for the Bon de Réception (BR)
const bonDeReceptionSchema = new mongoose.Schema(
  {
    bonReceptionCode: {
      type: String,
      unique: true,
      required: true,
    },
    bonCommandeId: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BonDeCommande",
      },
      date: Date,
    },
    bonLivraison: {
      numero: String,
      date: Date,
    },
    facture: {
      numero: String,
      date: Date,
    },
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
      required: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateReception: {
      type: Date,
      required: true,
    },
    nombreColis: {
      type: Number,
      min: 0,
    },
    observation: String,
    status: {
      type: String,
      enum: ["Pending", "Canceled", "Completed", "Rejected"],
      default: "Pending",
    },
    surplus: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicament",
        },
        quantity: {
          type: Number,

          min: 0,
        },
      },
    ],
    manque: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicament",
        },
        quantity: {
          type: Number,

          min: 0,
        },
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Create the BonDeReception model based on the schema
const BonDeReception = mongoose.model("BonDeReception", bonDeReceptionSchema);

module.exports = BonDeReception;
