const mongoose = require("mongoose");

const opts = {
  toJSON: {
    virtuals: true,
  },
};

const Schema = mongoose.Schema;

// Schema for Admission
const AdmissionSchema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    date: { type: Date, required: true }, 
    acte: { type: String },
    admissionType: { type: String, required: true }, 
    service: { type: String, required: true },   
    pharmacyserviceABV: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Admitted", "Discharged"], default: "Pending" }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  opts
);


AdmissionSchema.virtual("admissionDuration").get(function () {
  if (this.date && this.status === "Discharged") {
    const dischargeDate = new Date();
    const duration = dischargeDate - this.date;
    return `${duration} ms`; 
  }
  return null;
});

module.exports = mongoose.model("Admission", AdmissionSchema);