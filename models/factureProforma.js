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
      required: true,
    }, // Reference to the purchase request
    fournisseur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
      required: true,
    }, // Supplier who will provide the medicaments
    medicaments: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicament",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        quantityDemanded: {
          type: Number,
          required: true,
          min: 0,
        },
       
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Canceled"],
      default: "Pending",
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
