const connectToDatabase = require('./config');
connectToDatabase();
const express = require('express');
const multer = require('multer')
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart')
const cors = require('cors');
const app = express();
const Jwt = require('jsonwebtoken');
const jwtkey = 'e-commerce';

app.use(express.json());
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(), // Store the image in memory
});

const verifyToken = (req,resp,next) => {
  let token = req.headers['authorization']
  if(token){
    token = token.split(' ')[1];
    Jwt.verify(token,jwtkey,(err,valid)=>{
      if(err){
        resp.status(401).send({result: "please provide a valid token"})
      } else{
        next();
      }
    })
  }else{
    resp.status(403).send({result : "please add token with header"});
  }
}


app.post("/signup",async(req,resp)=>{
    let data = new User(req.body);
    let result = await data.save();
    result = result.toObject();
    delete result.password
    Jwt.sign({result},jwtkey,(err,token)=>{
      resp.send({ message: "user created successfully", result, auth:token });
    })
});

//Login api
app.post("/login", async (req, resp) => {
    if (!req.body.email || !req.body.password) {
      return resp.status(400).send({ result: "Email and password are required" });
    }
    try {
      const user = await User.findOne(req.body).select("-password");
      if (user) {
        Jwt.sign({user},jwtkey,(err,token)=>{
          resp.send({ result: "Login successful", user, auth:token });
        })
        
      } else {
        resp.status(404).send({ result: "Invalid email or password" });
      }
    } catch (error) {
      resp.status(500).send({ result: "Internal server error", error: error.message });
    }
  });

  // Create product api
  app.post("/add-product", verifyToken, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: "Image is required" });
      }
      const data = new Product({
          ...req.body, // Spread req.body to include all form data
          image: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          },
        });
      let result = await data.save();
      res.send({ message: "Product added successfully!", result });
    } catch (error) {
      res.status(500).send({ message: "Error adding product",error });
  }
});

// Get Product api
app.get('/products/:userId', verifyToken, async(req,resp)=>{
  let products = await Product.find({userId : req.params.userId});
   // Transform the products to the desired structure
   const transformedProducts = products.map((product) => ({
    _id: product._id,
    name: product.name,
    price: product.price,
    category: product.category,
    company: product.company,
    image: {
      data: product.image?.data
      ? product.image.data.toString("base64")
      : null, // Handle missing or undefined data
    contentType: product.image?.contentType || null, // Handle missing or undefined contentType
    },
  }));
  if(products.length > 0){
    resp.send({message:'Product fetched successfully', products : transformedProducts});
  } else{
    resp.send({message:"No result found"});
  }
});

//Delete Product api
app.delete('/delete-product/:id',verifyToken, async(req,resp)=>{
  let result = await Product.deleteOne({_id : req.params.id});
  resp.send({message:'Product deleted successfully',result})
});

//Show product current deatils click on edit icon api
app.get('/product/:id',verifyToken, async(req,resp)=>{
  let product = await Product.findOne({_id:req.params.id});
  if(product){
    resp.send({message:'Product fetched successfully', 
      product : {
      _id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        company: product.company,
        image: {
          data: product.image?.data
          ? product.image.data.toString("base64")
          : null, // Handle missing or undefined data
        contentType: product.image?.contentType || null, // Handle missing or undefined contentType
        }
      }
    })
  }else{
    resp.status(404).send({message:"Not found product"})
  }
})

// Update Product api
app.put("/update-product/:id", verifyToken, upload.single("image"), async (req, resp) => {
  try {

    // Build the update object
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }
    const updatedProduct = await Product.findByIdAndUpdate({_id:req.params.id},
      { $set: updateData },
      { new: true }
    );

    if (updatedProduct) {
      resp.status(200).send({
        message: "Product updated successfully",
        product: {
          _id: updatedProduct._id,
          name: updatedProduct.name,
          price: updatedProduct.price,
          category: updatedProduct.category,
          company: updatedProduct.company,
          image: {
            contentType: updatedProduct.image?.contentType,
            data: updatedProduct.image?.data
              ? updatedProduct.image.data.toString("base64")
              : null,
          },
        },
      });
    } else {
      resp.status(404).send({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    resp.status(500).send({ message: "Error updating product", error });
  }
});

//product search api
app.get('/search-product/:key',verifyToken, async(req,resp)=>{
  const { userId } = req.query; 
const isNumeric = !isNaN(req.params.key); // Check if the search key is numeric

let query = { userId,
  "$or": [
    { 'name': { $regex: req.params.key, $options: 'i' } }, //$options: 'i' use for case insensitive search
    { 'category': { $regex: req.params.key, $options: 'i' } },
    { 'company': { $regex: req.params.key, $options: 'i' } }
  ]
};

if (isNumeric) {
  query["$or"].push({ 'price': Number(req.params.key) }); // Match exact numeric price
}

let result = await Product.find(query);

const formattedResult = result.map(product => ({
  _id: product._id,
  name: product.name,
  price: product.price,
  category: product.category,
  company: product.company,
  image: product.image
    ? {
        contentType: product.image.contentType,
        data: product.image.data.toString('base64'),
      }
    : null,
}));
if(result.length > 0) {
  resp.send({ message: 'Search product successfully', result : formattedResult});
} else {
  resp.status(404).send({ message: 'No product found'});
}

})


// Add to cart api
app.post("/add-to-cart", verifyToken, async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Validate request
    if (!userId || !productId || !quantity) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    // Check if the cart exists for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({ userId, products: [] });
    }

    // Check if the product is already in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId === productId
    );

    if (productIndex > -1) {
      // If product exists, update its quantity
      cart.products[productIndex].quantity += quantity;
    } else {
      // If product does not exist, add it to the cart
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      cart.products.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    // Save the cart
    await cart.save();

    res.status(200).send({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send({ message: "Server error", error });
  }
});


// Get User Cart API
app.get("/cart/:userId", verifyToken, async (req, resp) => {

  try {
    // Find the cart for the given userId
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      return resp.status(404).send({ message: "Cart is empty for this user" });
    }

    // Transform the cart data to include product details
    const cartData = cart.products.map((product) => ({
      productId: product.productId,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    }));

    resp.send({
      message: "Cart fetched successfully",
      cart: {
        userId: cart.userId,
        products: cartData,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    resp.status(500).send({ message: "Server error", error });
  }
});

// Update product quantity in cart
app.put("/cart/update-quantity", verifyToken, async (req, resp) => {
  const { userId, productId, change } = req.body;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return resp.status(404).send({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex === -1) {
      return resp.status(404).send({ message: "Product not found in cart" });
    }

    // Update the product quantity
    cart.products[productIndex].quantity += change;

    // If quantity becomes 0 or less, remove the product from the cart
    if (cart.products[productIndex].quantity <= 0) {
      cart.products.splice(productIndex, 1);
    }

    // Save the updated cart
    await cart.save();

    resp.send({
      message: "Cart updated successfully",
      cart: {
        userId: cart.userId,
        products: cart.products,
      },
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    resp.status(500).send({ message: "Server error", error });
  }
});

  
app.listen(5100);