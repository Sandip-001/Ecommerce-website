import './App.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from './components/Signup';
import PrivateComponent from './components/PrivateComponent';
import Login from './components/Login';
import AddProduct from './components/AddProduct';
import Products from './components/Products';
import UpdateProduct from './components/UpdateProduct';
import Profile from './components/Profile';
import Cart from './components/Cart';
import { useState } from 'react';

function App() {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });


  return (
    <>
    <Router>
      <Navbar/>
      <Routes>
        <Route element ={<PrivateComponent/>}>
         <Route exact path = "/" element={<Products cart={cart} setCart={setCart}/>}/>
         <Route exact path = "/addproduct" element={<AddProduct/>}/>
         <Route exact path = '/updateproduct/:id' element={<UpdateProduct/>}/>
         <Route exact path = "/profile" element={<Profile/>}/>
         <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        </Route>
        <Route exact path = "/login" element={<Login/>}/>
        <Route exact path = "/signup" element={<Signup/>}/>
      </Routes>
      <Footer/>
    </Router>
    
    </>
  );
}

export default App;
