const mongoose = require("mongoose");

const MedicamentSchema = new mongoose.Schema({
  numero_enregistrement_pch: { type: String }, // N°ENREGISTREMENT (PCH)
  code_pch: { type: String }, // CODE (PCH)
  code_interne: { type: String, unique: true, required: true }, // Code interne
  dci_pch: { type: String, required: true }, // DCI (PCH)
  designation: { type: String }, // Désignation
  type_medicament: { type: String }, // Type de Médicament
  nbre_article_commun: { type: String }, // Nbre article commun
  forme: { type: String }, // Forme
  dosage: { type: String }, // Dosage
  nom_commercial: { type: String }, // NOM COMMERCIAL ou LABO
  isSelected: { type: Boolean }, //
  date_ajout: { type: Date, default: Date.now }, // Automatically added
});

module.exports = mongoose.model("Medicament", MedicamentSchema);
