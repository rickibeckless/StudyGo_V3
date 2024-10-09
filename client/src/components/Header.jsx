import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PageTitle from "./PageTitle.jsx";

export default function Header() {
    const location = useLocation();

    return (
        <header id="main-header">
            <h1 id="main-logo"><a href="/">StudyGo</a></h1>
            <nav id="main-navbar">
                <ul>
                    {location.pathname !== "/subjects" && <li><a href="/subjects">All Subjects</a></li>}
                    {location.pathname !== "/classes" && <li><a href="/classes">All Classes</a></li>}
                </ul>
            </nav>
        </header>
    )
}