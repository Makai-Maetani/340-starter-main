//IDK



const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
//   const nav = await utilities.getNav()
  res.render("index", {title: "Home"})
  console.log("SESSION ACCOUNT:", req.session.account);

}

module.exports = baseController