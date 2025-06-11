const invModel = require("../models/inventory-model")

/* ****************************************
*  Middleware to build and inject nav menu
* **************************************** */
async function buildNavigation(req, res, next) {
  try {
    const nav = await getNav()
    res.locals.nav = nav
    next()
  } catch (err) {
    console.error("Navigation build error:", err)
    next(err)
  }
}

// This builds the nav HTML string
async function getNav() {
  const data = await invModel.getClassifications()
  let nav = '<nav class="nav-bar"><ul>'
  nav += '<li><a href="/">Home</a></li>'
  data.forEach(row => {
    nav += `<li><a href="/inv/type/${row.classification_name.toLowerCase()}">${row.classification_name}</a></li>`
  })
  nav += '</ul></nav>'
  return nav
}

function buildClassificationGrid(data) {
  let grid = '<ul>'
  data.forEach(vehicle => {
    grid += `<li><strong>${vehicle.inv_make} ${vehicle.inv_model}</strong><br>
             Year: ${vehicle.inv_year}<br>
             Price: $${vehicle.inv_price}<br>
             Miles: ${vehicle.inv_miles}<br>
             Color: ${vehicle.inv_color}</li>`
  })
  grid += '</ul>'
  return grid
}

module.exports = {
  buildNavigation,
  getNav,
  buildClassificationGrid
}
