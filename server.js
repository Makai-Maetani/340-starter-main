/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const path = require("path")
const baseController = require("./controllers/baseController")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const utilities = require("./utilities/navigation") 
const inventoryRoute = require("./routes/invRoute")
const staticRoutes = require("./routes/static")

/* ***********************
 * Middleware
 *************************/
// Static files first
app.use(express.static(path.join(__dirname, 'public')))

// View engine setup
app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// Custom middleware
app.use(utilities.buildNavigation)

/* ***********************
 * Routes
 *************************/
app.use("/", staticRoutes) // This should come before specific routes
app.use("/inv", inventoryRoute)
app.get("/", baseController.buildHome)

/* ***********************
 * Error Handlers
 *************************/
// 500 Error Handler
app.use(async (err, req, res, next) => {
  console.error(`Server Error at ${req.originalUrl}:`, err.message)
  res.status(500).render("errors/error500", {
    title: "Server Error",
    message: "Something went wrong on our end. Were testing underwater",
  })
})

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render("errors/error404", { title: "404 - Not Found" })
})

/* ***********************
 * Server Start
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})


//New Test TSuff
// /* ******************************************
//  * This server.js file is the primary file of the 
//  * application. It is used to control the project.
//  *******************************************/
// /* ***********************
//  * Require Statements
//  *************************/
// const express = require("express")
// const path = require("path"); 
// const baseController = require("./controllers/baseController")
// const expressLayouts = require("express-ejs-layouts")
// const env = require("dotenv").config()
// const app = express()
// const static = require("./routes/static")
// const staticRoutes = require("./routes/static");
// const utilities = require("./utilities/navigation") 
// const inventoryRoute = require("./routes/invRoute")


// app.use(staticRoutes);
// app.use("/inv", inventoryRoute)

// app.use(express.static("public"))
// app.use(utilities.buildNavigation)


// app.set("view engine", "ejs")
// app.set('views', path.join(__dirname, 'views'))
// app.use(expressLayouts)
// app.set("layout", "./layouts/layout")

// app.use(express.static(path.join(__dirname, 'public')));

// /* ***********************
//  * Routes
//  *************************/
// //index route

// app.get("/", baseController.buildHome)
// // Inventory routes

// //New Commet
// // app.use("/inv", inventoryRoute)


// /* ***********************
// * Express Error Handler
// * Place after all other middleware
// *************************/
// // app.use(async (err, req, res, next) => {
// //   let nav = await utilities.getNav()
// //   console.error(`Error at: "${req.originalUrl}": ${err.message}`)
// //   res.render("errors/error", {
// //     title: err.status || 'Server Error',
// //     message: err.message,
// //     nav
// //   })
// // })


// // // File Not Found Route - must be last route in list
// // app.use(async (req, res, next) => {
// //   next({status: 404, message: 'Sorry, we appear to have lost that page. TEST1234'})
// // })

// /* ***********************
//  * Local Server Information
//  * Values from .env (environment) file
//  *************************/
//  const port = process.env.PORT || 3000;
//  const host = process.env.HOST || 3000;
// // const port = "3000"
// // const host = "localhost"

// /* ***********************
//  * Log statement to confirm server operation
//  *************************/
// app.listen(port, () => {
//   console.log(`app listening on ${host}:${port}`)
// })

// // 500 Error Handler
// app.use(async (err, req, res, next) => {
//   console.error(`Server Error at ${req.originalUrl}:`, err.message);
//   res.status(500).render("errors/error500", {
//     title: "Server Error",
//     message: "Something went wrong on our end. Were testing underwater",
//   });
// });


// // 404 Handler
// app.use((req, res, next) => {
//   res.status(404).render("errors/error404", { title: "404 - Not Found" });

// });

