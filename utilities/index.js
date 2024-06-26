const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid = '';

  if (data.length > 0) {
    grid = '<ul class="inventory-grid">';

    data.forEach(vehicle => {
      grid += '<li class="inventory-item">';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
      grid += '<img src="' + vehicle.inv_thumbnail + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />';
      grid += '<div class="namePrice">';
      grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>';
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>'; // Cierre del div namePrice
      grid += '</a>'; // Cierre del enlace
      grid += '</li>'; // Cierre del li
    });

    grid += '</ul>'; // Cierre del ul
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};



// Function to build vehicle detail HTML
Util.buildVehicleDetailHTML = function (vehicle) {
  if (!vehicle) {
    return '<p class="notice">Vehicle details not found.</p>';
  }
  let detailHTML = '<div class="vehicle-detail">';
  detailHTML += '<div class="vehicle-header">';
  detailHTML += '<h1>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>';
  detailHTML += '<img src="' + vehicle.inv_image + '" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model + '" />';
  detailHTML += '</div>'; // Cierre del contenedor vehicle-header
  detailHTML += '<div class="vehicle-info">';
  detailHTML += '<p><strong>Year:</strong> ' + vehicle.inv_year + '</p>';
  detailHTML += '<p><strong>Description:</strong> ' + vehicle.inv_description + '</p>';
  detailHTML += '<p><strong>Price:</strong> $' + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + '</p>';
  detailHTML += '<p><strong>Mileage:</strong> ' + new Intl.NumberFormat("en-US").format(vehicle.inv_miles) + '</p>';
  detailHTML += '<p><strong>Color:</strong> ' + vehicle.inv_color + '</p>';
  detailHTML += '</div>'; // Cierre del contenedor vehicle-info
  detailHTML += '</div>'; // Cierre del contenedor principal vehicle-detail
  return detailHTML;
};



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)



module.exports = Util