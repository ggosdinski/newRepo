const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}


/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  if (!data || data.length === 0) {
    // Handle case where no data is found
    console.error(`No data found for classification ID ${classification_id}`);
    return res.status(404).render("errors/error", {
      title: 'Not Found',
      message: 'Sorry, no matching vehicles could be found.',
      nav: await utilities.getNav()
    });
  }

  const className = data[0].classification_name;
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};


//Function for building vehicle detail view
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.invId;
  const vehicle = await invModel.getVehicleById(inv_id);

  if (!vehicle) {
    // Handle case where no vehicle is found
    console.error(`No vehicle found with ID ${inv_id}`);
    return res.status(404).render("errors/error", {
      title: 'Not Found',
      message: 'Sorry, the requested vehicle details could not be found.',
      nav: await utilities.getNav()
    });
  }

  const vehicleDetailHTML = utilities.buildVehicleDetailHTML(vehicle);
  let nav = await utilities.getNav();

  res.render("./inventory/detail", {
    title: vehicle.inv_make + " " + vehicle.inv_model,
    nav,
    vehicleDetailHTML,
  });
};


// Controller for intentional error route
exports.generateIntentionalError = utilities.handleErrors(async (req, res, next) => {
  throw new Error("This is an intentional 500 error.");
});



module.exports = invCont