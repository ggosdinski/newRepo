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
/* router.post(
    "/login",
    (req, res) => {
      res.status(200).send('login process')
    }
  )
 */
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  )


// New default route for account management view
router.get("/", utilities.handleErrors(accountController.buildAccountManagement));
/* router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement)) */
// Si uso este codigo, cuando intento loguearme, no me deja, me vuelve a mandar al login. Si uso
// el de arriba, si puedo loguearme sin problema pero no uso checklogin
module.exports = router;