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
    required: true,
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
    },
  ],
 
},
  { timestamps: true });

// Create the BonDeCommande model based on the schema
const BonDeCommande = mongoose.model("BonDeCommande", bonDeCommandeSchema);

module.exports = BonDeCommande;
