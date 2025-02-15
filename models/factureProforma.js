const mongoose = require("mongoose");

const FactureProformaSchema = new mongoose.Schema(
  {
    factureProformaCode: {
      type: String,
      unique: true,
      required: true,
    },
    demandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequest",
    
    }, // Reference to the purchase request
    fournisseur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
      required: true,
    },
    medicaments: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicament",
          required: true,
        },
        quantity: {
          type: Number,
          
          min: 0,
        },
        quantityDemanded: {
          type: Number,
         
          min: 0,
        },
       
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Treated", "Canceled"],
      default: "Draft",
    }, // Status of the invoice
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // User who created the proforma invoice
  },
  { timestamps: true }
);

module.exports = mongoose.model("FactureProforma", FactureProformaSchema);
