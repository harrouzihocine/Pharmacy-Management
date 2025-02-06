const mongoose = require("mongoose");

// Define the schema for the Bon de Commande (BC)
const bonDeCommandeSchema = new mongoose.Schema({
  bonCommandeCode: {
    type: String,
    unique: true,
    required: true,
  },
  demandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseRequest",
    required: true,
  },
  factureProformaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FactureProforma", // Reference to the FactureProforma model
   default: null,
  },
  fournisseurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fournisseur", // Reference to the Fournisseur model
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the Fournisseur model
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Canceled","Pending Delivery","Completed"],
    default: "Pending",
  },
  comment: {
    type: String,
  },
  medicaments: [
    {
      medicamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicament", // Reference to the Medicament model
        required: true,
      },
      orderQuantity: {
        type: Number,
        required: true,
        min: 0,
      },
      quantityDemanded: {
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
  { timestamps: true });

// Create the BonDeCommande model based on the schema
const BonDeCommande = mongoose.model("BonDeCommande", bonDeCommandeSchema);

module.exports = BonDeCommande;
