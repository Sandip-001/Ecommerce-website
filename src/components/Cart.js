import React, { useEffect } from "react";
import "./Cart.css"; // Import the CSS file

const Cart = ({ cart, setCart }) => {
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const increaseQuantity = (product) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (product) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0) //Remove the product
    );
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>
      {cart.length > 0 ? (
        <div>
          {cart.map((item) => (
            <div className="cart-item" key={item._id}>
              <div className="cart-image-container">
                <img
                  src={`data:${item.image.contentType};base64,${item.image.data}`}
                  alt={item.name}
                  className="cart-product-image"
                />
              </div>
              <div className="cart-details">
                <h4 className="cart-product-name">{item.name}</h4>
                <p className="cart-product-price">₹{item.price * item.quantity}</p>
                <div className="cart-quantity-controls">
                  <button
                    className="quantity-button decrease"
                    onClick={() => decreaseQuantity(item)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    className="quantity-button increase"
                    onClick={() => increaseQuantity(item)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <h3>Total: ₹{totalPrice}</h3>
          </div>
        </div>
      ) : (
        <p className="empty-cart-message">Your cart is empty</p>
      )}
    </div>
  );
};

export default Cart;


