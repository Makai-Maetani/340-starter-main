const express = require("express")
const router = express.Router()
const classificationController = require("../controllers/classificationController")

// Show the add classification form
router.get('/classification/add', classificationController.showAddForm)

// Handle the form submission to add a classification
router.post('/classification/add', classificationController.handleAddForm)

module.exports = router
