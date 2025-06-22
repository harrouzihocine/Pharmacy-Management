const mongoose = require("mongoose");
const opts = {
  toJSON: {
    virtuals: true,
  },
};
const Schema = mongoose.Schema;
const ContactSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  phone: { type: String },
  fax: { type: String },
  mobile: [String],
  email: { type: String, required: true },
  description: { type: String },
},
  opts
);
const Fournisseur = new Schema(
  {
    statutjuridique: { type: String },
    name: String,
    codeClient: String,
    wilaya: String,
    city: String,
    postalCode:String,
    phone: String,
    fax: String,
    mobile:[String],
    email: String,
    adress: String,
    Naccount:String,
    nrc:String,
    nif:String,
    narticle:String,
    nis:String,
    contacts: [ContactSchema],
  },
  opts
);
Fournisseur.virtual("contactCount").get(function () {
  return this.contacts.length;
});

module.exports = mongoose.model("Fournisseur", Fournisseur);
