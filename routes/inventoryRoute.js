const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const Util = require("../utilities/");
const validate = require('../utilities/inventory-validation');

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New route for displaying vehicle details
router.get("/detail/:invId", invController.buildVehicleDetail);

// Route to display management view
router.get("/management", invController.buildManagementView);

// Route to display add new classification view (task 2)
router.get("/add-classification", invController.showAddClassification);

// Route to handle the submission of the add new classification form
router.post("/add-classification", invController.addClassification);

// Route to display add new inventory view (task 3)
router.get("/add-inventory", Util.handleErrors(invController.buildAddInventory));

// Route to handle form submission for adding a new inventory item
router.post("/add-inventory", Util.handleErrors(invController.addInventory));

// Route to fetch inventory based on classification_id
router.get("/getInventory/:classification_id", Util.handleErrors(invController.getInventoryJSON));

// Handler for intentional error
router.get("/intentional-error", (req, res, next) => {
  next(new Error("This is an intentional 500 error."));
});

/* ***************************
 *  Route to edit inventory item by inventory_id
 * ************************** */
router.get("/edit/:invId", Util.handleErrors(invController.buildEditInventoryView));

router.post("/update/", Util.handleErrors(invController.updateInventory));

router.post('/update', validate.inventoryRules(), validate.checkUpdateData, invController.updateInventory)

module.exports = router;
