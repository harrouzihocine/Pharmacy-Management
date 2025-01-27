const Medicament = require('../models/medicament');
const Pharmacy = require('../models/pharmacy');
const Storage = require('../models/storage');
const InStock = require('../models/inStock');
const PurchaseRequest = require('../models/purchaseRequest');

exports.getSelectedMedicaments = async (req, res) => {
  try {
    // Fetch medicaments with the total quantity from stock
    const selectedMedicaments = await Pharmacy.find().populate("medicamentId");
    
    // For each medicament, calculate the total quantity in stock and expiration status
    const medicamentsWithQuantities = await Promise.all(
      selectedMedicaments.map(async (item) => {
        // Fetch the PreExpirationAlert from the Pharmacy model
        const pharmacy = await Pharmacy.findOne({ medicamentId: item.medicamentId._id });

        // Get the total quantity in stock for this medicament
        const totalQuantityResult = await InStock.aggregate([
          { $match: { medicamentId: item.medicamentId._id } },
          { $group: { _id: "$medicamentId", totalQuantity: { $sum: "$quantity" } } }
        ]);

        // Calculate expiration status
        const isExpiringSoon = await InStock.aggregate([
          { $match: { medicamentId: item.medicamentId._id, expiryDate: { $exists: true } } },
          { $project: { 
              daysUntilExpiration: { 
                $ceil: { 
                  $divide: [{ $subtract: ["$expiryDate", new Date()] }, 1000 * 60 * 60 * 24] 
                } 
              }
            } 
          },
          { $match: { daysUntilExpiration: { $lte: pharmacy.PreExpirationAlert } } }
        ]);

        return {
          ...item.toObject(),
          totalQuantity: totalQuantityResult.length > 0 ? totalQuantityResult[0].totalQuantity : 0,
          isExpiringSoon: isExpiringSoon.length > 0 // If any stock item is expiring soon
        };
      })
    );

    // Fetch services for the dropdown or other purposes
    const services = await Storage.aggregate([
      { 
        $group: { 
          _id: "$service", 
          storageCount: { $sum: 1 },
          serviceABV: { $first: "$serviceABV" },
          locationType: { $first: "$locationType" },
          serviceId: { $first: "$_id" },
        } 
      }
    ]);

    // Render the page with the updated data
    res.render("Pharmacy/index", { selectedMedicaments: medicamentsWithQuantities, services });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching selected medicaments");
  }
};



  exports.selectMedicament = async (req, res) => {
    const { medicamentId } = req.body;
    const userId =  req.user._id;
  console.log(userId);
    try {
      // Check if medicament is already selected
      const existing = await Pharmacy.findOne({ medicamentId: medicamentId });
      if (existing) {
        return res.status(400).send('Medicament already selected.');
      }
  
      // Add medicament to pharmacy collection
      await Pharmacy.create({ medicamentId: medicamentId, addedBy: userId });
      await Medicament.findByIdAndUpdate(medicamentId,{isSelected:true});
      res.status(200).send('Medicament selected successfully.');
    } catch (err) {
      console.error('Error selecting medicament:', err);
      res.status(500).send('Error selecting medicament.');
    }
  };
  
  exports.unselectMedicament = async (req, res) => {
    const { medicamentId } = req.body;
  
    try {
      // Remove medicament from pharmacy collection
      await Pharmacy.deleteOne({ medicamentId: medicamentId });
      await Medicament.findByIdAndUpdate(medicamentId,{isSelected:false});
      res.status(200).send('Medicament unselected successfully.');
    } catch (err) {
      console.error('Error unselecting medicament:', err);
      res.status(500).send('Error unselecting medicament.');
    }
  };
  exports.settingsMedicament = async (req, res) => {
    const { medicamentId, minquantity, PreExpirationAlert } = req.body;

    try {
        await Pharmacy.findOneAndUpdate(
            { medicamentId: medicamentId }, // Find the Pharmacy document by medicamentId
            { minquantity: minquantity, PreExpirationAlert:PreExpirationAlert }   // Update the minquantity field
        );
        res.redirect("back");
    } catch (err) {
        console.error("Error updating minquantity for medicament:", err);
        res.status(500).send("Error updating minquantity for medicament.");
    }
};
  exports.getNewPurchaseRequestPage = async (req, res) => {
   
    try {
      const Medicaments = await PurchaseRequest.find().populate("medicamentId").exec();
      
       res.render("Pharmacy/newPurchaseRequest"); 
    } catch (err) {
        console.error("Error getting new purchase request:", err);
        res.status(500).send("Error updating minquantity for medicament.");
    }
};
exports.getNewPurchaseRequestPage = async (req, res) => {
   
  try {
    const Medicaments = await Medicament.find();
    
     res.render("Pharmacy/newPurchaseRequest",Medicaments); 
  } catch (err) {
      console.error("Error getting new purchase request:", err);
      res.status(500).send("Error updating minquantity for medicament.");
  }
};
 