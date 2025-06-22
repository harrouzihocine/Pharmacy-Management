const mongoose = require("mongoose");

const opts = {
  toJSON: {
    virtuals: true,
  },
};

const DispensingSchema = new mongoose.Schema(
   {    serviceABV: {
      type: String,
      required: true,
    },
    totalItems: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CreationDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
  opts
);

const DispensingItemsSchema = new mongoose.Schema(
  {
    medicamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicament",
      required: true,
    },
    dispensingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispensing",
      required: true,
    },
   
    locationCode: { type: String },
    barcode: { type: String },
    quantity: { type: Number, required: true },
    purchase_price: { type: Number },
    tva: { type: String },
    serialNumber: { type: String },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedAt: { type: Date, default: Date.now },
    dispensingDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true },
  opts
);

// Middleware to update totalItems in Dispensing when an item is added/removed
DispensingItemsSchema.post("save", async function () {
  const Dispensing = mongoose.model("Dispensing");
  const DispensingItems = mongoose.model("DispensingItems");

  // Calculate total quantity (sum of all quantities) for this dispensing
  const result = await DispensingItems.aggregate([
    { $match: { dispensingId: this.dispensingId } },
    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
  ]);

  const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;

  // Update the dispensing document with new total
  await Dispensing.findByIdAndUpdate(this.dispensingId, { totalItems: totalQuantity });
});

DispensingItemsSchema.post("remove", async function () {
  const Dispensing = mongoose.model("Dispensing");
  const DispensingItems = mongoose.model("DispensingItems");

  // Calculate total quantity (sum of all quantities) for this dispensing after removal
  const result = await DispensingItems.aggregate([
    { $match: { dispensingId: this.dispensingId } },
    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
  ]);

  const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;

  // Update the dispensing document with new total
  await Dispensing.findByIdAndUpdate(this.dispensingId, { totalItems: totalQuantity });
});

// When multiple items are deleted (e.g. when deleting entire dispensing)
DispensingItemsSchema.pre("deleteMany", async function () {
  const dispensingIds = await this.model.distinct("dispensingId", this.getQuery());

  for (const dispensingId of dispensingIds) {
    // Calculate total quantity for each dispensing
    const result = await this.model.aggregate([
      { $match: { dispensingId: dispensingId } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
    ]);

    const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;

    await mongoose.model("Dispensing").findByIdAndUpdate(dispensingId, {
      totalItems: totalQuantity,
    });
  }
});

const Dispensing = mongoose.model("Dispensing", DispensingSchema);
const DispensingItems = mongoose.model("DispensingItems", DispensingItemsSchema);

module.exports = { Dispensing, DispensingItems };
