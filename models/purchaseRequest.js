const mongoose = require("mongoose");

const PurchaseRequestSchema = new mongoose.Schema(
  {
    PurchaseRequestCode: {
      type: "string",
      unique: true,
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
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Draft","Canceled","Treated"],
      default: "Draft",
    }, // Status of the demand
    notes: { type: String }, // Additional notes or comments
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Pharmacist who is demanding
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseRequest", PurchaseRequestSchema);
