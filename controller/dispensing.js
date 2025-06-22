const { Dispensing, DispensingItems } = require("../models/dispensing");
const Storage = require("../models/storage");
const InStock = require("../models/inStock");
const Medicament = require("../models/medicament");
const moment = require("moment");



exports.getAllDispensings = async (req, res) => {
    const { serviceABV } = req.params;
    
    try {
        // Fetch all dispensings for the given service with populated user data and sorted by creation date
        const dispensings = await Dispensing.find({ serviceABV })
            .populate({
                path: 'createdBy',
                select: 'username'
            })
            .sort({ CreationDate: -1 });

        // Calculate correct total quantities for each dispensing
        const dispensingsWithTotals = await Promise.all(
            dispensings.map(async (dispensing) => {
                const result = await DispensingItems.aggregate([
                    { $match: { dispensingId: dispensing._id } },
                    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
                ]);
                
                const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
                
                return {
                    ...dispensing.toObject(),
                    totalItems: totalQuantity
                };
            })
        );

        res.render("dispensing/index", {
            dispensings: dispensingsWithTotals,
            serviceABV,
            moment, 
        });
           
    } catch (err) {
        return res.status(500).send({ message: err.message });
    };
};
exports.createDispensing = async (req, res) => {
    const {serviceABV } = req.params;

    try {
       
        // Create a new dispensing record
        const dispensing = new Dispensing({
            serviceABV,
            CreationDate: new Date(),
            createdBy: req.user._id, 
        });

        await dispensing.save();
        req.flash("success", "New dispensing created successfully!");
        res.redirect(`/dispensing/${serviceABV}/${dispensing._id}`);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
 
};
exports.deleteDispensing = async (req, res) => {
    const { dispensingId } = req.params;
    
    try {
        // First fetch the dispensing to check totalItems
        const dispensing = await Dispensing.findById(dispensingId);
        
        if (!dispensing) {
            return res.status(404).json({ 
                success: false, 
                message: 'Dispensing not found.' 
            });
        }
        
        if (dispensing.totalItems > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete dispensing with existing items. Please remove all items first.' 
            });
        }
        
        // If no items, delete the dispensing
        const deletedDispensing = await Dispensing.findByIdAndDelete(dispensingId);
        
        if (!deletedDispensing) {
            return res.status(404).json({ 
                success: false, 
                message: 'Dispensing not found.' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Dispensing deleted successfully.' 
        });
        
    } catch (error) {
        console.error('Delete dispensing error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting dispensing.' 
        });
    }
};
exports.getSessionDispensings = async (req, res) => {
    
    const { serviceABV, dispensingId } = req.params;
    
    try {
        // Fetch the dispensing session
        const dispensing = await Dispensing.findById(dispensingId)
            .populate({
                path: 'createdBy',
                select: 'username'
            });

        if (!dispensing) {
            req.flash('error', 'Dispensing session not found');
            return res.redirect(`/dispensing/${serviceABV}`);
        }

        // Fetch all dispensing items for this session
        const dispensingItems = await DispensingItems.find({ dispensingId })
            .populate('medicamentId')
             .populate({
                path: 'dispensedBy',
                select: 'username'
            })
            .sort({ createdAt: -1 });

        // Calculate total quantity for display
        const totalQuantity = dispensingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

        res.render("dispensing/dispensing-items", {
            dispensing,
            dispensingItems,
            serviceABV,
            moment,
            highlightItemId: req.flash('highlightItemId')[0] || null,
            totalQuantity,
        });
            
    } catch (err) {
        return res.status(500).send({ message: err.message });
    };
};
exports.createSessionDispensings = async (req, res) => {
    
    const { serviceABV, dispensingId } = req.params;
    
    try {
        // Fetch all dispensings for the given patient
        const dispensingItems = await DispensingItems.find({ serviceABV: serviceABV })
            .populate("medicament")
            .populate("storage")
            .sort({ createdAt: -1 });

            res.render("dispensing/dispensing-items", {
                dispensingItems,
                serviceABV,
                moment, 
            });
            
    } catch (err) {
        return res.status(500).send({ message: err.message });
    };
};
exports.processScan = async (req, res) => {
    const { serviceABV, dispensingId } = req.params;
    const { barcode } = req.body;

    console.log('=== PROCESSING SCAN ===');
    console.log('Request data:', { serviceABV, dispensingId, barcode });

    try {
        // Find the dispensing session
        const dispensing = await Dispensing.findById(dispensingId);
        if (!dispensing) {
            console.log('ERROR: Dispensing session not found:', dispensingId);
            return res.status(404).json({
                success: false,
                message: 'Dispensing session not found'
            });
        }

        // Find the item in InStock for this service
        const storages = await Storage.find({ serviceABV });
        const storageIds = storages.map(s => s._id);
        console.log('Storage IDs for service:', storageIds);
        
        const inStockItem = await InStock.findOne({
            barcode: barcode,
            storageId: { $in: storageIds },
            quantity: { $gt: 0 }
        }).populate('medicamentId');
        
        console.log('In-stock item found:', inStockItem ? 'YES' : 'NO');
        if (!inStockItem) {
            console.log('ERROR: Item not found in stock');
            req.flash('error', 'Item not found in this service\'s inventory or out of stock');
            return res.json({
                success: false,
                message: 'Item not found in this service\'s inventory or out of stock',
                reload: true
            });
        }

        // Backend multi-scan detection: Check if the same barcode was scanned within the last 1 minute
        const MULTI_SCAN_THRESHOLD = 60000; // 1 minute (60 seconds)
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - MULTI_SCAN_THRESHOLD);

        // Find the most recent item with the same barcode in this dispensing session within the last 1 minute
        const lastDispensedItem = await DispensingItems.findOne({
            dispensingId: dispensingId,
            barcode: barcode,
            createdAt: { $gte: oneMinuteAgo }
        }).sort({ createdAt: -1 });

        console.log('Multi-scan check:', {
            barcode,
            threshold: MULTI_SCAN_THRESHOLD,
            oneMinuteAgo: oneMinuteAgo.toISOString(),
            lastDispensedItem: lastDispensedItem ? 'FOUND' : 'NOT FOUND'
        });

        // If we found a recent item with the same barcode, update its quantity instead of creating a new one
        if (lastDispensedItem) {
            console.log('MULTISCAN DETECTED - Updating quantity of existing item');
            console.log('Item details:', {
                id: lastDispensedItem._id,
                currentQuantity: lastDispensedItem.quantity,
                barcode: lastDispensedItem.barcode,
                createdAt: lastDispensedItem.createdAt
            });

            // Update the quantity
            const updatedItem = await DispensingItems.findByIdAndUpdate(
                lastDispensedItem._id, 
                { $inc: { quantity: 1 } },
                { new: true }
            );

            console.log('Updated item new quantity:', updatedItem.quantity);

            // Decrease the inStock quantity
            await InStock.findByIdAndUpdate(inStockItem._id, {
                $inc: { quantity: -1 }
            });

            // Note: totalItems will be updated automatically by the model middleware

            console.log('MULTISCAN SUCCESS - Quantity updated');
            req.flash('success', 'Quantity updated (+1)');
            req.flash('highlightItemId', updatedItem._id.toString());
            return res.json({
                success: true,
                message: 'Quantity updated (+1)',
                isMultiScan: true,
                reload: true
            });
        }

        console.log('CREATING NEW DISPENSING ITEM');
        // Create new dispensing item
        const dispensingItem = new DispensingItems({
            dispensingId,
            medicamentId: inStockItem.medicamentId._id,
            barcode,
            batchNumber: inStockItem.batchNumber,
            serialNumber: inStockItem.serialNumber,
            expiryDate: inStockItem.expiryDate,
            quantity: 1,
            dispensedBy: req.user._id
        });

        const savedItem = await dispensingItem.save();
        console.log('New item created with ID:', savedItem._id);

        // Decrease the inStock quantity
        await InStock.findByIdAndUpdate(inStockItem._id, {
            $inc: { quantity: -1 }
        });

        // Note: totalItems will be updated automatically by the model middleware

        console.log('NEW ITEM SUCCESS - Item added to dispensing');
        req.flash('success', 'Item added successfully');
        req.flash('highlightItemId', savedItem._id.toString());
        return res.json({
            success: true,
            message: 'Item added successfully',
            isMultiScan: false,
            reload: true
        });

    } catch (error) {
        console.error('SCAN ERROR:', error);
        req.flash('error', 'Error processing barcode scan: ' + error.message);
        return res.json({
            success: false,
            message: 'Error processing barcode scan: ' + error.message,
            reload: true
        });
    }
};