const pool = require("../database")
const utilities = require("../utilities/navigation")
const invModel = require("../models/inventory-model")

// This function builds the classification view
async function buildByClassificationName(req, res, next) {
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

// This function builds the vehicle detail view
async function buildByVehicleId(req, res, next) {
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

module.exports = {
  buildByClassificationName,
  buildByVehicleId
}
