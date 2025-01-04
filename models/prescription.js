const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
  {
   
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true }, // Reference to the patient
    medicaments: [
      {
        medicamentId: { type: mongoose.Schema.Types.ObjectId, ref: "InStock", required: true }, // Reference to the medicament
        quantity: { type: Number, required: true }, // quantity of the medicament 
        comment: { type: String },
      },
    ],
    status: { 
      type: String, 
      enum: ["pending", "dispensed", "cancelled"], 
      default: "pending" 
    }, // Status of the prescription
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
