// // Needed Resources 
// const express = require("express")
// const router = new express.Router() 
// const invController = require("../controllers/invController")

const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")

router.get("/type/:classification", invController.buildByClassificationName)

router.get("/detail/:inv_id", invController.buildByVehicleId)

module.exports = router
