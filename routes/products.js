var express = require('express');
var router = express.Router();
const Product = require('../models/productsModel')
router.get('/create_product', (req,res)=>{
    res.render('./product/create', {error: null})
});
router.post('/create_product', (req, res) => {
    const { name, description, price } = req.body;
    const product = new Product({
        name,
        description,
        price
    });
    const validationError = product.validateSync();
    if (validationError) {
        res.render('./product/create', { error: validationError.errors});
    } else {
        product.save().then(() => {
                res.redirect('/');
            }).catch((error) => {
                console.error(error);
                
            });
   }
});
router.get('/retrieve_product', (req, res) => {

    Product.find().then(data => {
      res.render('./product/retrieve',{data:data})
  
    }).catch(error => {
  
      console.error(error);
      
    });
  
  });
  router.get('/update_product/:id',(req,res) =>{
    const productId = req.params.id;
    Product.findById(productId).lean().then(product =>{
        res.render('./product/update',{product:product,error:null})
    }).catch(error => {
        console.error(error);
    });


  });
  router.post('/update_product/:id', (req, res) => {
    const productId = req.params.id;
    const { name, description, price } = req.body;
    const product = new Product({ name, description, price })
    const validationError = product.validateSync();
    if (validationError) {
        // If there are validation errors, re-render the form with error messages
    res.render('./product/update', {product:product, error: validationError.errors});


    } else {
    Product.findByIdAndUpdate(
        productId,
        { name, description, price }
      )
        .then(() => {
          res.redirect('/products/retrieve_product'); // Redirect to the product list after updating
        })
        .catch(error => {
          console.error(error);
        });
    }
});
router.get('/delete_product/:id',(req , res) =>{
    const productId = req.params.id;
   Product.findById(productId).then(product =>{
        res.render('./product/delete',{product:product})
    }).catch(error => {
        console.error(error);
      });
});
router.post('/delete_product/:id',(req, res) =>{
    const productId = req.params.id;
    Product.findByIdAndDelete(productId)
        .then(() => {
          res.redirect('/products/retrieve_product'); // Redirect to the product list after deleting
        })
        .catch(error => {
          console.error(error);
        });
});
router.get('/listing_page', (req, res) => {
    const { page = 1, limit = 3 } = req.query; // Set default page and limit
 
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
 
    Product.paginate({}, options)
      .then(result => {
        res.render('product/list', { products: result.docs, pagination: result });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send('Internal Server Error');
      });
  });
    // Route to handle page visit
router.get('/pagevisit', (req, res) => {
    // Get the current count from the session, or set it to 0 if it doesn't exist
    const count = req.session.page_count || 0;
   
    // Increment the count
    req.session.page_count = count + 1;
 
    // Render the template with the count variable
    res.render('product/page_view', { count: req.session.page_count });
  });
module.exports = router;