import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageTitle from "./PageTitle.jsx";

export default function Header() {
    return (
        <header id="main-header">
            <h1 id="main-logo"><a href="/">StudyGo</a></h1>
            <nav id="main-navbar">
                <ul>
                    <li><a href="/subjects">All Subjects</a></li>
                    <li><a href="/classes">All Classes</a></li>
                </ul>
            </nav>
        </header>
    )
}