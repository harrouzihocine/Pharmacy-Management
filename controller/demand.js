const Demand = require("../models/demand");
const InStock = require("../models/inStock");
const Pharmacy = require("../models/pharmacy");
const VirtualInStock = require("../models/VirtualInStock");
const services = [
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

exports.getDemandsPage = async (req, res) => {
  const { serviceABV } = req.params;
  try {
    const demands = await Demand.find()
      .populate("createdBy", "username") // Populate `createdBy` with the `name` field
      .select("-medicaments"); // Exclude `medicaments` from the response
    res.render("demand/index", { demands, serviceABV });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
exports.getAddDemandPage = async (req, res) => {
  const { serviceABV } = req.params;
  try {
    const Medicaments = await Pharmacy.find().populate("medicamentId");

    res.render("demand/new-demand", {
      Medicaments,
      serviceABV,
      services: services,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
exports.createDemand = async (req, res) => {
  try {
    const { source, destination, comment, Medicament, otherMedicaments } =
      req.body;
    const { serviceABV } = req.params;

    // Validate required fields
    if (!source || !destination || !Medicament) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Filter valid medicaments
    const medicaments = Object.values(Medicament)
      .filter((med) => med.medicamentId && med.quantity && med.priority)
      .map((med) => ({
        medicamentId: med.medicamentId,
        quantity: med.quantity,
        quantityExist: med.quantityExist,
        priority: med.priority,
      }));

    if (medicaments.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid medicaments provided." });
    }

    // Create and save the demand
    const newDemand = new Demand({
      source,
      destination,
      comment,
      medicaments,
      otherMedicaments,
      createdBy: req.user._id,
    });

    await newDemand.save();

    // Redirect to a success page or respond with a success message
    res.redirect("/demand/demands/" + serviceABV);
  } catch (error) {
    console.error("Error creating demand:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getDemandDetailsPage = async (req, res) => {
  const { demandId } = req.params;
  try {
    // Fetch the demand with necessary population
    const demand = await Demand.findById(demandId)
      .populate("createdBy", "username") // Populate `createdBy` with the `username` field
      .populate("medicaments.medicamentId"); // Populate `medicamentId` with details

    // Access the source from the demand object
    const source = demand.source;

    if (!source) {
      return res.status(404).send({ message: "Source not found." });
    }

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
      { $match: { "storageDetails.service": source, quantity: { $gt: 0 } } },
      {
        $lookup: {
          from: "medicaments",
          localField: "medicamentId",
          foreignField: "_id",
          as: "medicamentDetails",
        },
      },
      {
        $sort: { expiryDate: 1 }, // Sorting by expiryDate in ascending order
      },
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

    // Aggregate the virtual stock data to match medicamentIds in the demand
    // Get the list of VirtualInStock IDs from the demand's `virtualStockIDs` field
    const virtualStockIDs = demand.virtualStockIDs.map((v) => v._id);

    // Aggregate the virtual stock data to match medicamentIds in the demand and filter by virtualStockIDs
    const demandMedicamentsIds = demand.medicaments.map(
      (m) => m.medicamentId._id
    );

    const virtualStockCount = await VirtualInStock.aggregate([
      {
        $match: {
          medicamentId: { $in: demandMedicamentsIds }, // Match medicaments in the demand
          _id: { $in: virtualStockIDs }, // Filter by virtualStockIDs in the demand model
        },
      },
      {
        $group: {
          _id: "$medicamentId", // Group by medicamentId
          totalQuantity: { $sum: "$quantity" }, // Sum the quantities for each medicamentId
        },
      },
    ]);

    // Map medicamentId with their total quantities for easy lookup
    const virtualStockMap = virtualStockCount.reduce((acc, item) => {
      acc[item._id.toString()] = item.totalQuantity; // Store quantities in a map
      return acc;
    }, {});

    // Calculate how many medicaments are transferred from the demand to virtual stock
    const transferDetails = demand.medicaments.map((m) => {
      const medicamentId = m.medicamentId._id.toString(); // Convert to string for consistent lookup
      const virtualStockQuantity = virtualStockMap[medicamentId] || 0; // Get available quantity from virtual stock
      return {
        medicamentId: medicamentId,
        requestedQuantity: m.quantity, // Requested quantity from demand
        availableInVirtualStock: virtualStockQuantity,
        transferQuantity: virtualStockQuantity,
      };
    });
    // get table of received quantity of medicaments
    const virtualStockDetails = await VirtualInStock.find({
      _id: { $in: demand.virtualStockIDs },
    })
      .populate("medicamentId", "designation") // Populate with medicament designation
      .exec();

    // Map through the virtual stock to gather the required data and add virtualStockID
    const receivedstock = virtualStockDetails.map((stock) => ({
      virtualStockID: stock._id, // Adding the virtualStockID here
      medicamentId: stock.medicamentId._id,
      designation: stock.medicamentId.designation,
      batchNumber: stock.batchNumber,
      serialNumber: stock.serialNumber,
      expiryDate: stock.expiryDate,
      receivedQuantity: stock.receivedQuantity,
      quantityTransferred: stock.quantity, // Assuming the transferred quantity is stored in quantity field of VirtualInStock
      barcode: stock.barcode,
    }));

    // Send the filtered stock data and transfer details as the response
    res.render("demand/demand-details", {
      demand,
      sourceStock: sourceStock,
      transferDetails: transferDetails,
      receivedstock: receivedstock,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.initiateTransfer = async (req, res) => {
  const { demandId, transferDetails } = req.body;

  try {
    const virtualStockIDs = [];

    // Loop through each transfer detail
    for (let detail of transferDetails) {
      const { stockId, quantityToTransfer } = detail;

      // Find the matching inStock entry for the medicament
      const inStockItem = await InStock.findOne({ _id: stockId });

      if (!inStockItem) {
        return res
          .status(404)
          .json({
            message: `InStock item not found for medicamentId ${stockId}`,
          });
      }

      // Reduce the quantity from inStock
      if (inStockItem.quantity < quantityToTransfer) {
        return res
          .status(400)
          .json({ message: `Not enough quantity in stock to transfer` });
      }

      inStockItem.quantity -= quantityToTransfer;
      await inStockItem.save();

      // Create a new entry in VirtualInStock
      const newVirtualInStock = new VirtualInStock({
        medicamentId: inStockItem.medicamentId,
        quantity: quantityToTransfer,
        batchNumber: inStockItem.batchNumber,
        expiryDate: inStockItem.expiryDate,
        barcode: inStockItem.barcode,
        createdBy: req.user._id, // Assuming the user is authenticated
      });

      // Save the VirtualInStock entry
      await newVirtualInStock.save();

      // Push the ID of the new VirtualInStock entry into virtualStockIDs array
      virtualStockIDs.push(newVirtualInStock._id);
    }

    // Log virtualStockIDs to check before the update
    console.log("virtualStockIDs:", virtualStockIDs);

    // Update the Demand model with the virtualStockIDs and status
    await Demand.findByIdAndUpdate(demandId, {
      $push: { virtualStockIDs: { $each: virtualStockIDs } },
      $set: { status: "In transfer" }, // Change status to 'In transfer'
    });

    res
      .status(200)
      .json({
        message: "Transfer initiated successfully and virtual stock updated.",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the transfer." });
  }
};

exports.rejectDemand = async (req, res) => {
  const { rejectioncomment, demandId } = req.body;
  console.log(`Demand ${demandId} rejected with comment: ${rejectioncomment}`);
  try {
    // Find the demand by ID and update its status and rejection comment
    const demand = await Demand.findOneAndUpdate(
      { _id: demandId }, // Find by demand ID
      {
        status: "Rejected", // Set status to 'rejected'
        rejectioncomment: rejectioncomment, // Set rejection comment
      },
      { new: true } // Return the updated document
    );
    // Respond with success message and the updated demand
    return res.status(200).json({
      message: "Demand rejected successfully!",
      demand: demand,
    });
  } catch (error) {
    console.error("Error rejecting demand:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while rejecting the demand." });
  }
};
exports.getReceivedDemandPage = async (req, res) => {
  const demandId = req.params.demandId;
  try {
    // Find the demand with the given demandId and ensure its status is "In transfer"
    const demand = await Demand.findById(demandId)
      .populate("virtualStockIDs")
      .exec();

    if (!demand) {
      return res.status(404).json({ message: "Demand not found" });
    }

    

    // Fetch associated virtual stock details and medicament names
    const virtualStockDetails = await VirtualInStock.find({
      _id: { $in: demand.virtualStockIDs },
    })
      .populate("medicamentId", "designation") // Populate with medicament designation
      .exec();

    // Map through the virtual stock to gather the required data and add virtualStockID
    const receivedstock = virtualStockDetails.map((stock) => ({
      virtualStockID: stock._id, // Adding the virtualStockID here
      medicamentId: stock.medicamentId._id,
      designation: stock.medicamentId.designation,
      batchNumber: stock.batchNumber,
      serialNumber: stock.serialNumber,
      expiryDate: stock.expiryDate,
      receivedQuantity: stock.receivedQuantity,
      quantityTransferred: stock.quantity, // Assuming the transferred quantity is stored in quantity field of VirtualInStock
      barcode: stock.barcode,
    }));

    res.render("demand/receive-demand", { demand, receivedstock });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching virtual stock." });
  }
};

exports.receiveDemand = async (req, res) => {
  const demandId = req.params.demandId;
  const receivedQuantities = req.body.receivedQuantity; // Object of virtualStockID -> receivedQuantity
  const transferredQuantities = req.body.transferredQuantity; // Object of virtualStockID -> transferredQuantity
  const virtualStockIDs = Object.keys(receivedQuantities); // Array of virtualStockIDs

  try {
    let allQuantitiesMatch = true;

    // Loop through each virtualStockID and verify the quantities
    for (let i = 0; i < virtualStockIDs.length; i++) {
      const virtualStockID = virtualStockIDs[i];
      const receivedQuantity = parseInt(receivedQuantities[virtualStockID], 10);
      const transferredQuantity = parseInt(
        transferredQuantities[virtualStockID],
        10
      );

      // Check if the transferred quantity matches the received quantity
      if (transferredQuantity !== receivedQuantity) {
        allQuantitiesMatch = false;
      }

      // Find the corresponding VirtualInStock entry and update received quantity
      const virtualStock = await VirtualInStock.findById(virtualStockID);
      if (virtualStock) {
        virtualStock.receivedQuantity = receivedQuantity;
        await virtualStock.save();
      } else {
        console.log(`Virtual stock with ID ${virtualStockID} not found.`);
      }
    }

    // Update the demand status based on the result of the verification
    const demand = await Demand.findById(demandId);
    if (demand) {
      demand.status = allQuantitiesMatch ? "Approved" : "Non completed";
      await demand.save();
    } else {
      console.log(`Demand with ID ${demandId} not found.`);
    }

    // Redirect or return a success message
    res.redirect(`/demand/demand-details/${demandId}`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "An error occurred while updating the received quantities.",
      });
  }
};
