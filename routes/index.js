var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const {validateEmail,validatePassword} = require('./customValidators')
const bcrypt = require('bcrypt');

// Define the isAuthenticated middleware
const isAuthenticated = (allowedDomain) => (req, res, next) => {
  // Check if the user session exists and contains userEmail
  if (req.session && req.session.userEmail) {
    const userEmail = req.session.userEmail;


    // Log userEmail to check its value
    console.log('User email:', userEmail);


    // Check if allowedDomain is provided and if userEmail ends with it
    if (allowedDomain && userEmail.endsWith(allowedDomain)) {
      // User is authenticated and has the allowed email domain or no domain is specified, proceed to the next middleware
      return next();
    } else {
      // User doesn't have the allowed email domain, redirect to an unauthorized page
      return res.status(403).send('unauthorized'); // 403 Forbidden status
    }
  }

  // Log if userEmail is not set
  console.log('User email not found in session:', req.session);

  // User is not authenticated, redirect to the login page
  res.redirect('/login');
};

router.get('/', isAuthenticated, function(req, res) {
  const email = req.session.userEmail || null;
  res.render("hello-world", { email: email });
});

router.get('/count/:num', isAuthenticated('@gmail.com'),(req, res) => {
  const count = req.params.num;
  res.render('count',{count:count})
});
router.get('/login', (req, res) => {
  res.render('login',{ errors: [],message:null })
});
//route for handling form submission with validations
router.post('/login', [
  // Add custom validation that required/imported
    validateEmail,
    validatePassword
  ], function (req, res) {
    // Access the validation errors from the request object
    const errors = req.validationErrors || [];
 
    // Validate the request
    const validationResultErrors = validationResult(req);
    if (!validationResultErrors.isEmpty()) {
      // Merge the errors from validation result into the existing errors
      errors.push(...validationResultErrors.array());
    }
 
    if (errors.length > 0) {
      // There are validation errors, render the form with errors
      res.render('login', { errors, message:null });
    } else {
      const { email, password } = req.body;
      let foundUser; // Declare foundUser here
 
      User.findOne({ email })
      .then(user => {
        console.log(user);
        if (!user) {
          return res.render('login', { message: 'Incorrect Email Address.',errors: [] });
        }
        foundUser = user; // Assign user to foundUser
        return bcrypt.compare(password, user.password);
      })
      .then(isPasswordValid => {
        if (!isPasswordValid) {
          return res.render('login', { message: 'Incorrect password.',errors: [] });
        }
 
        // Set user's ID and email in the session
        req.session.userId = foundUser._id;
        req.session.userEmail = foundUser.email;
        res.render('hello-world',{email: foundUser.email});
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Internal Server Error');
      });
    }
  });
// for getting data from db
router.get('/getUser', function (req,res) {
     User.find().then(data => {
         res.render('index', {data:data})
  }).catch(error => {
      console.error(error);
      
    });
  })
//for about-us page
  router.get('/about-us', function (req,res) {
    res.render('about-us')
  })

  router.get('/page/:title', (req, res) => {
    const title = req.params.title;
   res.render('page',{str:title})
});


//  router.get('/count/:num', (req, res) => {
//   const count = req.params.num;
//   res.render('count',{count:count})
// });

// router.get('/login', (req, res) => {
//   res.redirect('/')
// });
router.get('/signup', (req, res)=>{
  res.render('signup',{message:null,error:null})
});
router.post('/signup', (req, res)=>{
  const { email, password, confirmPassword } = req.body;
  const user = new User({ email,password })
  const validationError = user.validateSync();
 
  // Check if the password and confirm password match
  if (password !== confirmPassword) {
    return res.render('signup',{message:'Password and Confirm Password do not match',error:null});
  }


   // Check all fields are not empty
  if (validationError){


    return res.render('signup',{message:null,error:validationError.errors});


  }
  // Check if the username is already taken
  User.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        return res.render('signup',{message:'Email already taken',error:null});
      }else{
          //hash the password using bcrypt
         return bcrypt.hash(password,10)
      }
    }).then(hashedPassword => {


     // Create a signup user in MongoDB
      const signupUser = new User({ email, password:hashedPassword });
     return signupUser.save();


    }).then(() => {
      // Redirect to a success page or login page
      res.redirect('/login');
    }).catch(error => {
      console.error(error);
   
    });


});
//route for logout


router.get('/logout' ,(req,res)=>{
  req.session.destroy((err) =>{
    if (err){
      console.log(err);
      res.send('Error')
    }else{
      res.redirect('/login')
    }
  });
  });

module.exports = router;