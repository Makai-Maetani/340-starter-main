const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const verifyJWT = require("../utilities/jwtAuth");
const requireEmployeeOrAdmin = require("../utilities/requireEmployeeOrAdmin");

// View all vehicles (public)
router.get("/", invController.buildInventory);

// Classification filter (public)
router.get("/type/:classification", invController.buildByClassificationName);

// View single vehicle (public)
router.get("/detail/:inv_id", invController.buildByVehicleId);

// ===== PROTECTED ROUTES ===== //

// Add vehicle form - employee/admin only
router.get("/add", verifyJWT, requireEmployeeOrAdmin, invController.showAddForm);
router.post("/add", verifyJWT, requireEmployeeOrAdmin, invController.handleAddForm);

// Maintenance page - employee/admin only
router.get("/maintenance", verifyJWT, requireEmployeeOrAdmin, invController.showMaintenancePage);

// Edit/delete routes - employee/admin only
router.get("/edit/:inv_id", verifyJWT, requireEmployeeOrAdmin, invController.showEditForm);
router.post("/edit/:inv_id", verifyJWT, requireEmployeeOrAdmin, invController.handleEditForm);
router.post("/delete/:inv_id", verifyJWT, requireEmployeeOrAdmin, invController.deleteVehicle);

module.exports = router;
