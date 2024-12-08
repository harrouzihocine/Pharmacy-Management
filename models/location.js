const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  locationCode: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20,
    description: "Unique code for the location (e.g., PC-APP-CS01)",
  },
  assignedStorage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Storage',
    default: null, // Null means unassigned
},

  locationType: {
    type: String,
    required: true,
    enum: ["PC", "PS"], // PC: Pharmacy Centrale, PS: Pharmacy Service
    description: "Type of location (Pharmacy Centrale or Service)",
  },
  destinationService: {
    type: String,
    required: true,
    enum: ["APP", "URG", "LAB", "RAD"], // Service codes (e.g., Appro, Urgences)
    description: "Code for the destination service",
  },
  endroitCode: {
    type: String,
    required: true,
    description: "Code for the specific area (e.g., 1, 2, 3)",
  },
  endroitDescription: {
    type: String,
    required: true,
    maxlength: 100,
    description: "Description of the area (e.g., Couloir sous-sol, Salle de stockage)",
  },
  outilRangement: {
    type: String,
    required: true,

    description: "Storage tool code",
  },
  outilNumero: {
    type: Number,
    required: true,
    min: 1,
    description: "Number for the specific storage unit (e.g., 1, 2, 3)",
  },
  bloc: {
    type: String,
    default: null,
    description: "Bloc identifier for Rayonnage (A, B, C)",
  },
  niveauRayon: {
    type: Number,
    min: 1,
    default: null,
    description: "Level of the rayonnage (1, 2, 3)",
  },
  
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Auto-generate locationCode based on the provided fields
LocationSchema.pre("save", function (next) {
  if (!this.locationCode) {
    const endroitPart = this.endroitCode || "";
    const outilPart = this.outilRangement || "";
    const numeroPart = this.outilNumero ? `-${this.outilNumero}` : "";
    if (this.outilRangement === "RY") {
      const blocPart = this.bloc ? `-${this.bloc}` : "";
      const niveauPart = this.niveauRayon ? `-${this.niveauRayon}` : "";
      this.locationCode = `${this.locationType}-${this.destinationService}-${endroitPart}${rayonnagePart}${blocPart}${niveauPart}`;
    } else {
      this.locationCode = `${this.locationType}-${this.destinationService}-${endroitPart}-${outilPart}${numeroPart}`;
    }
  }
  next();
});

module.exports = mongoose.model("Location", LocationSchema);
