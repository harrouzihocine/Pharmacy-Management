const mongoose = require("mongoose");
const Medicament = require("../models/medicament");
const Pharmacy = require("../models/pharmacy");
const InStock = require("../models/inStock");
const PurchaseRequest = require("../models/purchaseRequest");
const Fournisseur = require("../models/fournisseur");
const FactureProforma = require("../models/factureProforma");
const BonDeCommande = require("../models/bonDeCommande");
const BonDeReception = require("../models/bonDeReception");
const BonEntree = require("../models/bonEntree");
const BonEntreeItem = require("../models/bonEntreeItem");
const User = require("../models/user");
const Storage = require("../models/storage");
const services = [
  { _id: 'PCS', name: 'Pharmacie centrale' },
    { _id: 'APP', name: 'Approvisionnement' },
    { _id: 'CON', name: 'Consultations' },
    { _id: 'RAD', name: 'Radiologie' },
    { _id: 'LAM', name: "Laboratoire d'analyse médicale" },
    { _id: 'LAP', name: "Laboratoire d'anatomie-pathologique" },
    { _id: 'HMU', name: 'Hospitalisation multidisciplinaire' },
    { _id: 'HCA', name: 'Hospitalisation de cardiologie' },
    { _id: 'URG', name: 'Urgences médicales' },
    { _id: 'BOP', name: 'Blocs opératoires' },
    { _id: 'CAT', name: 'Cathétérisme' },
    { _id: 'REA', name: 'Réanimation' },
    { _id: 'MIN', name: 'Médecine Interne' },
    { _id: 'MPR', name: 'Médecine physique et réadaptation' },
    { _id: 'DAF', name: 'Direction administrative et finance' },
   
  ];
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

  // Get current year for D code
const now = new Date();
const fullYear = now.getFullYear(); // e.g., 2025
const yearShort = fullYear % 100;     // e.g., 2025 -> 25

// Find the last PurchaseRequest for the current year using createdAt
const lastRequest = await PurchaseRequest.findOne(
  {
    createdAt: {
      $gte: new Date(fullYear, 0, 1), // Start of the year
      $lt: new Date(fullYear + 1, 0, 1) // Start of the next year
    },
  },
  {},
  { sort: { createdAt: -1 } } // Sort by creation date descending
);

// Determine the sequence number based on the last generated code
let sequenceNumber = 1;
if (lastRequest && lastRequest.PurchaseRequestCode) {
  // Assuming the format is DYY/NNNN
  // For example, "D25/0001": split the code by "/" to extract the sequence part.
  const parts = lastRequest.PurchaseRequestCode.split("/");
  if (parts.length > 1) {
    // parts[1] is the numeric sequence (e.g., "0001")
    const lastSequence = parseInt(parts[1], 10);
    sequenceNumber = lastSequence + 1;
  }
}

// Generate the PurchaseRequestCode in the format DYY/NNNN
const PurchaseRequestCode = `D${yearShort}/${String(sequenceNumber).padStart(4, "0")}`;


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
      return res.status(404).json({
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
    return res.status(500).json({
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
      status: { $in: ["Pending", "Treated"] },
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
   const fournisseurs = await Fournisseur.find().sort({ name: 1 });

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
   const fournisseurs = await Fournisseur.find().sort({ name: 1 });

    res.render("Achat/new-facture-proforma", { Medicaments, fournisseurs });
  } catch (err) {
    console.error("Error getting facture-proforma request:", err);
    res.status(500).send("Error getting facture-proforma request.");
  }
};
exports.createFactureProforma = async (req, res) => {
  try {
    const { demandId, facturesByFournisseur } = req.body;

    const createdFactures = [];

    const now = new Date();
    const fullYear = now.getFullYear();
    const yearShort = fullYear % 100; // e.g., 2025 -> 25
    
    // Find the last FactureProforma for the current year using createdAt
    const lastFacture = await FactureProforma.findOne(
      {
        createdAt: {
          $gte: new Date(fullYear, 0, 1),
          $lt: new Date(fullYear + 1, 0, 1),
        },
      },
      {},
      { sort: { createdAt: -1 } }
    );
    
    // Determine the starting sequence number for the FP code
    let sequenceNumber = 1;
    if (lastFacture && lastFacture.factureProformaCode) {
      // Assuming the format is FPYY/NNNN, split the code on '/'
      const parts = lastFacture.factureProformaCode.split("/");
      if (parts.length > 1) {
        const lastSequence = parseInt(parts[1], 10);
        sequenceNumber = lastSequence + 1;
      }
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

      const factureProformaCode = `FP${yearShort}/${String(sequenceNumber).padStart(4, "0")}`;

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

    // Validate request data
    if (!request || !Array.isArray(request) || request.length === 0) {
      req.flash("error", "No items selected. Please add at least one item.");
      return res.redirect("/achat/approvisionnement/facture-proforma/new");
    }
// Get current year for FP code
const now = new Date();
const fullYear = now.getFullYear();
const yearShort = fullYear % 100; // e.g., 2025 -> 25

// Find the last FactureProforma for the current year using createdAt
const lastFacture = await FactureProforma.findOne(
  {
    createdAt: {
      $gte: new Date(fullYear, 0, 1),
      $lt: new Date(fullYear + 1, 0, 1),
    },
  },
  {},
  { sort: { createdAt: -1 } }
);

// Determine the starting sequence number for the FP code
let sequenceNumber = 1;
if (lastFacture && lastFacture.factureProformaCode) {
  // Assuming the format is FPYY/NNNN, split the code on '/'
  const parts = lastFacture.factureProformaCode.split("/");
  if (parts.length > 1) {
    const lastSequence = parseInt(parts[1], 10);
    sequenceNumber = lastSequence + 1;
  }
}

// Generate the FP code in the format FPYY/NNNN
const factureProformaCode = `FP${yearShort}/${String(sequenceNumber).padStart(4, "0")}`;



    // Group items by fournisseur
    const facturesByFournisseur = {};

    request.forEach((item) => {
      const { medicamentId, quantity, fournisseurs } = item;

      // Ensure fournisseurs is treated as an array
      let fournisseurArray = fournisseurs;
      if (typeof fournisseurs === "string") {
        fournisseurArray = [fournisseurs];
      } else if (Array.isArray(fournisseurs)) {
        fournisseurArray = fournisseurs;
      } else {
        console.log("Invalid fournisseurs format:", fournisseurs);
        throw new Error("Invalid fournisseurs format");
      }

      // Skip if no valid data
      if (
        !medicamentId ||
        !quantity ||
        quantity < 0 ||
        !fournisseurArray.length
      ) {
        console.log("Skipping invalid item:", item);
        return;
      }

      // For each selected fournisseur in the item
      fournisseurArray.forEach((fournisseurId) => {
        if (!facturesByFournisseur[fournisseurId]) {
          facturesByFournisseur[fournisseurId] = [];
        }

        facturesByFournisseur[fournisseurId].push({
          medicamentId,
          quantity: Number(quantity),
        });
      });
    });

    // Validate if we have any valid groupings
    if (Object.keys(facturesByFournisseur).length === 0) {
      req.flash("error", "No valid items with fournisseurs found.");
      return res.redirect("/achat/approvisionnement/facture-proforma/new");
    }

    // Create facture proforma for each fournisseur
    const createdFactures = [];
    for (const [fournisseurId, medicaments] of Object.entries(
      facturesByFournisseur
    )) {
    
      const facture = new FactureProforma({
        factureProformaCode,
        fournisseur: fournisseurId,
        medicaments: medicaments.map((med) => ({
          medicamentId: med.medicamentId,
          quantity: med.quantity,
        })),
        status: "Draft",
        createdBy,
        notes,
        createdAt: new Date(),
      });

      await facture.save();
      createdFactures.push(facture);
    }

    req.flash(
      "success",
      `Created ${createdFactures.length} facture(s) proforma successfully!`
    );
    res.redirect("/achat/approvisionnement/facture-proforma");
  } catch (error) {
    console.error("Error creating facture proforma:", error);
    req.flash("error", "Failed to create facture proforma. Please try again.");
    res.redirect("/achat/approvisionnement/facture-proforma/new");
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
      return res
        .status(404)
        .redirect("/achat/approvisionnement/facture-proforma");
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
    const { factureProformaId, fournisseurId, comment } = req.body;
    const demandId = req.body.demandId || null;
    let medicaments = req.body.medicaments;

    // Validate required fields
    if (!factureProformaId || !fournisseurId ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

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

    // Validate medicaments array
    if (!Array.isArray(medicaments) || medicaments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item with quantity is required",
      });
    }

    let attachments = [];
    if (req.files) {
      attachments = req.files.map((file) => file.filename);
    }
    const fullYear = new Date().getFullYear();
    const yearShort = fullYear % 100; // e.g., 2025 -> 25
    
    // Create a regex to match codes starting with the current year's prefix (e.g., "BC25/")
    const codePattern = new RegExp(`^BC${yearShort}/`);
    
    // Find the last BonDeCommande using bonCommandeCode (assumes codes are zero-padded so lexicographical sort works)
    const lastBC = await BonDeCommande.findOne(
      { bonCommandeCode: codePattern },
      {},
      { sort: { bonCommandeCode: -1 } }
    );
    
    let sequenceNumber = 1;
    if (lastBC && lastBC.bonCommandeCode) {
      // Split the code to get the sequence number part after the '/'
      const parts = lastBC.bonCommandeCode.split("/");
      if (parts.length > 1) {
        sequenceNumber = parseInt(parts[1], 10) + 1;
      }
    }
    
    // Generate the new code in the format BCYY/NNNN
    const bcCode = `BC${yearShort}/${String(sequenceNumber).padStart(4, "0")}`;

    // Create BC object with optional demandId
    const bcData = {
      bonCommandeCode: bcCode,
      factureProformaId,
      fournisseurId,
      comment,
      createdBy: req.user._id,
      medicaments: medicaments.map((m) => ({
        medicamentId: m.medicamentId,
        orderQuantity: parseInt(m.orderQuantity, 10),
      })),
      attachments: attachments,
      createdAt: new Date(),
    };

    // Only add demandId if it exists
    if (demandId) {
      bcData.demandId = demandId;
    }

    // Create and save Bon de Commande
    const newBC = new BonDeCommande(bcData);
    const savedBC = await newBC.save();

    // Update FactureProforma status
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
      message:
        error.message || "An error occurred while creating Bon de Commande",
    });
  }
};

exports.createBCFromDemand = async (req, res) => {
  try {
    const { demandId, facturesByFournisseur } = req.body;

    const createdFactures = [];

 // Get the current year and extract the last two digits (e.g., 2025 -> 25)
const now = new Date();
const fullYear = now.getFullYear();
const yearDigits = fullYear % 100;

// Create a regex pattern to match codes starting with the current year's prefix (e.g., "BC25/")
const codePattern = new RegExp(`^BC${yearDigits}/`);

// Find the last BonDeCommande whose bonCommandeCode matches the pattern
const lastFacture = await BonDeCommande.findOne(
  { bonCommandeCode: codePattern },
  {},
  { sort: { bonCommandeCode: -1 } } // Lexicographical sort works because the sequence is zero-padded
);

// Determine the starting sequence number for the bonCommandeCode
let sequenceNumber = 1; // Default to 1 if no codes exist for the year
if (lastFacture && lastFacture.bonCommandeCode) {
  // Split the code on '/' and use the sequence number part (after the '/')
  const parts = lastFacture.bonCommandeCode.split("/");
  if (parts.length > 1) {
    const lastSequence = parseInt(parts[1], 10);
    sequenceNumber = lastSequence + 1;
  }
}

// Generate the bonCommandeCode in the format BCYY/NNNN


    // Loop over the facturesByFournisseur and create FactureProforma for each fournisseur
    for (const fournisseurId in facturesByFournisseur) {
      const medicaments = facturesByFournisseur[fournisseurId];
      const bonCommandeCode = `BC${yearDigits}/${String(sequenceNumber).padStart(4, "0")}`;
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
    res.status(500).send("Error fetching bon reception page.");
  }
};
exports.getEditBCPage = async (req, res) => {
  try {
    const BonCommande = await BonDeCommande.findById(req.params.BCId)
      .populate("demandId")
      .populate("fournisseurId")
      .populate("createdBy")
      .populate("medicaments.medicamentId")
      .sort({ createdAt: -1 });
    const Fournisseurs = await Fournisseur.find().sort({ name: 1 });
    const Medicaments = await Medicament.find();
 
    res.render("Achat/Approvisionnement/edit-bon-commande", {
      BonCommande,
      Fournisseurs,
      Medicaments,
    });
  } catch (err) {
    console.error("Error fetching bon commande page:", err);
    res.status(500).send("Error fetching bon commande page.");
  }
};
exports.updateBonCommande = async (req, res) => {
  const { BCId } = req.params; // Get the Bon de Commande ID from the URL
  const {
    fournisseurId,
    dateBonCommande,
    medicaments,
    comment,
  } = req.body;

  try {
    // Validate required fields
    if (!fournisseurId ||!dateBonCommande || !medicaments) {
      req.flash("error", "Required inputs are missing: Fournisseur, Date, or Medicaments.");
      return res.redirect(`/achat/approvisionnement/BC/edit/${BCId}`);
    }

    // Find the existing Bon de Commande
    const bonCommande = await BonDeCommande.findById(BCId);
    if (!bonCommande) {
      req.flash("error", "Bon de Commande not found.");
      return res.redirect("/achat/approvisionnement/BC");
    }

    // Validate Fournisseur
    const fournisseur = await Fournisseur.findById(fournisseurId);
    if (!fournisseur) {
      req.flash("error", "Fournisseur not found.");
      return res.redirect(`/achat/approvisionnement/BC/edit/${BCId}`);
    }

    // Process medicaments
    const processedMedicaments = [];
    if (Array.isArray(medicaments)) {
      for (const item of medicaments) {
        if (item.medicamentId && item.quantity) {
          const medicament = await Medicament.findById(item.medicamentId);
          if (!medicament) {
            req.flash("error", `Medicament with ID ${item.medicamentId} not found.`);
            return res.redirect(`/achat/approvisionnement/BC/edit/${BCId}`);
          }
          processedMedicaments.push({
            medicamentId: item.medicamentId,
            orderQuantity: Number(item.quantity),
          });
        }
      }
    }
console.log(dateBonCommande);
    // Update Bon de Commande fields
    bonCommande.fournisseurId = fournisseurId;
    bonCommande.medicaments = processedMedicaments;
    bonCommande.status = "Pending";
    bonCommande.comment = comment || "";
    bonCommande.createdAt = new Date(dateBonCommande + ':00');
    bonCommande.updatedAt = new Date();

    // Save the updated Bon de Commande
    await bonCommande.save();

    req.flash("success", "Bon de Commande updated successfully!");
    res.redirect("/achat/approvisionnement/BC");
  } catch (err) {
    console.error("Error updating Bon de Commande:", err);
    req.flash("error", "An error occurred while updating the Bon de Commande.");
    res.redirect(`/achat/approvisionnement/BC/edit/${BCId}`);
  }
};
exports.getCreateEmptyBCPage = async (req, res) => {
  try {
    const Medicaments = await Medicament.find();
   const fournisseurs = await Fournisseur.find().sort({ name: 1 });

    res.render("Achat/Approvisionnement/new-bon-commande", {
      Medicaments,
      fournisseurs,
    });
  } catch (err) {
    console.error("Error getting bon-commande request:", err);
    res.status(500).send("Error getting bon-commande request.");
  }
};
exports.CreateFromEmptyBC = async (req, res) => {
  try {
    const { fournisseurId, date, notes, request } = req.body;

    // Validate required fields
    if (
      !fournisseurId ||
      !date ||
      !Array.isArray(request) ||
      request.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fournisseur, date, or items",
      });
    }

   

    // Format medicaments array from request
    const medicaments = request.map((item) => ({
      medicamentId: item.medicamentId,
      orderQuantity: parseInt(item.quantity, 10),
    }));

    // Validate medicaments data
    if (
      medicaments.some(
        (m) => !m.medicamentId || isNaN(m.orderQuantity) || m.orderQuantity < 0
      )
    ) {
      req.flash(
        "error",
        "Invalid medicaments data: missing ID or invalid quantity"
      );
      res.redirect("/achat/approvisionnement/BC");
    }
// Get current year for BC code
const fullYear = new Date().getFullYear();
const yearShort = fullYear % 100; // e.g., 2025 -> 25

// Find the last BonDeCommande for the current year using createdAt
const lastBC = await BonDeCommande.findOne(
  {
    createdAt: {
      $gte: new Date(fullYear, 0, 1),
      $lt: new Date(fullYear + 1, 0, 1),
    },
  },
  {},
  { sort: { createdAt: -1 } }
);

let sequenceNumber = 1;
if (lastBC && lastBC.bonCommandeCode) {
  // Assuming the format is BCYY/NNNN, split the code on '/'
  const parts = lastBC.bonCommandeCode.split("/");
  if (parts.length > 1) {
    // Parse the sequence number from the second part of the code
    sequenceNumber = parseInt(parts[1], 10) + 1;
  }
}

// Generate the bcCode in the format BCYY/NNNN
const bcCode = `BC${yearShort}/${String(sequenceNumber).padStart(4, "0")}`;



    // Create BC object
    const bcData = {
      bonCommandeCode: bcCode,
      fournisseurId,
      createdBy: req.user._id,
      status: "Pending",
      comment: notes || "",
      medicaments,
      createdAt: new Date(),
    };

    // Create and save Bon de Commande
    const newBC = new BonDeCommande(bcData);
    const savedBC = await newBC.save();

    // Populate fournisseur and medicaments data for response
    const populatedBC = await BonDeCommande.findById(savedBC._id)
      .populate("fournisseurId", "name")
      .populate("medicaments.medicamentId", "designation");

    // If it's an API request, send JSON response
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        success: true,
        message: "Bon de commande created successfully",
        data: populatedBC,
      });
    }

    // For form submission, redirect with success message
    req.flash("success", "Bon de commande created successfully");
    res.redirect("/achat/approvisionnement/BC");
  } catch (error) {
    console.error("Error creating Bon de Commande:", error);

    // If it's an API request, send JSON error
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.status(500).json({
        success: false,
        message:
          error.message || "An error occurred while creating Bon de Commande",
      });
    }

    // For form submission, redirect back with error
    req.flash("error", "Failed to create Bon de Commande: " + error.message);
    res.redirect("back");
  }
};
exports.updateStatusBC = async (req, res) => {
  try {
    const { BCId, status } = req.body;

    // Check if required fields are provided
    if (!BCId || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing BCId or status." });
    }

    // Find Bon de Commande by ID
    const bonDeCommande = await BonDeCommande.findById(BCId);

    if (!bonDeCommande) {
      return res
        .status(404)
        .json({ success: false, message: "Bon de commande not found." });
    }

    // Update the status
    bonDeCommande.status = status;
    await bonDeCommande.save();

    // Send success response
    res.json({
      success: true,
      message: "Bon de commande status updated successfully.",
      updatedStatus: status,
    });
  } catch (err) {
    console.error("Error updating Bon de Commande status:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
exports.cancelBC = async (req, res) => {
  try {
    const { BCId } = req.params;
    const request = await BonDeCommande.findById(BCId);

    // Check if the request was found
    if (!request) {
      req.flash("error", "Bon De Commande not found.");
      return res.status(404).redirect("/achat/approvisionnement/BC");
    }

    // Check if it exists in BonEntree
    const bonDeReception = await BonDeReception.findOne({ bonCommandeId: BCId });

    if (bonDeReception) {
      req.flash(
        "error",
        `Cannot cancel Bon De Commande as it is used in BonEntree (Code: ${bonDeReception.bonReceptionCode}).`
      );
      return res.redirect("/achat/approvisionnement/BC");
    }

    // Update the status
    request.status = "Canceled";
    await request.save();

    req.flash("success", "Bon De Reception status is updated to Canceled!");
    res.redirect("/achat/approvisionnement/BC");
  } catch (err) {
    console.error("Error updating Bon De Commande status:", err);
    req.flash(
      "error",
      "Failed to update Bon De Commande status. Please try again."
    );
    res.status(500).send("Error updating Bon De Commande status.");
  }
};
exports.getBCDetailsPage = async (req, res) => {
  try {
    const { BCId } = req.params;
    const bonDeCommande = await BonDeCommande.findById(BCId)
      .populate("demandId")
      .populate("medicaments.medicamentId")
      .populate("fournisseurId")
      .populate("factureProformaId")
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
exports.addBCAttachments = async (req, res) => {
  try {
    const BCId = req.body.bonDeCommandeId; // Get bonDeCommande ID
    const files = req.files; // Get the uploaded files (from multer)

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const fileNames = files.map((file) => file.filename); // Get filenames from the uploaded files

    // Find the BonDeCommande by ID
    const bonDeCommande = await BonDeCommande.findById(BCId);
    if (!bonDeCommande) {
      return res.status(404).json({ error: "BonDeCommande not found." });
    }

    // Add the file names to the attachments field in BonDeCommande
    bonDeCommande.attachments.push(...fileNames);

    // Save the BonDeCommande with the new attachments
    await bonDeCommande.save();

    res.json({
      success: true,
      message: "Files uploaded successfully!",
      fileNames,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.deleteBCAttachments = async (req, res) => {
  const { attachment, bonDeCommandeId } = req.body;

  BonDeCommande.findByIdAndUpdate(
    bonDeCommandeId,
    {
      $pull: { attachments: attachment },
    },
    { new: true }
  )
    .then((updatedBonDeCommande) => {
      res.json({ success: true, updatedBonDeCommande });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Error updating database" });
    });
};
exports.getBCAttachments = async (req, res) => {
  try {
    const BCId = req.params.BCId;
    const bonDeCommande = await BonDeCommande.findById(BCId);
    console.log(bonDeCommande);
    if (!bonDeCommande) {
      return res.status(404).json({ error: "BonDeCommande not found." });
    }

    res.json({ success: true, attachments: bonDeCommande.attachments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/*-------------------------Bon reception (R)------------------------*/
exports.getBonReceptionPage = async (req, res) => {
  try {
    const BonReceptions = await BonDeReception.find()
      .populate("bonCommandeId.id")
      .populate("fournisseurId", "name")
      .populate("receivedBy", "username")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.render("Achat/Approvisionnement/bon-reception", { BonReceptions });
  } catch (error) {
    console.error("Error fetching BonDeReception:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.getBonReceptioncreationPage = async (req, res) => {
  try {
    const Medicaments = await Medicament.find();
   const Fournisseurs = await Fournisseur.find().sort({ name: 1 });

   const BonCommandes = await BonDeCommande.find(
    { status: { $ne: "Rejected" } },
    "id bonCommandeCode"
  ).sort({ createdAt: -1 });

    const Users = await User.find();

    res.render("Achat/Approvisionnement/new-bon-reception", {
      Medicaments,
      Fournisseurs,
      Users,
      BonCommandes,
    });
  } catch (err) {
    console.error("Error getting new bon-reception:", err);
    res.status(500).send("Error getting new bon-reception.");
  }
};
exports.createBonReception = async (req, res) => {
  const {
    userId,
    fournisseurId,
    bonCommande,
    dateBonCommande,
    bonLivraison,
    dateBonLivraison,
    numeroFacture,
    dateFacture,
    nombreColis,
    dateReception,
    observation,
    surplus,
    manque,
  } = req.body;

  if (!userId || !fournisseurId || !dateReception) {
    req.flash(
      "error",
      "Required inputs are missing: User, Fournisseur, Nombre de Colis, or Date Reception."
    );
    res.redirect("/achat/approvisionnement/R/new");
  }
  if (bonCommande) {
    const bonCommandeId = await BonDeCommande.findById(bonCommande);

    if (!bonCommandeId) {
      req.flash("error", "Bon de commande not found");
      res.redirect("/achat/approvisionnement/R/new");
    }
  }

  const [user, fournisseur] = await Promise.all([
    User.findById(userId),
    Fournisseur.findById(fournisseurId),
  ]);

  if (!user || !fournisseur) {
    req.flash("error", "User (Affaire suivie par) or fournisseur not found");
    res.redirect("/achat/approvisionnement/R/new");
  }

  const processedSurplus = [];
  if (Array.isArray(surplus)) {
    for (const item of surplus) {
      if (item.medicamentId && item.quantity) {
        const medicament = await Medicament.findById(item.medicamentId);
        if (!medicament) {
          req.flash("error", "Medicament not found in surplus table");
          res.redirect("/achat/approvisionnement/R/new");
        }
        processedSurplus.push({
          medicamentId: item.medicamentId,
          quantity: Number(item.quantity),
        });
      }
    }
  }

  const processedManque = [];
  if (Array.isArray(manque)) {
    for (const item of manque) {
      if (item.medicamentId && item.quantity) {
        const medicament = await Medicament.findById(item.medicamentId);
        if (!medicament) {
          req.flash("error", "Medicament not found in manque table");
          res.redirect("/achat/approvisionnement/R/new");
        }
        processedManque.push({
          medicamentId: item.medicamentId,
          quantity: Number(item.quantity),
        });
      }
    }
  }

  const now = new Date();
const fullYear = now.getFullYear();
const lastTwoDigits = fullYear % 100; // e.g., 2025 -> 25

// Find the last BonDeReception for the current year
const lastRequest = await BonDeReception.findOne(
  {
    createdAt: {
      $gte: new Date(fullYear, 0, 1),
      $lt: new Date(fullYear + 1, 0, 1),
    },
  },
  {},
  { sort: { createdAt: -1 } }
);

let sequenceNumber = 1;
if (lastRequest && lastRequest.bonReceptionCode) {
  // Assuming the format is BYY/NNNN, we split on '/'
  const parts = lastRequest.bonReceptionCode.split("/");
  if (parts.length > 1) {
    const lastSequence = parseInt(parts[1], 10);
    sequenceNumber = lastSequence + 1;
  }
}

// Generate the bonReceptionCode in the format BYY/NNNN
const bonReceptionCode = `AR${lastTwoDigits}/${String(sequenceNumber).padStart(4, "0")}`;


  const newBonReception = new BonDeReception({
    bonReceptionCode,

    fournisseurId: fournisseurId,
    bonCommandeId: {
      id: bonCommande||null,
      date: dateBonCommande,
    },
    bonLivraison: {
      numero: bonLivraison,
      date: dateBonLivraison,
    },
    facture: {
      numero: numeroFacture,
      date: dateFacture,
    },
    createdBy: req.user._id,
    receivedBy: userId,
    nombreColis,
    dateReception,
    observation,
    surplus: processedSurplus,
    manque: processedManque,
    createdAt: new Date(),
  });

  await newBonReception.save();

  req.flash("success", "Bon de réception is created successfully!");
  res.redirect("/achat/approvisionnement/R");
};
exports.cancelBonReception = async (req, res) => {
  try {
    const { RId } = req.params;
    const request = await BonDeReception.findById(RId);

    // Check if the request was found
    if (!request) {
      req.flash("error", "Bon De Reception not found.");
      return res.status(404).redirect("/achat/approvisionnement/R");
    }

    // Check if it exists in BonEntree
    const bonEntree = await BonEntree.findOne({ bonReceptionId: RId });

    if (bonEntree) {
      req.flash(
        "error",
        `Cannot cancel Bon De Reception as it is used in BonEntree (Code: ${bonEntree.bonEntreeCode}).`
      );
      return res.redirect("/achat/approvisionnement/R");
    }

    // Update the status
    request.status = "Canceled";
    await request.save();

    req.flash("success", "Bon De Reception status is updated to Canceled!");
    res.redirect("/achat/approvisionnement/R");
  } catch (err) {
    console.error("Error updating Bon De Reception status:", err);
    req.flash(
      "error",
      "Failed to update Bon De Reception status. Please try again."
    );
    res.status(500).send("Error updating Bon De Reception.");
  }
};
exports.getBonReceptionDetailsPage = async (req, res) => {
  try {
    const bonReception = await BonDeReception.findById(req.params.RId)
      .populate("bonCommandeId.id")
      .populate("fournisseurId")
      .populate("receivedBy")
      .populate("createdBy")
      .populate("surplus.medicamentId")
      .populate("manque.medicamentId");

    if (!bonReception) {
      req.flash("error", "Bon de Reception not found");
      return res.redirect("/achat/Approvisionnement/R");
    }

    res.render("Achat/Approvisionnement/bon-reception-details", {
      bonReception,  services
    });
  } catch (error) {
    console.error(error);
    req.flash("error", "Error retrieving Bon de Reception details");
    res.redirect("/achat/Approvisionnement/R");
  }
};
exports.addRAttachments = async (req, res) => {
  try {
    const RId = req.body.bonReceptionId; // Get bonReceptionId ID
    const files = req.files; // Get the uploaded files (from multer)

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const fileNames = files.map((file) => file.filename); // Get filenames from the uploaded files

    // Find the BonDeCommande by ID
    const bonReception = await BonDeReception.findById(RId);
    if (!bonReception) {
      return res.status(404).json({ error: "BonDeCommande not found." });
    }

    // Add the file names to the attachments field in BonDeCommande
    bonReception.attachments.push(...fileNames);

    // Save the BonDeCommande with the new attachments
    await bonReception.save();

    res.json({
      success: true,
      message: "Files uploaded successfully!",
      fileNames,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.deleteRAttachments = async (req, res) => {
  const { attachment, bonReceptionId } = req.body;

  BonDeReception.findByIdAndUpdate(
    bonReceptionId,
    {
      $pull: { attachments: attachment },
    },
    { new: true }
  )
    .then((updatedBonDeReception) => {
      res.json({ success: true, updatedBonDeReception });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Error updating database" });
    });
};
exports.getRAttachments = async (req, res) => {
  try {
    const RId = req.params.RId;
    const bonDeReception = await BonDeReception.findById(RId);
    console.log(bonDeReception);
    if (!bonDeReception) {
      return res.status(404).json({ error: "BonDeCommande not found." });
    }

    res.json({ success: true, attachments: bonDeReception.attachments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getEditBonReceptioncreationPage = async (req, res) => {
  try {
    const bonReception = await BonDeReception.findById(req.params.RId)
      .populate("surplus.medicamentId")
      .populate("manque.medicamentId")
      .populate("fournisseurId")
      .populate("receivedBy")
      .populate("createdBy")
      .populate("bonCommandeId.id");

   const Fournisseurs = await Fournisseur.find().sort({ name: 1 });

    const Users = await User.find();
    const BonCommandes = await BonDeCommande.find();
    const Medicaments = await Medicament.find();

    res.render("Achat/Approvisionnement/edit-bon-reception", {
      bonReception,
      Fournisseurs,
      Users,
      BonCommandes,
      Medicaments,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/achat/approvisionnement/R");
  }
};
exports.updateBonReception = async (req, res) => {
  const { RId } = req.params;
  const {
    userId,
    fournisseurId,
    bonCommande,
    dateBonCommande,
    bonLivraison,
    dateBonLivraison,
    numeroFacture,
    dateFacture,
    nombreColis,
    dateReception,
    observation,
    surplus,
    manque,
  } = req.body;

  if (!userId || !fournisseurId || !nombreColis || !dateReception) {
    req.flash(
      "error",
      "Required inputs are missing: User, Fournisseur, Nombre de Colis, or Date Reception."
    );
    return res.redirect(`/achat/approvisionnement/R/edit/${RId}`);
  }

  const bonReception = await BonDeReception.findById(RId);
  if (!bonReception) {
    req.flash("error", "Bon de réception not found");
    return res.redirect("/achat/approvisionnement/R");
  }

  if (bonCommande) {
    const bonCommandeId = await BonDeCommande.findById(bonCommande);
    if (!bonCommandeId) {
      req.flash("error", "Bon de commande not found");
      return res.redirect(`/achat/approvisionnement/R/edit/${RId}`);
    }
  }

  const [user, fournisseur] = await Promise.all([
    User.findById(userId),
    Fournisseur.findById(fournisseurId),
  ]);

  if (!user || !fournisseur) {
    req.flash("error", "User (Affaire suivie par) or fournisseur not found");
    return res.redirect(`/achat/approvisionnement/R/edit/${RId}`);
  }

  const processedSurplus = [];
  if (Array.isArray(surplus)) {
    for (const item of surplus) {
      if (item.medicamentId && item.quantity) {
        const medicament = await Medicament.findById(item.medicamentId);
        if (!medicament) {
          req.flash("error", "Medicament not found in surplus table");
          return res.redirect(`/achat/approvisionnement/R/edit/${RId}`);
        }
        processedSurplus.push({
          medicamentId: item.medicamentId,
          quantity: Number(item.quantity),
        });
      }
    }
  }

  const processedManque = [];
  if (Array.isArray(manque)) {
    for (const item of manque) {
      if (item.medicamentId && item.quantity) {
        const medicament = await Medicament.findById(item.medicamentId);
        if (!medicament) {
          req.flash("error", "Medicament not found in manque table");
          return res.redirect(`/achat/approvisionnement/R/edit/${RId}`);
        }
        processedManque.push({
          medicamentId: item.medicamentId,
          quantity: Number(item.quantity),
        });
      }
    }
  }

  bonReception.fournisseurId = fournisseurId;
  bonReception.bonCommandeId = {
    id: bonCommande,
    date: dateBonCommande,
  };
  bonReception.bonLivraison = {
    numero: bonLivraison,
    date: dateBonLivraison,
  };
  bonReception.facture = {
    numero: numeroFacture,
    date: dateFacture,
  };
  bonReception.receivedBy = userId;
  bonReception.nombreColis = nombreColis;
  bonReception.dateReception = dateReception;
  bonReception.observation = observation;
  bonReception.surplus = processedSurplus;
  bonReception.manque = processedManque;
  bonReception.updatedAt = new Date();
  await bonReception.save();

  req.flash("success", "Bon de réception updated successfully!");
  res.redirect("/achat/approvisionnement/R");
};
/*-------------------------BE------------------------*/
exports.getBEPage = async (req, res) => {
  try {
    const bonEntrees = await BonEntree.find()
    .populate({
      path: "bonReceptionId",
      populate: { path: "fournisseurId" }
  })
      .populate("fournisseurId")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    res.render("Achat/Pharmacy/bon-entree", { bonEntrees });
  } catch (error) {
    console.error("Error fetching Bon Entree:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.getNewBEPage = async (req, res) => {
  const groupedStorages = await Storage.aggregate([
    {
      $group: {
        _id: "$serviceABV", // Group by serviceABV
        storages: {
          $push: {
            storageName: "$storageName",
            endroitCode: "$endroitCode",
            endroitDescription: "$endroitDescription",
            service: "$service",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const bonReceptions = await BonDeReception.find({}, "bonReceptionCode");
  const fournisseurs = await Fournisseur.find({}, "name").sort({ name: 1 });

  res.render("Achat/Pharmacy/new-bon-entree", {
    groupedStorages,
    bonReceptions,
    fournisseurs,
  });
};
exports.CreateBEPage = async (req, res) => {
  try {
    const { bonReceptionId, fournisseurId, serviceABV, notes } = req.body;
console.log(bonReceptionId, fournisseurId, serviceABV, notes);
    const now = new Date();
    const year = now.getFullYear() % 100; 
    
    // Find last BE for sequence number
    const lastBE = await BonEntree.findOne(
      {
        createdAt: {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lt: new Date(now.getFullYear() + 1, 0, 1),
        },
      },
      {},
      { sort: { createdAt: -1 } }
    );
    
    let sequenceNumber =
      lastBE && lastBE.bonEntreeCode
        ? parseInt(lastBE.bonEntreeCode.split("/")[1], 10) + 1
        : 1;
    
   
    const beCode = `BE${year}/${String(sequenceNumber).padStart(4, "0")}`;
    const newBonEntree = new BonEntree({
      bonEntreeCode: beCode,
      bonReceptionId: bonReceptionId?bonReceptionId: null,
      fournisseurId,
      serviceABV,
      createdBy: req.user._id,
      notes,
      createdAt: new Date(),
    });

    await newBonEntree.save();
    res.redirect("/achat/approvisionnement/BE");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
exports.getBEDetailsPage = async (req, res, next) => {
  const BeId = req.params.BEID;

  try {
    const bonEntree = await BonEntree.findById(BeId)
    .populate({
      path: "bonReceptionId",
      populate: { path: "fournisseurId" }
  })
   const fournisseurs = await Fournisseur.find().sort({ name: 1 });

    const bonEntreeItems = await BonEntreeItem.find({
      bonEntreeId:BeId,
    })
      .populate("medicamentId", "designation boite_de")
      .lean();

    const medicaments = await Medicament.find().sort({ code_interne: 1 });

    const user = await User.findById(req.user._id);

    const storages = await Storage.find({ serviceABV: bonEntree.serviceABV });

    res.render("Achat/Pharmacy/bon-entree-details", {
      user,
      bonEntree,
      bonEntreeItems,
      medicaments,
      storages,
      fournisseurs,
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    next(error);
  }
};
exports.CreateBEitemPage = async (req, res) => {
  try {
    const bonEntreeId = req.params.BEID;
    let {
      medicamentId,
      storageName,
      batchNumber,
      serialNumber,
      expiryDate,
      quantity,
      purchasePrice,
      sellPrice,
      tva,
      remarks,
      byBox,
      QTEbyBox,
      boite_de
    } = req.body;
   
    byBox = req.body.byBox === "on";
    QTEbyBox = req.body.QTEbyBox === "on";

    
    if (isNaN(boite_de) || boite_de <= 0) {
      boite_de = 1;
    }

    if (byBox) {
      purchasePrice = purchasePrice / boite_de;
      sellPrice = sellPrice / boite_de;
    }

    if (QTEbyBox) {
      quantity = quantity * boite_de;

    }

    const bonEntreeItem = new BonEntreeItem({
      bonEntreeId,
      medicamentId,
      storageName,
      batchNumber,
      serialNumber,
      expiryDate,
      quantity,
      purchasePrice,
      sellPrice,
      tva,
      remarks,
      byBox,
      QTEbyBox,
      boite_de,
      createdBy: req.user._id,
    });

    await bonEntreeItem.save();
    res.redirect("back");
  } catch (error) {
    console.error("Error adding BonEntree item:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
exports.validateBEPage = async (req, res) => {
  const BeId = req.params.BEID;
 
  const { status } = req.body;

  try {
    const updatedBonEntree = await BonEntree.findOneAndUpdate(
      { _id: BeId},
      { status },
      { new: true }
    );

    if (!updatedBonEntree) {
      console.error("Bon Entree not found:", { BeId });
      return res.status(404).send({ message: "Bon Entree not found." });
    }

    res.status(200).send({
      message: `Bon Entree status updated to ${status} successfully.`,
      BonEntree: updatedBonEntree,
    });
  } catch (error) {
    console.error("Error updating Bon Entree status:", error);
    res.status(500).send({ message: "Error updating Bon Entree status." });
  }
};
exports.getUpdateBEItemPage = async (req, res, next) => {
  const BeId = req.params.BEID;
  const itemId = req.params.itemId;

  try {
    
    const bonEntree = await BonEntree.findById(BeId);
   const fournisseurs = await Fournisseur.find().sort({ name: 1 });

      
    const item = await BonEntreeItem.findOne({
      _id: itemId,
    })
      .populate("medicamentId", "designation") 
      .lean(); 
       
    if (item.byBox) {
      item.purchasePrice = item.purchasePrice * item.boite_de;
    }
    if (item.QTEbyBox) {
      item.quantity = item.quantity / item.boite_de;
    }
      const medicaments = await Medicament.find();
   
      const storages = await Storage.find({ serviceABV: bonEntree.serviceABV });

    res.render("Achat/Pharmacy/bon-entree-edit-item", {
      bonEntree,
      item,
      storages,
      fournisseurs,
      medicaments,
     
    });
  } catch (error) {
    console.error("Error fetching Bon Entree details:", error);
    next(error); 
  }
};
exports.updateBEItem = async (req, res) => {
  
  try {
    const BeId = req.params.BEID;
  const itemId = req.params.itemId;
    let {
      medicamentId, 
      storageName,
      batchNumber,
      serialNumber,
      expiryDate,
      tva,
      quantity,
      purchasePrice,
      sellPrice,
      fournisseurId,
      remarks,
      boite_de,
      
    } = req.body;
    const byBox = req.body.byBox === "on";
    const QTEbyBox = req.body.QTEbyBox === "on";
 
    if (
      !itemId ||
      !medicamentId ||
      !quantity
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled!" });
    }
    if (isNaN(boite_de) || boite_de <= 0) {
      boite_de = 1;
    }
  
    // Find the inventory item by its ID and inventory ID
    const bonEntreeItem = await BonEntreeItem.findOne({ _id: itemId });

    if (!bonEntreeItem) {
      return res.status(404).json({ error: "Bon Entree Item item not found!" });
    }
    if (byBox) {
      bonEntreeItem.purchasePrice = purchasePrice / boite_de;
      bonEntreeItem.sellPrice = sellPrice / boite_de;
    
    }else{
      bonEntreeItem.purchasePrice = purchasePrice;
      bonEntreeItem.sellPrice = sellPrice;
     
    }
    if (QTEbyBox) {
      bonEntreeItem.quantity = quantity * boite_de;
    
    }else{
      bonEntreeItem.quantity = quantity;
    }
  
    bonEntreeItem.medicamentId = medicamentId;
    bonEntreeItem.storageName = storageName;
    bonEntreeItem.batchNumber = batchNumber || bonEntreeItem.batchNumber; 
    bonEntreeItem.serialNumber = serialNumber || bonEntreeItem.serialNumber; 
    bonEntreeItem.expiryDate = expiryDate || bonEntreeItem.expiryDate; 
    bonEntreeItem.fournisseurId = fournisseurId;
    bonEntreeItem.tva = tva;
    bonEntreeItem.remarks = remarks ; 
    bonEntreeItem.byBox = byBox;
    bonEntreeItem.QTEbyBox = QTEbyBox;
    bonEntreeItem.boite_de = boite_de || bonEntreeItem.boite_de;
    bonEntreeItem.updatedAt = new Date();

    // Save the updated inventory item
    await bonEntreeItem.save();

    // Respond with success
    res.redirect(`/achat/approvisionnement/BE/${BeId}`);
  } catch (error) {
    console.error("Error updating bon Entree Item item:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};
exports.deleteBEItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;

    // Attempt to find and delete the item
    const deletedItem = await BonEntreeItem.findOneAndDelete({ _id: itemId });

    if (deletedItem) {
      // If the item was deleted successfully, respond with a success message
      res.json({ success: true, message: "Item deleted successfully." });
    } else {
      // If the item was not found, respond with an error message
      res.json({ success: false, message: "Item not found." });
    }
  } catch (error) {
    // Handle any potential errors
    console.error(error);
    res.json({
      success: false,
      message: "An error occurred while deleting the item.",
    });
  }
};