import {useEffect, useState} from "react";
import { useLocation } from "react-router-dom";

export default function UnitsHeader({ subject, cls, unit }) {
    const location = useLocation();

    return (
        <header id="units-main-header">
            <h1 id="units-main-logo"><a href="/">StudyGo</a></h1>
            <nav id="units-main-navbar">
                <ul id="units-main-navbar-links">
                    <li id="units-subject-link">
                        <a href={`/${subject?.unique_string_id}`}>{subject?.name}</a>
                    </li>
                    <li>/</li>
                    <li id="units-class-link">
                        <a href={`/${subject?.unique_string_id}/${cls?.unique_string_id}`}>{cls?.name}</a>
                    </li>
                    <li>/</li>
                    <li id="units-event-link">
                        <h3>{unit.name}</h3>
                    </li>
                </ul>
            </nav>
        </header>
    );
};