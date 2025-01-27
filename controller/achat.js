const Medicament = require("../models/medicament");
const Pharmacy = require("../models/pharmacy");
const InStock = require("../models/inStock");
const PurchaseRequest = require("../models/purchaseRequest");
exports.getPurshaseRequestPage = async (req, res) => {
  try {
    const PurchaseRequests = await PurchaseRequest.find()
      .populate("medicaments.medicamentId")
      .populate("createdBy")
      .exec();

    res.render("Achat/purchase-requests", { PurchaseRequests });
  } catch (err) {
    
    console.error("Error getting new purchase request:", err);
    res.status(500).send("Error getting purchase requests.");
  }
};
exports.getNewPurchaseRequestPage = async (req, res) => {
  try {
    const Medicaments = await Medicament.find();

    res.render("Achat/new-purchase-request", { Medicaments });
  } catch (err) {
    console.error("Error getting new purchase request:", err);
    res.status(500).send("Error getting new purchase request.");
  }
};

exports.createPurchaseRequest = async (req, res) => {
    try {
      const { request, notes } = req.body; // Extract medicaments array and notes
      const createdBy = req.user._id; // Assuming you have authentication middleware
  
      // Validate if there are any medicaments
      if (!request || !Array.isArray(request) || request.length === 0) {
        req.flash("error", "No medicaments selected. Please add at least one medicament.");
        return res.redirect("/achat/demands/new");
      }
  
      // Validate each medicament in the array
      for (const item of request) {
        const { medicamentId, quantity } = item;
  
        if (!medicamentId || !quantity || quantity < 0) {
          req.flash("error", "Invalid data. Please check the medicament and quantity.");
          return res.redirect("/achat/demands/new");
        }
      }
  
      // Get the current month and year
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Month (01-12)
      const year = now.getFullYear(); // Year (e.g., 2024)
  
      // Find the last purchase request for the current month
      const lastRequest = await PurchaseRequest.findOne(
        {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1), // Start of the month
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1), // Start of the next month
          },
        },
        {},
        { sort: { createdAt: -1 } } // Sort by creation date descending
      );
  
      // Determine the sequence number
      let sequenceNumber = 1; // Default to 1 if no requests exist for the month
      if (lastRequest && lastRequest.PurchaseRequestCode) {
        const lastSequence = parseInt(lastRequest.PurchaseRequestCode.split("/")[0], 10);
        sequenceNumber = lastSequence + 1;
      }
  
      // Format the PurchaseRequestCode (e.g., 00101/2024)
      const PurchaseRequestCode = `${String(sequenceNumber).padStart(3, "0")}${month}/${year}`;
  
      // Create a new PurchaseRequest object
      const newPurchaseRequest = new PurchaseRequest({
        medicaments: request,
        notes,
        createdBy,
     
        PurchaseRequestCode, // Add the generated code
      });
  
      // Save the new purchase request to the database
      await newPurchaseRequest.save();
  
      // Redirect to the list of purchase requests or show a success message
      req.flash("success", "Purchase request created successfully!");
      res.redirect("/achat/demands");
    } catch (error) {
      console.error("Error creating purchase request:", error);
      req.flash("error", "Failed to create purchase request. Please try again.");
      res.redirect("/achat/demands/new");
    }
  };
exports.validatePurchaseRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await PurchaseRequest.findById(requestId);

        // Check if the request was found
        if (!request) {
            req.flash("error", "Purchase request not found.");
            return res.status(404).redirect("/achat/demands");
        }

        // Update the status
        request.status = "Pending";
        await request.save();

        req.flash("success", "Purchase request status is updated to Pending!");
        res.redirect("/achat/demands");  // Fixed the typo here
    } catch (err) {
        console.error("Error updating purchase request status:", err);
        req.flash("error", "Failed to update purchase request status. Please try again.");
        res.status(500).send("Error getting purchase requests.");
    }
};
exports.cancelPurchaseRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await PurchaseRequest.findById(requestId);

        // Check if the request was found
        if (!request) {
            req.flash("error", "Purchase request not found.");
            return res.status(404).redirect("/achat/demands");
        }

        // Update the status
        request.status = "Canceled";
        await request.save();

        req.flash("success", "Purchase request status is updated to Canceled!");
        res.redirect("/achat/demands");  // Fixed the typo here
    } catch (err) {
        console.error("Error updating purchase request status:", err);
        req.flash("error", "Failed to update purchase request status. Please try again.");
        res.status(500).send("Error getting purchase requests.");
    }
};
