const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
        messages: req.flash('notice')
      });
    }
  } catch (error) {
    console.error("Error registering account:", error.message);
    req.flash("error", "Registration failed. Please try again later.");
    res.status(500).redirect("/account/register");
  }
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        {
          account_id: accountData.account_id,
          account_email: accountData.account_email,
          account_type: accountData.account_type
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      req.session.user = accountData;
      req.session.loggedin = true;
      return res.redirect("/account/");
    }
  } catch (error) {
    return new Error('Access Forbidden');
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const user = req.session.user;
    const accountType = user.account_type;

    let welcomeMessage = `Welcome ${user.account_firstname}`;
    let inventoryManagementHeader = "";
    let updateLink = "";

    if (accountType === 'Employee' || accountType === 'Admin') {
      welcomeMessage = `Welcome ${user.account_firstname} Happy`;
      inventoryManagementHeader = `<h3>Inventory Management</h3><p><a href="/inv/management">Manage Inventory</a></p>`;
    }

    res.render("account/management", {
      title: "Account Management",
      nav,
      welcomeMessage,
      inventoryManagementHeader,
      updateLink,
      messages: req.flash('notice')
    });
  } catch (error) {
    console.error('Error rendering account management view:', error);
    next(error);
  }
}

/* ****************************************
 *  Show update account form
 * *************************************** */
const showUpdateAccountForm = async (req, res) => {
  try {
    let nav = await utilities.getNav();
    const userId = req.session.user.account_id;
    const user = await accountModel.getAccountById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('account/update', {
      title: 'Update Account Information',
      nav,
      account_firstname: user.account_firstname,
      account_lastname: user.account_lastname,
      account_email: user.account_email,
      account_id: user.account_id,
      errors: []  // Ensure errors array is defined, even if empty
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
};

/* ****************************************
 *  Update account information
 * *************************************** */
const updateAccount = async (req, res) => {
  const userId = req.session.user.account_id;
  const { account_firstname, account_lastname, account_email } = req.body;

  try {
    await accountModel.updateAccount(userId, account_firstname, account_lastname, account_email);

    req.flash('notice', 'Account information updated successfully.');
    res.redirect('/account/update');
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(500).send('Server error');
  }
};

/* ****************************************
 *  Change password
 * *************************************** */
const changePassword = async (req, res) => {
  const userId = req.session.user.account_id;
  const { account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    await accountModel.updatePassword(userId, hashedPassword);

    req.flash('notice', 'Password changed successfully.');
    res.redirect('/account/');
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).send('Server error');
  }
};


// Logout function
const logout = async (req, res) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Logout failed. Please try again.");
      } else {
        // Clear the JWT cookie if present
        res.clearCookie("jwt");
        // Redirect to the home view or login view
        res.redirect("/"); // Puedes cambiar esto a la ruta que desees después del logout
      }
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Logout failed. Please try again.");
  }
};


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  showUpdateAccountForm,
  updateAccount,
  changePassword,
  logout
};
