import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UpdateProduct = () => {
  const { id } = useParams(); // Get the product ID from the route
  const navigate = useNavigate(); // For navigation after update

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    company: "",
  });
  const [image, setImage] = useState(null); // To handle file upload
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState("");

  // Fetch product details when component mounts
  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
      const response = await fetch(`http://localhost:5100/product/${id}`,{
        headers:{
          authorization :`bearer ${JSON.parse(localStorage.getItem('token'))}`
        }
      });
      const data = await response.json();
      console.log(data);
        setFormData({
          name: data.product.name,
          price: data.product.price,
          category: data.product.category,
          company: data.product.company,
        });
        setImage(data.product.image);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle product update
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("company", formData.company);
    if (image instanceof File) {
      formDataToSend.append("image", image); // Add image only if updated
    }

    try {
      const response = await fetch(`http://localhost:5100/update-product/${id}`, {
        method: "PUT",
        headers:{
            authorization :`bearer ${JSON.parse(localStorage.getItem('token'))}`
          },
        body: formDataToSend,
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        setMessage(result.message);
        setTimeout(() => navigate("/"), 2000); // Redirect to products list after success
      } else {
        setMessage(result.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setMessage("Error updating product");
    }
  }; 

  return (
    <div className="container">
      <h2 className="title">Update Product</h2>
      <form className="form" onSubmit={handleUpdateProduct}>
        <div className="inputGroup">
          <label htmlFor="name">Product Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="company">Company Name:</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="inputGroup">
          <label htmlFor="image">Upload Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>

        <button className="button" type="submit">
          Update Product
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default UpdateProduct;

