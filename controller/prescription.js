const mongoose = require("mongoose");
const InStock = require("../models/inStock");
const Prescription = require("../models/prescription");
const Medicament = require("../models/medicament");
const Patient = require("../models/patient");
const services = [
  { _id: 'PCS', name: 'Pharmacie centrale' },
  { _id: "APP", name: "Approvisionnement" },
  { _id: "CON", name: "Consultations" },
  { _id: "RAD", name: "Radiologie" },
  { _id: "LAM", name: "Laboratoire d'analyse médicale" },
  { _id: "LAP", name: "Laboratoire d'anatomie-pathologique" },
  { _id: "HMU", name: "Hospitalisation multidisciplinaire" },
  { _id: "HCA", name: "Hospitalisation de cardiologie" },
  { _id: "URG", name: "Urgences médicales" },
  { _id: "BOP", name: "Blocs opératoires" },
  { _id: "CAT", name: "Cathétérisme" },
  { _id: "REA", name: "Réanimation" },
  { _id: "MIN", name: "Médecine Interne" },
  { _id: "MPR", name: "Médecine physique et réadaptation" },
  { _id: "DAF", name: "Direction administrative et finance" },
];

exports.getCreatePrescriptionPage = async (req, res) => {
  const { patientId, admissionId } = req.params;
  const { serviceABV } = req.query;
  const patient = await Patient.findById(patientId);

  const Medicaments = await InStock.find().populate("medicamentId").exec();
  res.render("Prescription/new", {
    Medicaments,
    patient,
    serviceABV,
    admissionId,
  });
};
exports.createPrescription = async (req, res) => {
  const { patientId, admissionId } = req.params;
  const { prescription } = req.body;
  const { serviceABV } = req.query;

  try {
    // Validate required fields
    if (!patientId || !prescription) {
      req.flash("error", "Missing required fields"); // Flash error message
      return res.status(400).redirect("/prescription/" + patientId); // Redirect to the form page
    }
    // Generate prescription code (e.g., 0010/2023 for October 2023)
    const generatePrescriptionCode = async () => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Month (01-12)
      const year = now.getFullYear(); // Year (e.g., 2023)

      // Fetch the latest prescription count for the current month/year
      return Prescription.countDocuments({
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1), // Start of the month
          $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1), // Start of the next month
        },
      }).then((count) => {
        const number = String(count + 1).padStart(3, "0"); // Increment count and pad with zeros
        return `${number}${month}/${year}`; // Format: numberMonth/year
      });
    };

    // Generate the prescription code
    const prescriptionCode = await generatePrescriptionCode();
    // Filter valid medicaments
    const medicaments = Object.values(prescription)
      .filter((med) => med.medicamentId)
      .map((med) => ({
        medicamentId: med.medicamentId,
        quantity:
          parseFloat(med.quantity_whole) + parseFloat(med.quantity_fraction),
        comment: med.comment,
        createdBy: req.user._id,
      }));

    // Create the prescription
    const newprescription = new Prescription({
      prescriptionCode,
      patientId,
      admissionId,
      medicaments,
      createdBy: req.user._id,
    });

    // Save the prescription to the database
    await newprescription.save();

    req.flash("success", "Prescription created successfully"); // Flash success message
    res
      .status(201)
      .redirect(
        "/prescription/prescriptions/" +
          patientId +
          "/" +
          admissionId +
          "?serviceABV=" +
          serviceABV
      ); // Redirect to the prescriptions list page
  } catch (error) {
    console.error("Error creating prescription:", error);
    req.flash("error", "Server error: " + error.message); // Flash error message
    res
      .status(500)
      .redirect(
        "/prescription/" +
          patientId +
          "/" +
          admissionId +
          "?serviceABV=" +
          serviceABV
      ); // Redirect to the form page
  }
};
exports.getPrescriptionsPage = async (req, res) => {
  const { patientId, admissionId } = req.params;
  const { serviceABV } = req.query;
  const prescriptions = await Prescription.find({
    patientId: patientId,
    admissionId: admissionId,
  })
    .populate("createdBy", "username")
    .exec();
  const patient = await Patient.findById(patientId);

  res.render("Prescription/patient-prescriptions", {
    prescriptions,
    patient,
    serviceABV,
    admissionId,
  });
};
exports.getPrescriptiondetailsPage = async (req, res) => {
  const { prescriptionId } = req.params;
  const { serviceABV } = req.query;

  // Fetch the prescription and populate necessary fields
  const prescription = await Prescription.findById(prescriptionId)
    .populate("medicaments.medicamentId", "designation")
    .populate("medicaments.createdBy", "username")
    .populate("createdBy", "username")
    .populate("patientId")
    .exec();

  if (!prescription) {
    return res.status(404).send({ message: "Prescription not found." });
  }

  // Fetch the patient details
  const patient = await Patient.findById(prescription.patientId._id);

  if (!serviceABV) {
    return res.status(404).send({ message: "Service source not found." });
  }

  // Fetch the source stock based on serviceABV
  const sourceStock = await InStock.aggregate([
    {
      $lookup: {
        from: "storages",
        localField: "storageId",
        foreignField: "_id",
        as: "storageDetails",
      },
    },
    { $unwind: "$storageDetails" },
    {
      $match: { "storageDetails.serviceABV": serviceABV, quantity: { $gt: 0 } },
    },
    {
      $lookup: {
        from: "medicaments",
        localField: "medicamentId",
        foreignField: "_id",
        as: "medicamentDetails",
      },
    },
    { $sort: { expiryDate: 1 } }, // Sorting by expiryDate in ascending order
    {
      $project: {
        medicamentId: 1,
        quantity: 1,
        batchNumber: 1,
        locationCode: 1,
        barcode: 1,
        serialNumber: 1,
        expiryDate: 1,
      },
    },
  ]);

  // Calculate the total dispensed and destocked quantities for each medicament in the prescription
  const medicamentQuantities = await Prescription.aggregate([
    // Match the specific prescription
    { $match: { _id: new mongoose.Types.ObjectId(prescriptionId) } },
    // Unwind the medicaments array
    { $unwind: "$medicaments" },
    // Unwind the dispensedmedicaments array (preserveNullAndEmptyArrays: true to handle empty arrays)
    {
      $unwind: {
        path: "$dispensedmedicaments",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Unwind the distockedmedicaments array (preserveNullAndEmptyArrays: true to handle empty arrays)
    {
      $unwind: {
        path: "$distockedmedicaments",
        preserveNullAndEmptyArrays: true,
      },
    },
    // Group by medicamentId and calculate totals
    {
      $group: {
        _id: "$medicaments.medicamentId",
        totalDispensed: {
          $sum: {
            $cond: [
              {
                $eq: [
                  "$dispensedmedicaments.medicamentId",
                  "$medicaments.medicamentId",
                ],
              },
              "$dispensedmedicaments.quantity",
              0,
            ],
          },
        },
        totalDestocked: {
          $sum: {
            $cond: [
              {
                $eq: [
                  { $toObjectId: "$distockedmedicaments.medicamentId" },
                  "$medicaments.medicamentId",
                ],
              },
              "$distockedmedicaments.quantity",
              0,
            ],
          },
        },
      },
    },
    // Project the results
    {
      $project: {
        _id: 0,
        medicamentId: "$_id",
        totalDispensed: 1,
        totalDestocked: 1,
      },
    },
  ]);

  // Render the view with the required data
  res.render("Prescription/index", {
    prescription,
    serviceABV,
    patient,
    sourceStock,
    medicamentQuantities, // Pass the calculated quantities to the view
  });
};
exports.distockMedicaments = async (req, res) => {
  const { medicamentId } = req.params;
  const { barcodes } = req.body;
  const { serviceABV } = req.query;
  const userId = req.user._id; // Get the current user's ID

  try {
    // Validate input
    if (!medicamentId || !barcodes || barcodes.length === 0 || !serviceABV) {
      req.flash("error", "Invalid input data.");
      return res.status(400).json({
        success: false,
        message: "Invalid input data.",
        flash: req.flash(),
      });
    }

    // Find matching medicaments in InStock
    const medicaments = await InStock.find({
      medicamentId: medicamentId,
      barcode: { $in: barcodes.map((b) => b.barcode) },
    }).populate({
      path: "storageId",
      match: { serviceABV: serviceABV },
    });

    // Filter out documents where storageId is null (no match for serviceABV)
    const filteredMedicaments = medicaments.filter(
      (med) => med.storageId !== null
    );

    if (filteredMedicaments.length === 0) {
      req.flash(
        "error",
        "No matching medicaments found for the given criteria."
      );
      return res.status(404).json({
        success: false,
        message: "No matching medicaments found for the given criteria.",
        flash: req.flash(),
      });
    }

    // Find the prescription document to update
    const prescription = await Prescription.findOne({
      medicaments: { $elemMatch: { medicamentId: medicamentId } },
    });

    if (!prescription) {
      req.flash("error", "Prescription not found.");
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
        flash: req.flash(),
      });
    }

    // Process each barcode in the request
    for (const { barcode, quantity } of barcodes) {
      const stockItem = filteredMedicaments.find(
        (item) => item.barcode === barcode
      );

      if (!stockItem) {
        req.flash(
          "error",
          `Barcode ${barcode} not found for medicament ${medicamentId} and service ${serviceABV}.`
        );
        return res.status(404).json({
          success: false,
          message: `Barcode ${barcode} not found for medicament ${medicamentId} and service ${serviceABV}.`,
          flash: req.flash(),
        });
      }

      if (stockItem.quantity < quantity) {
        req.flash(
          "error",
          `Insufficient quantity for barcode ${barcode}. Available: ${stockItem.quantity}, Requested: ${quantity}.`
        );
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for barcode ${barcode}. Available: ${stockItem.quantity}, Requested: ${quantity}.`,
          flash: req.flash(),
        });
      }

      // Update the quantity in the stock
      stockItem.quantity -= quantity;
      await stockItem.save();

      // Add the distocked medicament to the prescription
      prescription.distockedmedicaments.push({
        medicamentId: medicamentId,
        barCode: barcode,
        quantity: quantity,
        distockedBy: userId, // Current user's ID
        service: stockItem.storageId.service, // Copy the service from storageId
        distockedAt: new Date(), // Current timestamp
      });
    }

    // Save the updated prescription document
    await prescription.save();

    // Set success flash message
    req.flash("success", "Quantities updated successfully.");
    res.json({
      success: true,
      message: "Quantities updated successfully.",
      flash: req.flash(),
    });
  } catch (error) {
    console.error("Error:", error);
    req.flash("error", "An error occurred while processing the request.");
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
      flash: req.flash(),
    });
  }
};
exports.distockedMedicamentsDetails = async (req, res) => {
  const { prescriptionId, medicamentId } = req.params;
  const { serviceABV } = req.query;

  try {
    // Validate input
    if (!prescriptionId) {
      return res
        .status(400)
        .json({ success: false, message: "Prescription ID is required." });
    }

    // Find the prescription by ID and populate distockedBy
    const medicaments = await Prescription.findById(prescriptionId)
      .select("prescriptionCode patientId distockedmedicaments") // Select only these fields
      .populate("distockedmedicaments.distockedBy", "username")
      .exec();

    const patient = await Patient.findById(medicaments.patientId._id);
    const medicament = await Medicament.findById(medicamentId);
    // Check if the prescription exists
    if (!medicaments) {
      return res
        .status(404)
        .json({ success: false, message: "Prescription not found." });
    }

    // Render the view with the prescription and serviceABV data
    res.render("Prescription/medicament-details", {
      medicaments,
      medicament,
      serviceABV,
      patient,
    });
  } catch (error) {
    console.error("Error:", error); // Log the error
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};

exports.ActivateMedicament = async (req, res) => {
  const { prescriptionId, medicamentId } = req.params;
  const { serviceABV, status } = req.query;

  try {
    // Find the prescription by its ID
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Find the specific medicament within the medicaments array
    const medicament = prescription.medicaments.find(
      (med) => med._id.toString() === medicamentId
    );

    if (!medicament) {
      return res.status(404).json({ message: "Medicament not found" });
    }

    // Update the status of the medicament
    medicament.status = status;

    // Save the updated prescription
    await prescription.save();
    req.flash(
      "success",
      "Medicament status updated successfully to " + status + ""
    );
    res
      .status(201)
      .redirect(
        "/prescription/details/" + prescriptionId + "?serviceABV=" + serviceABV
      );
   
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
