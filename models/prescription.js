const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
  {
    prescriptionCode: {
      type: "string",
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
      required: true,
    },
    medicaments: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicament",
          required: true,
        },
        serviceABV: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        comment: {
          type: String,
          default: "",
        },
        status: {
          type: String,
          default: "Active",
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    distockedmedicaments: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InStock",
          required: true,
        },
        barCode: {
          type: "string",
         
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        distockedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        service: {
          type: String,
        },
        distockedAt: {
          type: Date,
        },
      },
    ], // Medicaments in stock after prescription is created
    dispensedmedicaments: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InStock",
          required: true,
        },
        quantity: {
          type: Number,
          default: 0,
          min: 0,
        },
        dispensedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        dispensedAt: {
          type: Date,
        },
        dispenseReason: {
          type: String,
          default: "",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "dispensed", "cancelled"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);
