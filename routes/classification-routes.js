const express = require("express");
const router = express.Router();
const classificationController = require("../controllers/classificationController");
const verifyJWT = require("../utilities/jwtAuth");
const requireEmployeeOrAdmin = require("../utilities/requireEmployeeOrAdmin");

// Add Classification - Restricted to Employee or Admin
router.get('/classification/add', verifyJWT, requireEmployeeOrAdmin, classificationController.showAddForm);
router.post('/classification/add', verifyJWT, requireEmployeeOrAdmin, classificationController.handleAddForm);

module.exports = router;
