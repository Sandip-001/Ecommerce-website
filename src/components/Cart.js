import React, { useEffect, useState } from "react";
import "./Cart.css";

const Cart = ({setCartQuantity}) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const auth = localStorage.getItem("user");
  const userId = JSON.parse(auth).user._id;

  useEffect(() => {
    fetchCartProducts();
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Fetch cart details
  const fetchCartProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5100/cart/${userId}`, {
        headers: {
          contentType : "application-json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });
      const data = await response.json();
      console.log(data);
      if (data) {
        setCart(data.cart.products);
        updateCartQuantity(data.cart.products)
      }
    } catch (error) {
      console.error("Error fetching cart products:", error);
    }
  };

  // Fetch all products to get their images
  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5100/products/${userId}`, {
        headers: {
          contentType : "application-json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);

       
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Map product images using the product ID
  const getProductImage = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      return `data:${product.image.contentType};base64,${product.image.data}`;
    }
    return null;
  };

   // Update product quantity in the cart
   const updateProductQuantity = async (productId, change) => {
    try {
      const response = await fetch("http://localhost:5100/cart/update-quantity", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          userId,
          productId,
          change, // 1 for increase, -1 for decrease
        }),
      });

      const data = await response.json();
      if (data && data.cart) {
        setCart(data.cart.products); 
        updateCartQuantity(data.cart.products)
      }
    } catch (error) {
      console.error("Error updating product quantity:", error);
    }
  };

   // Calculate the total cart quantity
   const updateCartQuantity = (cartProducts) => {
    const totalQuantity = cartProducts.reduce(
      (total, item) => total + item.quantity,
      0
    );
    setCartQuantity(totalQuantity);
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      {cart && cart.length > 0 ? (
        <div>
          {cart.map((item) => (
            <div className="cart-item" key={item._id}>
              <div className="cart-image-container">
                  <img
                    src={getProductImage(item.productId)}
                    alt={item.name}
                    className="cart-product-image"
                  />
              </div>
              <div className="cart-details">
                <h4 className="cart-product-name">{item.name}</h4>
                <p className="cart-product-price">
                  ₹{item.price * item.quantity}
                </p>
                <div className="cart-quantity-controls">
                  <button className="quantity-button decrease" onClick={()=>updateProductQuantity(item.productId, -1)} >-</button>
                  <span className="quantity">{item.quantity}</span>
                  <button className="quantity-button increase" onClick={()=>updateProductQuantity(item.productId, 1)}>+</button>
                </div>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <h3>Total: ₹{calculateTotal()}</h3>
          </div>
        </div>
      ) : (
        <p className="empty-cart-message">Your cart is empty</p>
      )}
    </div>
  );
};

export default Cart;
