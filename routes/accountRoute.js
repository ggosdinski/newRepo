const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/users')); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });


// Route to display login view
router.get("/login", accountController.buildLogin);

// Route to display registration view
router.get("/register", accountController.buildRegister);

// Route to process registration form submission
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Handler for intentional error
router.get("/intentional-error", (req, res, next) => {
  next(new Error("This is an intentional 500 error."));
});

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// New default route for account management view
router.get("/", utilities.handleErrors(accountController.buildAccountManagement));

// Route for logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.redirect("/");
    } else {
      res.redirect("/account/login");
    }
  });
});

// Route to show the account update form
router.get("/update", accountController.showUpdateAccountForm);

// Route to process account update
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
);

// Route to process password change
router.post(
  "/change-password",
  regValidate.changePasswordRules(),   // Utiliza las reglas de validación para el cambio de contraseña
  regValidate.checkChangePasswordData, // Utiliza la función para verificar los datos de cambio de contraseña
  utilities.handleErrors(accountController.changePassword)
);

// Route for uploading profile picture
router.post(
  "/upload-profile-picture",
  upload.single('profile_picture'),
  utilities.handleErrors(accountController.uploadProfilePicture)
);

// Route for logout
router.get("/logout", accountController.logout);

module.exports = router;
