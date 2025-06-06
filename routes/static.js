// const express = require('express');
// const router = express.Router();

// // Static Routes
// // Set up "public" folder / subfolders for static files
// router.use(express.static("public"));
// router.use("/css", express.static(__dirname + "public/css"));
// router.use("/js", express.static(__dirname + "public/js"));
// router.use("/images", express.static(__dirname + "public/images"));

// module.exports = router;


const express = require("express")
const router = express.Router()

// Example route (optional)
router.get("/about", (req, res) => {
  res.render("about", { title: "About Us" })
})

module.exports = router

