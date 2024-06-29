const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New route for displaying vehicle details
router.get("/detail/:invId", invController.buildVehicleDetail);

// Handler for intentional error
router.get("/intentional-error", (req, res, next) => {
    next(new Error("This is an intentional 500 error."));
  });

module.exports = router;
