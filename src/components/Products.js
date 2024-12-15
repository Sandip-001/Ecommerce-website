import React, { useEffect, useState } from "react";
import "./Products.css";
import { Link } from "react-router-dom";
import Cart from "./Cart";

const Products = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const auth = localStorage.getItem("user");
  const userId = JSON.parse(auth).user._id;
  console.log(userId);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5100/products/${userId}`,{
        headers:{
          authorization :`bearer ${JSON.parse(localStorage.getItem('token'))}`
        }
      }
      );
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const deleteProduct = async(id) => {
    let respone = await fetch(`http://localhost:5100/delete-product/${id}`,{
      method : "Delete",
      headers:{
          authorization :`bearer ${JSON.parse(localStorage.getItem('token'))}`
        }
    });
    let data = await respone.json();
    console.log(data);
    if(data){
      alert(data.message);
      fetchProducts();
    }
  }

  // Search api integration 
  const searchHandle = async(e) =>{
    let key = e.target.value;
    if (!key) {
      fetchProducts(); // Reset to all products if the search input is cleared
      return;
    }
    let response = await fetch(`http://localhost:5100/search-product/${key}?userId=${userId}`,{
      headers:{
        authorization :`bearer ${JSON.parse(localStorage.getItem('token'))}`
      }
    })
    let data = await response.json();
    if(data){
      setProducts(data.result)
    }else {
      setProducts([]); // Fallback to empty array
    }
    }

    // Add product to the cart
  const addToCart = (product) => {
    const isProductInCart = cart.some((item) => item._id === product._id);

    if (!isProductInCart) {
      setCart((prevCart) => [...prevCart, { ...product, quantity: 1 }]);
      alert("product added successfully")
    }
  };

  // Check if a product is already in the cart
  const isProductInCart = (productId) => {
    return cart.some((item) => item._id === productId);
  };


  return (
    <>
    <div className="search-container">
        <input
          className="search-product"
          type="search"
          placeholder="Search products..."
          onChange={searchHandle}
        />
    </div>
    <div className="product-container">
      {products && products.length > 0 ?(
        products.map((product) => (
          <div className="product-card" key={product._id}>
            <img
              src={`data:${product.image.contentType};base64,${product.image.data}`}
              alt={product.name}
              className="product-image"
            />
            <div className="product-details">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">Price: ₹{product.price}</p>
              <p className="product-category">Category: {product.category}</p>
              <p className="product-company">Company: {product.company}</p>
              <div className="icon">
                <p className="delete-edit" onClick={()=>deleteProduct(product._id)} ><i class="fa-solid fa-trash-can"></i></p>
                <p className="delete-edit"><Link to={`/updateproduct/${product._id}`}><i class="fa-regular fa-pen-to-square"></i></Link></p>
              </div>
              <button
                  onClick={() => addToCart(product)}
                  className={`add-to-cart-btn ${
                    isProductInCart(product._id) ? "disabled" : ""
                  }`}
                  disabled={isProductInCart(product._id)}
                >
                  {isProductInCart(product._id)
                    ? "Product Added in Cart"
                    : "Add to Cart"}
                </button>
            </div>
          </div>
        ))
      ) : (
        <p className="no-products">No products found</p>
      )}
    </div>
    </>
  );
};

export default Products;

