const express = require('express');
const Demand = require('../models/demand'); // Assuming you have a model for Demand requests
const User = require('../models/user'); // Assuming you have a user model
const { isLoggedIn, isAdmin, isTechnician } = require('../middleware/authMiddleware');
const router = express.Router();

// Demand Request creation page
router.get('/create-demand', isLoggedIn, (req, res) => {
    res.render('create-demand');  // render the demand creation form
});

// Handle the creation of a new demand (POST request)
router.post('/create-demand', isLoggedIn, async (req, res) => {
    try {
        // Create a new instance of the Demand model
        const newDemand = new Demand({
            title: req.body.title,
            category: req.body.category,
            service: req.body.service,
            priority: req.body.priority,
            description: req.body.description,
            quantity: req.body.quantity || null,  // Optional: depending on the category selected
            contact: req.body.contact,
            status: 'Pending',  // Initial status
            createdBy: req.session.username, // Assuming the creator is passed in the form
        });

        // Save the new demand
        await newDemand.save();

        // Redirect after saving the demand
        res.redirect('/demands');
    } catch (err) {
        // If there's an error during save, send an error response
        console.error(err);
        res.status(500).send('Error saving demand request');
    }
});

// Get all demands (for listing them)
router.get('/demands', isLoggedIn, async (req, res) => {
    try {
        const demands = await Demand.find();  // Fetch all demands
        res.render('demands', { demands, user: req.session });  // Render the page with demands data
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching demands');
    }
});

router.get('/demand/:id', async (req, res) => {
    try {
      // Retrieve the demand by its ID from the database
      const demand = await Demand.findById(req.params.id).populate('assignedTo createdBy'); // Populate if needed for user details
      
      if (!demand) {
        return res.status(404).send('Demand not found');
      }
      
      // Render the demand details page
      res.render('demand-detail', { demand }); // 'demand-detail' is the name of your EJS view
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  
module.exports = router;
