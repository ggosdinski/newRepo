const invModel = require("../models/inventory-model");
const Util = require("../utilities/");
const { body, validationResult } = require("express-validator");

const invCont = {};

// Función para construir la vista de gestión
invCont.buildManagementView = async (req, res, next) => {
  let nav = await Util.getNav();
  
  // Espacio para llamar a la función que crea la lista desplegable de clasificaciones
  let classificationList = await Util.buildClassificationList();
  
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationList,  // Pasando la lista de selección a la vista
  });
};

// Función para mostrar el formulario de agregar clasificación
invCont.showAddClassification = async (req, res, next) => {
  try {
    let nav = await Util.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages: req.flash('notice')
    });
  } catch (error) {
    console.error("Error rendering add classification form:", error);
    next(error);
  }
};

// Función para manejar la adición de una nueva clasificación
invCont.addClassification = [
  // Validación del lado del servidor
  body('classification_name')
    .trim()
    .isLength({ min: 1 }).withMessage('Classification name is required.')
    .isAlphanumeric().withMessage('Classification name must not contain special characters or spaces.'),

  async (req, res, next) => {
    try {
      let nav = await Util.getNav();
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // Si hay errores de validación, renderiza la vista de nuevo con los errores
        return res.render("inventory/add-classification", {
          title: "Add New Classification",
          nav,
          messages: req.flash('notice'),
          errors: errors.array(),
          data: req.body
        });
      }

      const { classification_name } = req.body;

      const result = await invModel.addClassification(classification_name);
      req.flash('notice', 'Classification added successfully.');
      res.redirect("/inv/management");
    } catch (error) {
      console.error("Error adding classification:", error);
      req.flash('notice', 'Failed to add classification. Please try again.');
      res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        messages: req.flash('notice'),
        data: req.body
      });
    }
  }
];

// Función para mostrar la vista de agregar inventario
invCont.buildAddInventory = async (req, res, next) => {
  try {
    let nav = await Util.getNav();
    let classificationList = await Util.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      messages: req.flash('notice')
    });
  } catch (error) {
    console.error("Error rendering add inventory form:", error);
    next(error);
  }
};

// Función para manejar el envío del formulario de agregar inventario
invCont.addInventory = async function (req, res, next) {
  try {
    let nav = await Util.getNav();
    let classificationList = await Util.buildClassificationList(req.body.classification_id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Si hay errores de validación, renderiza la vista de nuevo con los errores
      return res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        messages: req.flash('notice'),
        errors: errors.array(),
        data: req.body
      });
    }

    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

    const result = await invModel.addInventory({
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    });
    req.flash('notice', 'Inventory item added successfully.');
    res.redirect("/inv/management");
  } catch (error) {
    console.error("Error adding inventory item:", error);
    req.flash('notice', 'Failed to add inventory item. Please try again.');
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      messages: req.flash('notice'),
      data: req.body
    });
  }
};

// Función para construir la vista de inventario por clasificación
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      // Manejar caso donde no se encuentra ningún dato
      console.error(`No data found for classification ID ${classification_id}`);
      return res.status(404).render("errors/error", {
        title: 'Not Found',
        message: 'Sorry, no matching vehicles could be found.',
        nav: await Util.getNav()
      });
    }

    const className = data[0].classification_name;
    const grid = await Util.buildClassificationGrid(data);
    let nav = await Util.getNav();

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error building classification view:", error);
    next(error);
  }
};

// Función para construir la vista de detalle de vehículo
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      // Manejar caso donde no se encuentra el vehículo
      console.error(`No vehicle found with ID ${inv_id}`);
      return res.status(404).render("errors/error", {
        title: 'Not Found',
        message: 'Sorry, the requested vehicle details could not be found.',
        nav: await Util.getNav()
      });
    }

    const vehicleDetailHTML = Util.buildVehicleDetailHTML(vehicle);
    let nav = await Util.getNav();

    res.render("./inventory/detail", {
      title: vehicle.inv_make + " " + vehicle.inv_model,
      nav,
      vehicleDetailHTML,
    });
  } catch (error) {
    console.error("Error building vehicle detail view:", error);
    next(error);
  }
};

// Función para construir la vista de confirmación de eliminación de inventario
invCont.buildDeleteConfirmView = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    let nav = await Util.getNav();
    
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      req.flash('error', 'Inventory item not found');
      return res.redirect('/inv/management');
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      messages: req.flash('error'), 
      ...itemData // Spread operator for cleaner code
    });
  } catch (error) {
    console.error("Error rendering delete confirmation view:", error);
    next(error);
  }
};

// Función para eliminar el inventario
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const deleteResult = await invModel.deleteInventory(inv_id);

    if (!deleteResult) {
      req.flash('error', 'Failed to delete inventory item');
    } else {
      req.flash('notice', 'Inventory item deleted successfully');
    }

    res.redirect("/inv/management");
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    req.flash('error', 'Failed to delete inventory item. Please try again.');
    res.redirect("/inv/management");
  }
};

// Controlador para ruta de error intencional
exports.generateIntentionalError = Util.handleErrors(async (req, res, next) => {
  throw new Error("This is an intentional 500 error.");
});

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.invId);
    let nav = await Util.getNav();
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      req.flash('error', 'Inventory item not found');
      return res.redirect('/inv/management');
    }

    const classificationList = await Util.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      messages: req.flash('error'), 
      ...itemData // Spread operator for cleaner code
    });
  } catch (error) {
    console.error("Error rendering edit inventory view:", error);
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await Util.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  let classificationList = await Util.buildClassificationList(classification_id);

  if (updateResult) {
    const itemName = updateResult.inv_make + ' ' + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect('/inv/management/')
  } else {
    req.flash("notice", "Sorry, the insert failed.")
    const itemData = {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    }
    res.render("inventory/edit-inventory", {
      title: "Edit " + itemData.inv_make + " " + itemData.inv_model,
      nav,
      classificationList,
      messages: req.flash('notice'),
      itemData,
    })
  }
};


/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId, 10);

  if (isNaN(inv_id)) {
    req.flash('error', 'Invalid inventory ID');
    return res.redirect('/inv/management');
  }

  try {
    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult === 0) {
      req.flash('error', 'Failed to delete inventory item');
      return res.redirect(`/inv/delete-confirm/${inv_id}`);
    } else {
      req.flash('notice', 'Inventory item deleted successfully');
      return res.redirect("/inv/management");
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    req.flash('error', 'Failed to delete inventory item. Please try again.');
    return res.redirect(`/inv/delete-confirm/${inv_id}`);
  }
};



module.exports = invCont;
