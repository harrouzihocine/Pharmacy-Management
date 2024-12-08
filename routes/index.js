const express = require('express');
const Ticket = require('../models/ticket');
const User = require('../models/user');

const router = express.Router();

// Home Route
router.get('/', (req, res) => {
    res.render('index');
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login');
});

// Dashboard Route
router.get('/dashboard', (req, res) => {
    Ticket.find({}, (err, tickets) => {
        if (err) throw err;
        res.render('dashboard', { tickets });
    });
});

// Ticket creation page
router.get('/create-ticket', (req, res) => {
    res.render('create-ticket');
});

// Ticket submission logic
router.post('/submit-ticket', (req, res) => {
    const newTicket = new Ticket({
        title: req.body.title,
        description: req.body.description,
        status: 'Open',
    });

    newTicket.save((err) => {
        if (err) {
            res.send('Error saving ticket');
        } else {
            res.redirect('/dashboard');
        }
    });
});

module.exports = router;