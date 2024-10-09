import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageTitle from "../components/PageTitle.jsx";

export default function Subjects() {

    return (
        <main id="main-body" className="container">
            <aside id="subjects-filter-holder">
                <form id="subjects-search-form">
                    <label htmlFor="subjects-search">Search Subjects</label>
                    <input type="text" id="subjects-search" name="subjects-search" placeholder="Search for a subject..." />
                    <button type="button" id="subject-search-btn">Search</button>
                </form>

                <form id="subjects-filter-form">
                    <label htmlFor="subjects-filter">Filter Subjects</label>
                    <select id="subjects-filter" name="subjects-filter">
                        <option value="alphabetical">Alphabetical</option>
                        <option value="by-classes">Most Classes</option>
                        <option value="date-added">Date Added</option>
                        <option value="date-updated">Date Updated</option>
                    </select>

                    <label htmlFor="subjects-filter-order">Order</label>
                    <select id="subjects-filter-order" name="subjects-filter-order">
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>

                    <div className="checkbox-container">
                        <label htmlFor="subjects-filter-show-empty" className="checkbox-label">Show Subjects With No Classes</label>
                        <input type="checkbox" id="subjects-filter-show-empty" name="subjects-filter-show-empty" value="true" />
                        <label htmlFor="subjects-filter-show-empty" className="custom-checkbox"></label>
                    </div>

                    <button type="button" id="subject-filter-btn">Filter</button>
                </form>
            </aside>

            <div className="hamburger">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>

            <section id="subjects-section">
                <h2>All Subjects</h2>
                <ul id="subject-list">
                    <li id="default-li">Nothing yet! <a href="#">Add some subjects</a> to get started!</li>
                </ul>
            </section>
        </main>
    )
}