import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import PageTitle from "./components/PageTitle.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import './App.css';

function App() {

    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}

export default App;