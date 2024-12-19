const mongoose = require("mongoose");

const MedicamentSchema = new mongoose.Schema({
  code_interne: { type: Number, unique: true, required: true }, // Code interne
  code_pch: { type: String }, // CODE (PCH)
  designation: { type: String }, // Désignation
  type_medicament: { type: String }, // Type de Médicament
  
  forme: { type: String }, // Forme
  boite_de: { type: Number }, //  boite_de
  nom_commercial: { type: String }, // NOM COMMERCIAL ou LABO
  isSelected: { type: Boolean }, //
 
},
{ timestamps: true }
);

module.exports = mongoose.model("Medicament", MedicamentSchema);
