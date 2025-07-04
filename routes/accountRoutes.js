const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');


// Show signup form
router.get('/signup', accountController.showSignupForm);

// Handle signup form POST
router.post('/signup', accountController.handleSignup);

// Login Routes
router.get('/login', accountController.showLoginForm);
router.post('/login', accountController.handleLogin);
router.get('/logout', accountController.handleLogout);

// Update routes

// Show account update page
router.get('/update', accountController.showAccountUpdateForm);

// Handle account update POST
router.post('/update', accountController.handleAccountUpdate);

// Handle password change POST
router.post('/update-password', accountController.handlePasswordChange);


module.exports = router;
