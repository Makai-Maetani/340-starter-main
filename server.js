/*************************
* Require Statements
*************************/
const express = require("express")
const path = require("path")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()

const baseController = require("./controllers/baseController")
const utilities = require("./utilities/navigation")
const inventoryRoute = require("./routes/invRoute")
const staticRoutes = require("./routes/static")
const classificationRoutes = require('./routes/classification-routes')
const app = express()
const pool = require('./database/connection')
const invRoutes = require("./routes/invRoute");
const accountRoutes = require("./routes/accountRoutes")
const session = require('express-session');
const cookieParser = require('cookie-parser');

//const classificationController = require('../controllers/classificationController')

/*************************
* Middleware
*************************/

app.use((err, req, res, next) => {
  console.error('Express error handler caught:', err);
  res.status(500).send('Internal Server Error');
});


// Parse POST form data
app.use(express.urlencoded({ extended: true })) // For form data (POST)
app.use(express.json()) // For JSON payloads (optional, good practice)

// Static files (CSS, images, JS)
app.use(express.static(path.join(__dirname, 'public')))

// View engine setup
app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'))
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// ======== FIXED: Move session setup BEFORE anything that uses req.session ========
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// ======== Set account info into res.locals ========
app.use((req, res, next) => {
  res.locals.account = req.session.account || null;
  next();
});

// ======== Custom navigation builder middleware ========
app.use(utilities.buildNavigation)

// ======== Load classification data for all views ========
app.use(async (req, res, next) => {
  try {
    const result = await pool.query("SELECT classification_id, classification_name FROM classification ORDER BY classification_name")
    res.locals.classifications = result.rows
    next()
  } catch (error) {
    next(error)
  }
})

app.use(cookieParser());

/*************************
* Routes
*************************/
app.use("/", staticRoutes) // Static pages first
app.use("/inv", inventoryRoute)
app.get("/", baseController.buildHome)
app.use('/', classificationRoutes)
app.use("/inventory", invRoutes);
app.use("/", accountRoutes)


/*************************
* Error Handlers
*************************/
// 500 Error Handler
app.use(async (err, req, res, next) => {
  console.error(`Server Error at ${req.originalUrl}:`, err.message)
  res.status(500).render("errors/error500", {
    title: "Server Error",
    message: "Something went wrong on our end. We're testing underwater 🐟",
  })
})

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render("errors/error404", { title: "404 - Not Found" })
})

/*************************
* Server Start
*************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
