const invModel = require("../models/inventory-model");
const Util = require("../utilities/");

const { body, validationResult } = require("express-validator");

const invCont = {};

// Función para construir la vista de gestión
invCont.buildManagementView = async (req, res, next) => {
  try {
    let nav = await Util.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash('notice')
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
    next(error);
  }
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
invCont.addInventory = [
  // Validación del lado del servidor
  body('inv_make').trim().isLength({ min: 1 }).withMessage('Make is required.'),
  body('inv_model').trim().isLength({ min: 1 }).withMessage('Model is required.'),
  body('inv_year').trim().isLength({ min: 4, max: 4 }).isNumeric().withMessage('Year must be a 4-digit number.'),
  body('inv_description').trim().isLength({ min: 1 }).withMessage('Description is required.'),
  body('inv_image').trim().isLength({ min: 1 }).withMessage('Image path is required.'),
  body('inv_thumbnail').trim().isLength({ min: 1 }).withMessage('Thumbnail path is required.'),
  body('inv_price').trim().isNumeric().withMessage('Price must be a number.'),
  body('inv_miles').trim().isNumeric().withMessage('Miles must be a number.'),
  body('inv_color').trim().isLength({ min: 1 }).withMessage('Color is required.'),
  body('classification_id').trim().isNumeric().withMessage('Classification is required.'),

  async (req, res, next) => {
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
  }
];

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

// Controlador para ruta de error intencional
exports.generateIntentionalError = Util.handleErrors(async (req, res, next) => {
  throw new Error("This is an intentional 500 error.");
});

module.exports = invCont;
