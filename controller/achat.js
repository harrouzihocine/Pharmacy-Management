const mongoose = require("mongoose");
const Medicament = require("../models/medicament");
const Pharmacy = require("../models/pharmacy");
const InStock = require("../models/inStock");
const PurchaseRequest = require("../models/purchaseRequest");
const Fournisseur = require("../models/fournisseur");
const FactureProforma = require("../models/factureProforma");
const BonDeCommande = require("../models/bonDeCommande");

/*---------------------------------------------Pharmacy------------------------------------------------------*/
/*-------------------------------purchaseRequest---------------------------------*/
exports.getPurshaseRequestPage = async (req, res) => {
  try {
    const PurchaseRequests = await PurchaseRequest.find()
      .populate("createdBy")
      .sort({ createdAt: -1 })
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
   
    res.render("Achat/new-purchase-request", { Medicaments});
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
      req.flash(
        "error",
        "No medicaments selected. Please add at least one medicament."
      );
      return res.redirect("/achat/demands/new");
    }

    // Validate each medicament in the array
    for (const item of request) {
      const { medicamentId, quantity } = item;

      if (!medicamentId || !quantity || quantity < 0) {
        req.flash(
          "error",
          "Invalid data. Please check the medicament and quantity."
        );
        return res.redirect("/achat/demands/new");
      }
    }

    // Get the current year
    const now = new Date();
    const year = now.getFullYear(); // Year (e.g., 2024)

    // Find the last purchase request for the current year
    const lastRequest = await PurchaseRequest.findOne(
      {
        createdAt: {
          $gte: new Date(year, 0, 1), // Start of the year
          $lt: new Date(year + 1, 0, 1), // Start of the next year
        },
      },
      {},
      { sort: { createdAt: -1 } } // Sort by creation date descending
    );

    // Determine the sequence number
    let sequenceNumber = 1; // Default to 1 if no requests exist for the year
    if (lastRequest && lastRequest.PurchaseRequestCode) {
      const lastSequence = parseInt(
        lastRequest.PurchaseRequestCode.split("/")[0],
        10
      );
      sequenceNumber = lastSequence + 1;
    }

    // Format the PurchaseRequestCode (e.g., 0001/2024)
    const PurchaseRequestCode = `${String(sequenceNumber).padStart(
      4,
      "0"
    )}/${year}`;

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
    res.redirect("/achat/demands"); // Fixed the typo here
  } catch (err) {
    console.error("Error updating purchase request status:", err);
    req.flash(
      "error",
      "Failed to update purchase request status. Please try again."
    );
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
    res.redirect("/achat/demands"); // Fixed the typo here
  } catch (err) {
    console.error("Error updating purchase request status:", err);
    req.flash(
      "error",
      "Failed to update purchase request status. Please try again."
    );
    res.status(500).send("Error getting purchase requests.");
  }
};
exports.getPurchaseRequestDetailsPage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const purchaseRequest = await PurchaseRequest.findById(requestId)
      .populate("medicaments.medicamentId")
      .populate("createdBy")
      .exec();

    res.render("Achat/purchase-request-details", { purchaseRequest });
  } catch (err) {
    console.error("Error getting purchase request details:", err);
    res.status(500).send("Error getting purchase request details.");
  }
};
exports.deleteitemPurchaseRequest = async (req, res) => {
  try {
    const { itemId, requestId } = req.params;

    // Find the PurchaseRequest document
    const request = await PurchaseRequest.findById(requestId);

    // Check if the request was found
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase request not found." });
    }

    // Find the index of the medicament to delete
    const medicamentIndex = request.medicaments.findIndex(
      (medicament) => medicament._id.toString() === itemId
    );

    // Check if the medicament was found
    if (medicamentIndex === -1) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Item not found in the purchase request.",
        });
    }

    // Remove the medicament from the array
    request.medicaments.splice(medicamentIndex, 1);

    // Save the updated PurchaseRequest document
    await request.save();

    return res
      .status(200)
      .json({ success: true, message: "Item deleted successfully!" });
  } catch (err) {
    console.error("Error deleting Item from purchase request:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete Item. Please try again.",
      });
  }
};
/*-------------------------------Approvissionement--------------------------------*/
/*-------------------------dashboard-------------------------*/

exports.getApprovisionementPage = async (req, res) => {
  try {
    const Pharmacies = await Pharmacy.find();
    const Medicaments = await Medicament.find();

    res.render("Achat/dashboard", { Pharmacies, Medicaments });
  } catch (err) {
    console.error("Error getting approvisionement page:", err);
    res.status(500).send("Error getting approvisionement page.");
  }
};
/*-------------------------------Demands----------------------*/
exports.getApprovisionementDemandsPage = async (req, res) => {
  try {
    const PurchaseRequests = await PurchaseRequest.find({
      status: { $in: ["Pending", "Treated"] }
    })
      .populate("createdBy")
      .sort({ createdAt: -1 });
    

    res.render("Achat/Approvisionnement/demands", { PurchaseRequests });
  } catch (err) {
    console.error("Error getting approvisionement page:", err);
    res.status(500).send("Error getting approvisionement page.");
  }
};

exports.getApprovisionementDemandDetailsPage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const purchaseRequest = await PurchaseRequest.findById(requestId)
      .populate("medicaments.medicamentId")
      .populate("createdBy")
      .exec();
    const fournisseurs = await Fournisseur.find();
    res.render("Achat/Approvisionnement/demands-details", {
      purchaseRequest,
      fournisseurs,
    });
  } catch (err) {
    console.error("Error getting purchase request details:", err);
    res.status(500).send("Error getting purchase request details.");
  }
};
/*-------------------------proforma----------------------*/
exports.getNewFactureProformaPage = async (req, res) => {
  try {
    const Medicaments = await Medicament.find();
    const fournisseurs = await Fournisseur.find();
    res.render("Achat/new-facture-proforma", { Medicaments,fournisseurs });
  } catch (err) {
    console.error("Error getting new purchase request:", err);
    res.status(500).send("Error getting new purchase request.");
  }
};
exports.createFactureProforma = async (req, res) => {
  try {
    const { demandId, facturesByFournisseur } = req.body;

    const createdFactures = [];

    // Get the current year
    const now = new Date();
    const year = now.getFullYear(); // Current year (e.g., 2024)

    // Find the last facture created for the current year
    const lastFacture = await FactureProforma.findOne(
      {
        createdAt: {
          $gte: new Date(year, 0, 1), // Start of the year
          $lt: new Date(year + 1, 0, 1), // Start of the next year
        },
      },
      {},
      { sort: { createdAt: -1 } } // Sort by creation date descending
    );

    // Determine the starting sequence number for the facture proforma code
    let sequenceNumber = 1; // Default to 1 if no invoices exist for the year
    if (lastFacture && lastFacture.factureProformaCode) {
      const lastSequence = parseInt(
        lastFacture.factureProformaCode.split("/")[0],
        10
      );
      sequenceNumber = lastSequence + 1;
    }

    // Loop over the facturesByFournisseur and create FactureProforma for each fournisseur
    for (const fournisseurId in facturesByFournisseur) {
      const medicaments = facturesByFournisseur[fournisseurId];

      // Ensure medicaments is not null or undefined before applying filter
      if (!medicaments) continue;

      // Filter out medicaments that don't have a selected fournisseur
      const validMedicaments = medicaments.filter((medicament) => {
        // Ensure valid quantity and quantityDemanded are present
        const quantity = medicament.quantity;
        const quantityDemanded = medicament.quantityDemanded;

        // If no quantity or quantityDemanded or if they're not numbers, skip
        return (
          quantity &&
          !isNaN(quantity) &&
          quantityDemanded &&
          !isNaN(quantityDemanded)
        );
      });

      // Skip creating facture for fournisseur if no valid medicaments
      if (validMedicaments.length === 0) {
        continue;
      }

      // Ensure medicaments array has the correct structure
      const medicamentDetails = validMedicaments.map((medicament) => ({
        medicamentId: new mongoose.Types.ObjectId(medicament.medicamentId), // Use 'new' to create ObjectId
        quantity: medicament.quantity,
        quantityDemanded: medicament.quantityDemanded, // Include quantity demanded
      }));

      // Generate facture proforma code for each facture in the loop (ensure unique codes)
      const factureProformaCode = `${String(sequenceNumber).padStart(
        4,
        "0"
      )}/${year}`;

      // Create facture proforma for valid fournisseur
      const facture = await FactureProforma.create({
        factureProformaCode: factureProformaCode, // Add the generated unique code
        fournisseur: fournisseurId,
        demandId: demandId,
        medicaments: medicamentDetails,
        createdBy: req.user._id, // Assuming req.user._id contains the ID of the logged-in user
        createdAt: new Date(),
      });

      createdFactures.push(facture);

      // Increment sequence number for the next facture
      sequenceNumber++;
    }

    // Update the PurchaseRequest status to 'Treated'
    await PurchaseRequest.findByIdAndUpdate(demandId, {
      status: "Treated",
    });

    res.status(201).json({
      message:
        "Factures Proforma created and PurchaseRequest status updated to 'Treated' successfully!",
      createdFactures,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
exports.createFromEmptyFactureProforma = async (req, res) => {
  try {
    const { request, notes } = req.body; 
    const createdBy = req.user._id; 

    // Validate if there are any medicaments
    if (!request || !Array.isArray(request) || request.length === 0) {
      req.flash(
        "error",
        "No medicaments selected. Please add at least one medicament."
      );
      return res.redirect("/achat/approvisionnement/facture-proforma/new");
    }

    // Validate each medicament in the array
    for (const item of request) {
      const { medicamentId, quantity } = item;

      if (!medicamentId || !quantity || quantity < 0) {
        req.flash(
          "error",
          "Invalid data. Please check the medicament and quantity."
        );
        return res.redirect("/achat/approvisionnement/facture-proforma/new");
      }
    }

    // Get the current year
    const now = new Date();
    const year = now.getFullYear(); // Year (e.g., 2024)

    // Find the last purchase request for the current year
    const lastRequest = await FactureProforma.findOne(
      {
        createdAt: {
          $gte: new Date(year, 0, 1), // Start of the year
          $lt: new Date(year + 1, 0, 1), // Start of the next year
        },
      },
      {},
      { sort: { createdAt: -1 } } // Sort by creation date descending
    );

    // Determine the sequence number
    let sequenceNumber = 1; // Default to 1 if no requests exist for the year
    if (lastRequest && lastRequest.factureProformaCode) {
      const lastSequence = parseInt(
        lastRequest.factureProformaCode.split("/")[0],
        10
      );
      sequenceNumber = lastSequence + 1;
    }

    // Format the PurchaseRequestCode (e.g., 0001/2024)
    const factureProformaCode = `${String(sequenceNumber).padStart(
      4,
      "0"
    )}/${year}`;

    // Create a new PurchaseRequest object
    const newPurchaseRequest = new FactureProforma({
      medicaments: request,
      notes,
      createdBy,
      factureProformaCode, 
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
exports.getFactureProformaPage = async (req, res) => {
  try {
    // Fetch FactureProforma records, populating relevant fields and excluding medicament details
    const factureProformas = await FactureProforma.find()
      .populate("demandId") // Populate PurchaseRequest reference
      .populate("fournisseur") // Populate Fournisseur reference
      .populate("createdBy") // Populate User who created it
      .select("-medicaments")
      .sort({ createdAt: -1 }); 
    res.render("Achat/Approvisionnement/facture-proforma", {
      factureProformas,
    });
  } catch (err) {
    console.error("Error fetching facture proforma page:", err);
    res.status(500).send("Error fetching facture proforma page.");
  }
};
exports.getFactureProformaDetailsPage = async (req, res) => {
  try {
    const { factureProformaId } = req.params;
    const factureProforma = await FactureProforma.findById(factureProformaId)
      .populate("demandId")
      .populate("medicaments.medicamentId") // Populate the medicament details
      .populate("fournisseur") // Populate fournisseur details
      .populate("createdBy"); // Populate the user who created the invoice

    if (!factureProforma) {
      req.flash("error", "Facture Proforma not found.");
      return res.status(404).send("Facture Proforma not found.");
    }

    res.render("Achat/Approvisionnement/facture-proforma-details", {
      factureProforma,
    });
  } catch (err) {
    console.error("Error fetching facture proforma page:", err);
    res.status(500).send("Error fetching facture proforma page.");
  }
};
exports.cancelFactureProforma = async (req, res) => {
  try {
    const { factureProformaId } = req.params;
    const request = await FactureProforma.findById(factureProformaId);

    // Check if the request was found
    if (!request) {
      req.flash("error", "Facture Proforma not found.");
      return res.status(404).redirect("/achat/approvisionnement/facture-proforma");
    }

    // Update the status
    request.status = "Canceled";
    await request.save();

    req.flash("success", "Facture Proforma status is updated to Canceled!");
    res.redirect("/achat/approvisionnement/facture-proforma"); // Fixed the typo here
  } catch (err) {
    console.error("Error updating Facture Proforma status:", err);
    req.flash(
      "error",
      "Failed to update Facture Proforma status. Please try again."
    );
    res.status(500).send("Error getting Facture Proforma.");
  }
};
/*-------------------------BC------------------------*/
exports.createBC = async (req, res) => {
  try {
    const { factureProformaId, demandId, fournisseurId, comment } = req.body;
    let medicaments = req.body.medicaments;

    // Ensure medicaments is parsed correctly
    if (typeof medicaments === "string") {
      try {
        medicaments = JSON.parse(medicaments);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid medicaments data format",
        });
      }
    }

    // Handle multiple files if uploaded
    let attachments = [];
    if (req.files) {
      attachments = req.files.map(file => file.filename); // Save only the filename
    }
    // Get the current year
    const now = new Date();
    const year = now.getFullYear();

    // Find the last BC created for the current year
    const lastBC = await BonDeCommande.findOne(
      {
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        },
      },
      {},
      { sort: { createdAt: -1 } }
    );

    // Determine the starting sequence number
    let sequenceNumber = lastBC && lastBC.bonCommandeCode
      ? parseInt(lastBC.bonCommandeCode.split("/")[0], 10) + 1
      : 1;

    // Generate bcCode
    const bcCode = `${String(sequenceNumber).padStart(4, "0")}/${year}`;

    // Create Bon de Commande
    const newBC = new BonDeCommande({
      bonCommandeCode: bcCode,
      factureProformaId,
      demandId,
      fournisseurId,
      comment,
      createdBy: req.user._id,
      medicaments: medicaments.map(m => ({
        medicamentId: m.medicamentId,
        orderQuantity: parseInt(m.orderQuantity, 10),
      })),
      attachments: attachments,
    });

    const savedBC = await newBC.save();

    // Update the PurchaseRequest status to 'Treated'
    await FactureProforma.findByIdAndUpdate(factureProformaId, {
      status: "Treated",
    });

    res.json({
      success: true,
      message: "Bon de commande created successfully",
      data: savedBC,
      attachments: attachments,
    });
  } catch (error) {
    console.error("Error creating Bon de Commande:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.createBCFromDemand = async (req, res) => {
  try {
    const { demandId, facturesByFournisseur } = req.body;

    const createdFactures = [];

    // Get the current year
    const now = new Date();
    const year = now.getFullYear(); // Current year (e.g., 2024)

    // Find the last facture created for the current year
    const lastFacture = await BonDeCommande.findOne(
      {
        createdAt: {
          $gte: new Date(year, 0, 1), // Start of the year
          $lt: new Date(year + 1, 0, 1), // Start of the next year
        },
      },
      {},
      { sort: { createdAt: -1 } } // Sort by creation date descending
    );

    // Determine the starting sequence number for the facture proforma code
    let sequenceNumber = 1; // Default to 1 if no invoices exist for the year
    if (lastFacture && lastFacture.bonCommandeCode) {
      const lastSequence = parseInt(
        lastFacture.bonCommandeCode.split("/")[0],
        10
      );
      sequenceNumber = lastSequence + 1;
    }

    // Loop over the facturesByFournisseur and create FactureProforma for each fournisseur
    for (const fournisseurId in facturesByFournisseur) {
      const medicaments = facturesByFournisseur[fournisseurId];

      // Ensure medicaments is not null or undefined before applying filter
      if (!medicaments) continue;

      // Filter out medicaments that don't have a selected fournisseur
      const validMedicaments = medicaments.filter((medicament) => {
        // Ensure valid quantity and quantityDemanded are present
        const quantity = medicament.quantity;
        const quantityDemanded = medicament.quantityDemanded;

        // If no quantity or quantityDemanded or if they're not numbers, skip
        return (
          quantity &&
          !isNaN(quantity) &&
          quantityDemanded &&
          !isNaN(quantityDemanded)
        );
      });

      // Skip creating facture for fournisseur if no valid medicaments
      if (validMedicaments.length === 0) {
        continue;
      }

      // Ensure medicaments array has the correct structure
      const medicamentDetails = validMedicaments.map((medicament) => ({
        medicamentId: new mongoose.Types.ObjectId(medicament.medicamentId), // Use 'new' to create ObjectId
        orderQuantity: medicament.quantity,
        quantityDemanded: medicament.quantityDemanded, // Include quantity demanded
      }));

      // Generate facture proforma code for each facture in the loop (ensure unique codes)
      const bonCommandeCode = `${String(sequenceNumber).padStart(
        4,
        "0"
      )}/${year}`;

      // Create BC for valid fournisseur
      const facture = await BonDeCommande.create({
        bonCommandeCode: bonCommandeCode,
        fournisseurId: fournisseurId,
        demandId: demandId,
        medicaments: medicamentDetails,
        createdBy: req.user._id, // Assuming req.user._id contains the ID of the logged-in user
        createdAt: new Date(),
      });

      createdFactures.push(facture);

      // Increment sequence number for the next facture
      sequenceNumber++;
    }

    // Update the PurchaseRequest status to 'Treated'
    await PurchaseRequest.findByIdAndUpdate(demandId, {
      status: "Treated",
    });

    res.status(201).json({
      message:
        "BC is created and PurchaseRequest status is updated to 'Treated' successfully!",
      
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
exports.getBCPage = async (req, res) => {
  try {
    
  
    const BonCommandes = await BonDeCommande.find()
      .populate("demandId") 
      .populate("fournisseurId") 
      .populate("createdBy") 
      .select("-medicaments")
      .sort({ createdAt: -1 }); 

    res.render("Achat/Approvisionnement/bon-commande", {
      BonCommandes,
    });
  } catch (err) {
    console.error("Error fetching bon commande page:", err);
    res.status(500).send("Error fetching facture proforma page.");
  }
};
exports.updateStatusBC = async (req, res) => {
  try {
    const { BCId, status } = req.body;
   

    // Check if required fields are provided
    if (!BCId || !status) {
      return res.status(400).json({ success: false, message: "Missing BCId or status." });
    }

    // Find Bon de Commande by ID
    const bonDeCommande = await BonDeCommande.findById(BCId);

    if (!bonDeCommande) {
      return res.status(404).json({ success: false, message: "Bon de commande not found." });
    }

    // Update the status
    bonDeCommande.status = status;
    await bonDeCommande.save();

    // Send success response
    res.json({ success: true, message: "Bon de commande status updated successfully.", updatedStatus: status });

  } catch (err) {
    console.error("Error updating Bon de Commande status:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.getBCDetailsPage = async (req, res) => {
  try {
    const { BCId } = req.params;
    const bonDeCommande = await BonDeCommande.findById(BCId)
      .populate("demandId")
      .populate("medicaments.medicamentId") 
      .populate("fournisseurId") 
      .populate("createdBy"); 

    if (!bonDeCommande) {
      req.flash("error", "Bon commande not found.");
      return res.status(404).send("Bon commande details not found.");
    }
    res.render("Achat/Approvisionnement/bon-commande-details", {
      bonDeCommande,
    });
  } catch (err) {
    console.error("Error fetching Bon commande details page:", err);
    res.status(500).send("Error fetching Bon commande details page.");
  }
};

exports.addAttachments = async (req, res) => {
  try {
    const BCId = req.body.bonDeCommandeId;  // Get bonDeCommande ID
    const files = req.files; // Get the uploaded files (from multer)
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const fileNames = files.map(file => file.filename);  // Get filenames from the uploaded files

    // Find the BonDeCommande by ID
    const bonDeCommande = await BonDeCommande.findById(BCId);
    if (!bonDeCommande) {
      return res.status(404).json({ error: 'BonDeCommande not found.' });
    }

    // Add the file names to the attachments field in BonDeCommande
    bonDeCommande.attachments.push(...fileNames);

    // Save the BonDeCommande with the new attachments
    await bonDeCommande.save();

    res.json({ success: true, message: 'Files uploaded successfully!', fileNames });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.getAttachments = async (req, res) => {
  try {
    const BCId = req.params.BCId;  
    const bonDeCommande = await BonDeCommande.findById(BCId);
    console.log(bonDeCommande)
    if (!bonDeCommande) {
      return res.status(404).json({ error: 'BonDeCommande not found.' });
    }

    res.json({ success: true, attachments: bonDeCommande.attachments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};