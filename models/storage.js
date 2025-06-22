const mongoose = require("mongoose");

const StorageSchema = new mongoose.Schema({
  storageName: { 
    type: String, 
    required: true 
  },
  serviceABV: { 
    type: String 
  },
  locationType: { 
    type: String 
  },
  locations: [
    {
      locationCode: { 
        type: String, 
       
      },
      outilRangement: { 
        type: String, 
       
      },
      outilNumero: { 
        type: Number, 

      },
      bloc: { 
        type: String, 
       
      },
      niveauRayon: { 
        type: Number, 
        
      },
    }
  ], // Array of objects with the specified properties
  service: { 
    type: String 
  },
  endroitDescription: {
    type: String,
    required: true,
    maxlength: 100,
  },
  endroitCode: {
    type: String,
    required: true,
    description: "Code for the specific area (e.g., 1, 2, 3)",
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
});


// Creating a compound index for unique constraint on the combination of storageName, service, and serviceABV
StorageSchema.index(
  { storageName: 1, service: 1, serviceABV: 1 },
  { unique: true }
);

module.exports = mongoose.model("Storage", StorageSchema);
