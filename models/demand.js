const mongoose = require("mongoose");
const Medicament = require("./medicament");

const demandSchema = new mongoose.Schema(
  {
    demandNumber: {
      type: String,
      unique: true, // Ensure uniqueness for each demand
    },
    status: {
      type: String,
      enum: ["En attente", "Approuvé", "Rejeté", "Terminé"], // Status options
      default: "En attente",
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      
      trim: true,
    },
    otherMedicaments: {
      type: String,
      
      trim: true,
    },
    medicaments: [
      {
        medicamentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicament", // Reference to the product collection
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1, // Quantity must be at least 1
        },
       priority: {
          type: String,
          trim: true,
        },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
// Pre-save middleware for generating demandNumber
demandSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Skip if not a new document

  const currentYear = new Date().getFullYear();
  const yearPrefix = `${currentYear}`;

  try {
    // Find the most recent demand for the current year
    const lastDemand = await this.constructor
      .findOne({ demandNumber: { $regex: `^${yearPrefix}/` } }) // Match "2024/"
      .sort({ createdAt: -1 }) // Sort by the latest creation date
      .exec();

    let nextNumber = 1; // Default starting number

    if (lastDemand) {
      // Extract the last number and increment it
      const lastNumber = parseInt(lastDemand.demandNumber.split('/')[1], 10);
      nextNumber = lastNumber + 1;
    }

    // Format the new demandNumber as YYYY/NNNN
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    this.demandNumber = `${yearPrefix}/${formattedNumber}`;
  } catch (error) {
    return next(error); // Pass the error to the next middleware
  }

  next(); // Continue with the save operation
});

module.exports = mongoose.model("Demand", demandSchema);
