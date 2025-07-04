const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const accountModel = require('../models/account-model');
const jwt = require('jsonwebtoken');



const accountController = {};

// ===== Show Signup Form =====
accountController.showSignupForm = (req, res) => {
  res.render('partials/signupBody', { 
    title: 'Sign Up', 
    errors: [], 
    data: {}, 
    success: null
  });
};


// ===== Handle Signup Form Submission =====
accountController.handleSignup = [
  // ===== Validation rules =====
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),

  async (req, res) => {
    const errors = validationResult(req);
    const data = req.body;

    // Check for validation errors
    if (!errors.isEmpty()) {
      return res.render('partials/signupBody', {
        title: 'Sign Up',
        errors: errors.array(),
        data,
        success: null
      });
    }

    try {
      // Check for existing email
      const existingAccount = await accountModel.getAccountByEmail(data.email);
      if (existingAccount) {
        return res.render('partials/signupBody', {
          title: 'Sign Up',
          errors: [{ msg: 'An account with that email already exists.' }],
          data,
          success: null
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Optional: Allow setting account_type for future back-end use only
      let accountType = "Client";
      /*
      // Allow account type to be set manually for testing (comment out later for production)
      if (data.account_type && ["Client", "Employee", "Admin"].includes(data.account_type)) {
        accountType = data.account_type;
      }
      */

      // Create account
      await accountModel.createAccount(
        data.firstName,
        data.lastName,
        data.email,
        hashedPassword,
        accountType
      );

      // Success message
      res.render('partials/signupBody', {
        title: 'Sign Up',
        errors: [],
        data: {},
        success: 'Account successfully created! You can now sign in.'
      });

    } catch (error) {
    console.error('Signup error:', error);
    res.status(500).render('partials/signupBody', {
      title: 'Sign Up',
      errors: [{ msg: 'A server error occurred. Please try again.' }],
      data,
      success: null
    });
  }

  }
];

/*=== Handle Login ===*/

accountController.showLoginForm = (req, res) => {
  res.render('partials/logBody', {
    title: 'Sign In',
    errors: [],
    data: {},
    success: null
  });
};

accountController.handleLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const account = await accountModel.getAccountByCredentials(email, password);
    
    if (account) {
      // Store user in session
      req.session.account = {
        id: account.account_id,
        firstName: account.account_firstname,
        lastName: account.account_lastname,
        email: account.account_email
      };
      
      // ===== Generate JWT Token =====
const token = jwt.sign(
  {
    id: account.account_id,
    firstName: account.account_firstname,
    lastName: account.account_lastname,
    email: account.account_email,
    type: account.account_type
  },
  process.env.JWT_SECRET || 'default-secret-key',
  { expiresIn: '1h' }
);

// Set JWT as a cookie
res.cookie('jwt', token, {
  httpOnly: true,
  secure: false, // Set to true if using HTTPS in production
  maxAge: 3600000 // 1 hour
});

      
      return res.redirect('/');
    }
    
    // Failed login
    res.render('partials/logBody', {
      title: 'Sign In',
      errors: [{ msg: 'Invalid email or password. Please try again.' }],
      data: { email },
      success: null
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('partials/logBody', {
      title: 'Sign In',
      errors: [{ msg: 'An error occurred during login.' }],
      data: { email },
      success: null
    });
  }
};



accountController.handleLogout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// === Show Account Update Form ===
accountController.showAccountUpdateForm = async (req, res) => {
  if (!req.session.account) {
    return res.redirect('/login');
  }

  const account = req.session.account;

  res.render('account/accountUpdate', {
    title: 'Account Management',
    errors: [],
    success: null,
    data: {
      account_id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email
    }
  });
};

// === Handle Account Info Update ===
accountController.handleAccountUpdate = [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required.')
    .bail() // Stop running validations if this fails
    .custom(async (value, { req }) => {
      const account_id = req.body.account_id;
      const existingAccount = await accountModel.getAccountByEmail(value);
      if (existingAccount && existingAccount.account_id !== parseInt(account_id)) {
        throw new Error('Email address is already in use.');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    const { account_id, firstName, lastName, email } = req.body;
    const data = { account_id, firstName, lastName, email };

    if (!errors.isEmpty()) {
      return res.render('account/accountUpdate', {
        title: 'Account Management',
        errors: errors.array(),
        success: null,
        data,
      });
    }

    try {
      await accountModel.updateAccountInfo(account_id, firstName, lastName, email);

      // Update session
      req.session.account.firstName = firstName;
      req.session.account.lastName = lastName;
      req.session.account.email = email;

      res.render('account/accountUpdate', {
        title: 'Account Management',
        errors: [],
        success: 'Account information updated successfully!',
        data,
      });
    } catch (error) {
      console.error('Account update error:', error);
      res.status(500).render('account/accountUpdate', {
        title: 'Account Management',
        errors: [{ msg: 'Server error during account update.' }],
        success: null,
        data,
      });
    }
  },
];

// === Handle Password Change ===
accountController.handlePasswordChange = [
  body('newPassword').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),

  async (req, res) => {
    const errors = validationResult(req);
    const { account_id, newPassword } = req.body;

    const data = {
      account_id,
      firstName: req.session.account.firstName,
      lastName: req.session.account.lastName,
      email: req.session.account.email
    };

    if (!errors.isEmpty()) {
      return res.render('account/accountUpdate', {
        title: 'Account Management',
        errors: errors.array(),
        success: null,
        data
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await accountModel.updateAccountPassword(account_id, hashedPassword);

      res.render('account/accountUpdate', {
        title: 'Account Management',
        errors: [],
        success: 'Password updated successfully!',
        data
      });

    } catch (error) {
      console.error('Password update error:', error);
      res.status(500).render('account/accountUpdate', {
        title: 'Account Management',
        errors: [{ msg: 'Server error during password change.' }],
        success: null,
        data
      });
    }
  }
];

//Debug
accountController.showAccountUpdateForm = async (req, res) => {
  if (!req.session.account) {
    console.log('User not logged in, redirecting to login');
    return res.redirect('/login');
  }

  const account = req.session.account;
  console.log('Rendering account update form for:', account);

  res.render('account/accountUpdate', {
    title: 'Account Management',
    errors: [],
    success: null,
    data: {
      account_id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email
    }
  });
};


module.exports = accountController;
