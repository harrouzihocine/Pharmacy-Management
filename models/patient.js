const mongoose = require("mongoose");
const opts = {
  toJSON: {
    virtuals: true,
  },
};

const PatientSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true }, 
    last_name: { type: String, required: true }, 
    date_of_birth: { type: Date, required: true }, 
    gender: { type: String, required: true }, 
    address: { type: String },  // Optional field
    phone: { type: String, required: true }, 
  },
  { timestamps: true },
  opts 
);

PatientSchema.virtual("fullname").get(function () {
  return this.last_name + " " + this.first_name;
});

module.exports = mongoose.model("Patient", PatientSchema);
