import React, {useState, useEffect} from 'react'
import "./Login.css"
import { useNavigate } from 'react-router-dom';

const Login = () => {
    useEffect(()=>{
        const auth = localStorage.getItem('user');
        if(auth){
          navigate('/')
        }
    })
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = credentials;

    // Api Integration 
    const response = await fetch("http://localhost:5100/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password })
    });
    let data = await response.json();
    console.log(data);

    if(data.user)
    {
        localStorage.setItem('user',JSON.stringify(data));
        localStorage.setItem('token',JSON.stringify(data.auth));
        alert(data.result);
        navigate('/');
          
    } else{
        setError(data.result);
    }
    
  }; 

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          name="email"
          value={credentials.email}
          placeholder="Email"
          onChange={onChange}
          required
        />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={credentials.password}
          placeholder="Password"
          onChange={onChange}
          required
        />
        <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login
