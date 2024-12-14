import React, { useEffect, useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {

  const navigate = useNavigate();
  useEffect(()=>{
      const auth = localStorage.getItem('user');
      if(auth){
        navigate('/')
      }
  })

  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = credentials;

    // Simulate simple validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    } else {
      setError("");
      alert("Signup successful!");
    }

    // Api Integration 
    const response = await fetch("http://localhost:5100/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password })
    });
    let data = await response.json();
    console.log(data);

    localStorage.setItem('user',JSON.stringify(data));
    localStorage.setItem('token',JSON.stringify(data.auth));
    navigate('/');
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(""); // Clear errors on input change
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          name="name"
          value={credentials.name}
          placeholder="Name"
          onChange={onChange}
          required
        />
        <input
          type="email"
          name="email"
          value={credentials.email}
          placeholder="Email"
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="password"
          value={credentials.password}
          placeholder="Password"
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          value={credentials.confirmPassword}
          placeholder="Confirm Password"
          onChange={onChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
