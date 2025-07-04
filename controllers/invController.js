// controllers/invController.js

const utilities = require("../utilities/navigation")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const pool = require("../database/connection")

const invController = {}

// ===== Build classification view =====
invController.buildByClassificationName = async function (req, res, next) {
  const classificationName = req.params.classification

  try {
    const data = await invModel.getInventoryByClassificationName(classificationName)
    const grid = utilities.buildClassificationGrid(data)
    const capitalizedName = classificationName.charAt(0).toUpperCase() + classificationName.slice(1)

    res.render("inventory/classification", {
      title: `${capitalizedName} Vehicles`,
      grid,
      classificationName: capitalizedName,
      nav: res.locals.nav,
      vehicles: data,
      layout: "./layouts/layout"
    })
  } catch (error) {
    next(error)
  }
}

// ===== Build individual vehicle detail view =====
invController.buildByVehicleId = async function (req, res, next) {
  const invId = req.params.inv_id
  try {
    const data = await invModel.getVehicleById(invId)
    const vehicle = data[0]

    if (!vehicle) {
      return res.status(404).send("Vehicle not found")
    }

    res.render("inventory/vehicle-detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicle,
      nav: res.locals.nav,
      layout: "./layouts/layout"
    })
  } catch (error) {
    next(error)
  }
}

// ===== Show Add Vehicle Form =====
invController.showAddForm = async (req, res) => {

  try {
    const result = await pool.query("SELECT * FROM classification")
    res.render("inventory/addVehicle", {
      title: "Add Vehicle",
      classifications: result.rows,
      errors: [],
      data: {}
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Error loading form")
  }
}

invController.buildInventory = async function (req, res, next) {
  try {
    const data = await invModel.getInventory()
    res.render("inventory/inventory", {
      title: "Inventory",
      nav: res.locals.nav,
      vehicles: data,
      layout: "./layouts/layout"
    })
  } catch (error) {
    next(error)
  }
}


// ===== Handle Add Vehicle POST =====
invController.handleAddForm = [
  // Validation rules
  body("inv_make").isLength({ min: 3 }).withMessage("Make must be at least 3 characters"),
  body("inv_model").isLength({ min: 3 }).withMessage("Model must be at least 3 characters"),
  body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year"),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive number"),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be positive"),
  body("inv_color").notEmpty().withMessage("Color is required"),
  body("inv_description").notEmpty().withMessage("Description is required"),
  body("inv_image").notEmpty().withMessage("Image URL is required"),
  body("inv_thumbnail").notEmpty().withMessage("Thumbnail path is required"),
  body("classification_id").isInt().withMessage("Choose a classification"),

  // Request handler
  async (req, res) => {
    console.log("FORM DATA RECEIVED:", req.body) 
    const errors = validationResult(req)
    const data = req.body

    if (!errors.isEmpty()) {
      const result = await pool.query("SELECT * FROM classification")
      console.log("Rendering add vehicle form");

      return res.render("inventory/addVehicle", {
        title: "Add Vehicle",
        classifications: result.rows,
        errors: errors.array(),
        data
      })
    }

    try {
      const query = `
        INSERT INTO inventory (
          inv_make, inv_model, inv_year, inv_description,
          inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `
        const values = [
          data.inv_make,
          data.inv_model,
          data.inv_year,
          data.inv_description,
          data.inv_image,
          data.inv_thumbnail, // Added!
          data.inv_price,
          data.inv_miles,
          data.inv_color,
          data.classification_id
        ]

      await pool.query(query, values)
      res.redirect("/inv")
    } catch (err) {
      console.error(err)
      res.status(500).send("Database insert failed")
    }
  }
]

invController.showMaintenancePage = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory ORDER BY inv_make, inv_model");
    res.render("inventory/vehicle-maintenance", {
      title: "Vehicle Maintenance",
      vehicles: result.rows,
      nav: res.locals.nav,
      layout: "./layouts/layout"
    });
  } catch (err) {
    console.error("Error loading maintenance page:", err);
    res.status(500).send("Server error");
  }
};

// ===== Show Edit Vehicle Form =====
invController.showEditForm = async (req, res) => {
  const inv_id = req.params.inv_id;
  try {
    const [vehicleResult, classificationResult] = await Promise.all([
      pool.query("SELECT * FROM inventory WHERE inv_id = $1", [inv_id]),
      pool.query("SELECT * FROM classification")
    ]);

    const vehicle = vehicleResult.rows[0];
    if (!vehicle) return res.status(404).send("Vehicle not found");

    res.render("inventory/editVehicle", {
      title: "Edit Vehicle",
      vehicle,
      classifications: classificationResult.rows,
      errors: [],
      layout: "./layouts/layout"
    });
  } catch (err) {
    console.error("Edit form error:", err);
    res.status(500).send("Server error");
  }
};

// ===== Handle Edit Form Submission =====
invController.handleEditForm = [
  // Validation (same as add)
  body("inv_make").isLength({ min: 3 }).withMessage("Make must be at least 3 characters"),
  body("inv_model").isLength({ min: 3 }).withMessage("Model must be at least 3 characters"),
  body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year"),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive number"),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be positive"),
  body("inv_color").notEmpty().withMessage("Color is required"),
  body("inv_description").notEmpty().withMessage("Description is required"),
  body("inv_image").notEmpty().withMessage("Image URL is required"),
  body("inv_thumbnail").notEmpty().withMessage("Thumbnail path is required"),
  body("classification_id").isInt().withMessage("Choose a classification"),

  async (req, res) => {
    const errors = validationResult(req);
    const data = req.body;
    const inv_id = req.params.inv_id;

    if (!errors.isEmpty()) {
      const classificationResult = await pool.query("SELECT * FROM classification");
      return res.render("inventory/editVehicle", {
        title: "Edit Vehicle",
        vehicle: { ...data, inv_id },
        classifications: classificationResult.rows,
        errors: errors.array(),
        layout: "./layouts/layout"
      });
    }

    try {
      const query = `
        UPDATE inventory SET
          inv_make = $1, inv_model = $2, inv_year = $3,
          inv_description = $4, inv_image = $5, inv_thumbnail = $6,
          inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10
        WHERE inv_id = $11
      `;

      const values = [
        data.inv_make,
        data.inv_model,
        data.inv_year,
        data.inv_description,
        data.inv_image,
        data.inv_thumbnail,
        data.inv_price,
        data.inv_miles,
        data.inv_color,
        data.classification_id,
        inv_id
      ];

      await pool.query(query, values);
      res.redirect("/inv/maintenance");
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).send("Database update failed");
    }
  }
];

// ===== Handle Vehicle Deletion =====
invController.deleteVehicle = async (req, res) => {
  const inv_id = req.params.inv_id;
  try {
    await pool.query("DELETE FROM inventory WHERE inv_id = $1", [inv_id]);
    res.redirect("/inv/maintenance");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Delete failed");
  }
};


module.exports = invController
