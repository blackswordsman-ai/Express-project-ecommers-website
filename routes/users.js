var express = require('express');
var router = express.Router();
const User = require('../models/userModel');


router.get('/createUser', (req, res) =>{
      const newUser = new User({
        email:'daniel66@gmail.com',
        password:'11223344',
      });

      newUser.save()
      .then(() => {
        res.send('User created');
      })
      .catch((error) => {
        console.error(error);
        
      });
});

module.exports = router;