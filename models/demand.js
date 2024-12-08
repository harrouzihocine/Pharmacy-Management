const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Demand Schema
const demandSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
     
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Low',
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: null,  // Optional depending on the category
    },
    contact: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model if demand is assigned to someone
      default: null,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
  }
);

// Example of pre hook to delete associated data if needed (e.g., Demand Logs)
// demandSchema.pre('findOneAndDelete', async function (next) {
//   const demandId = this.getQuery()._id;
//
//   try {
//       // Perform cleanup before deleting the demand (e.g., delete related logs)
//       await DemandLogs.deleteMany({ demandId });
//       next();
//   } catch (error) {
//       next(error);
//   }
// });

// Check if the model is already compiled to prevent OverwriteModelError
const Demand = mongoose.models.Demand || mongoose.model('Demand', demandSchema);

module.exports = Demand;
