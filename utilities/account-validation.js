const utilities = require("../utilities/");
const { body, validationResult } = require("express-validator");

const validate = {};

/* **********************************
 *  Registration Data Validation Rules
 * ********************************** */
validate.registrationRules = () => {
  return [
    // First name is required and must be a string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .isLength({ min: 1 })
      .withMessage("First name must be at least 1 character."),

    // Last name is required and must be a string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .isLength({ min: 1 })
      .withMessage("Last name must be at least 1 character."),

    // Valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email already exists. Please log in or use a different email.");
        }
      }),

    // Password is required and must meet strong password criteria
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* **********************************
 *  Login Data Validation Rules
 * ********************************** */
validate.loginRules = () => {
  return [
    // Valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Password is required
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* **********************************
 *  Update Account Data Validation Rules
 * ********************************** */
validate.updateAccountRules = () => {
  return [
    // First name is required and must be a string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name.")
      .isLength({ min: 1 })
      .withMessage("First name must be at least 1 character."),

    // Last name is required and must be a string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name.")
      .isLength({ min: 1 })
      .withMessage("Last name must be at least 1 character."),

    // Valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
  ];
};

/* **********************************
 *  Change Password Data Validation Rules
 * ********************************** */
validate.changePasswordRules = () => {
  return [
    // Old password is required
    body("old_password")
      .trim()
      .notEmpty()
      .withMessage("Old password is required."),

    // New password is required and must meet strong password criteria
    body("new_password")
      .trim()
      .notEmpty()
      .withMessage("New password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("New password does not meet requirements."),

    // Confirm password must match new password
    body("confirm_password")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.new_password) {
          throw new Error("Passwords do not match.");
        }
        return true;
      })
      .withMessage("Passwords must match."),
  ];
};

/* **********************************
 *  Check Registration Data
 * ********************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Registration",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 *  Check Login Data
 * ********************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 *  Check Update Account Data
 * ********************************** */
validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      ...req.body // Pass other form data back to the view for repopulating fields
    });
    return;
  }
  next();
};

/* **********************************
 *  Check Change Password Data
 * ********************************** */
validate.checkChangePasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/change-password", {
      title: "Change Password",
      nav,
      errors: errors.array(),
      ...req.body // Pass other form data back to the view for repopulating fields
    });
    return;
  }
  next();
};

module.exports = validate;
