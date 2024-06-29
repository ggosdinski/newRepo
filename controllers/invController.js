const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


//Function for building vehicle detail view
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.invId;
  const vehicle = await invModel.getVehicleById(inv_id);
  const vehicleDetailHTML = utilities.buildVehicleDetailHTML(vehicle);
  let nav = await utilities.getNav();
  res.render("./inventory/detail", {
    title: vehicle.inv_make + " " + vehicle.inv_model,
    nav,
    vehicleDetailHTML,
  });
};

module.exports = invCont