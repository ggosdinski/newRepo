<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

// Route to display login view
router.get("/login", accountController.buildLogin);

// Route to display registration view
router.get("/register", accountController.buildRegister);

// Route to process registration form submission
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Handler for intentional error
router.get("/intentional-error", (req, res, next) => {
    next(new Error("This is an intentional 500 error."));
});

// Process the login attempt
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
  )
module.exports = router;
=======
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

// Route to display login view
router.get("/login", accountController.buildLogin);

// Route to display registration view
router.get("/register", accountController.buildRegister);

// Route to process registration form submission
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Handler for intentional error
router.get("/intentional-error", (req, res, next) => {
    next(new Error("This is an intentional 500 error."));
});

// Process the login attempt
router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
  )
module.exports = router;
>>>>>>> 8a14e13b1b8e727f4fa01b4acf91f5c04bcee0e9