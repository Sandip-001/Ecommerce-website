import React, {useRef, useState} from 'react'
import './AddProduct.css'

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    company: "",
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const auth = localStorage.getItem("user");
  const userId = JSON.parse(auth).user._id;
  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image file change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Api Integration 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const uploadData = new FormData();
    uploadData.append("name", formData.name);
    uploadData.append("price", formData.price);
    uploadData.append("category", formData.category);
    uploadData.append("company", formData.company);
    uploadData.append("image", image);
    uploadData.append("userId", userId); 

    const response = await fetch("http://localhost:5100/add-product", {
      method: "POST",
      headers:{
          authorization :`bearer ${JSON.parse(localStorage.getItem('token'))}`
        },
      body: uploadData
    });

    const result = await response.json();
    setMessage(result.message);

    setTimeout(() => {
      setMessage("");
      setFormData({
        name: "",
        price: "",
        category: "",
        company: "",
      });
    }, 3000);

    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset the file input
  }

  return (
    <div>
      <div className='container'>
      <h2 className='title'>Add Product</h2>
      <form className='form' onSubmit={handleSubmit}>
      {message && <div className="message">{message}</div>}
        <div className='inputGroup'>
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

        <div className='inputGroup'>
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

        <div className='inputGroup'>
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

        <div className='inputGroup'>
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

        <div className='inputGroup'>
          <label htmlFor="image">Upload Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            required
          />
        </div>

        <button className='button' type="submit">
          Add Product
        </button>
      </form>
    </div>
    </div>
  )
}

export default AddProduct
