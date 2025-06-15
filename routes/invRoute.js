const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")

router.get("/type/:classification", invController.buildByClassificationName)
router.get("/detail/:inv_id", invController.buildByVehicleId)
router.get("/", invController.buildInventory)

router.get("/add", invController.showAddForm)
router.post("/add", invController.handleAddForm)

module.exports = router
