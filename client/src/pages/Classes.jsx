import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageTitle from "../components/PageTitle.jsx";

export default function Classes() {

    return (
        <main id="main-body" className="container">
            <aside id="subjects-filter-holder">
                <form id="subjects-search-form">
                    <label htmlFor="subjects-search">Search Classes</label>
                    <input type="text" id="subjects-search" name="subjects-search" placeholder="Search for a class..." />
                    <button type="button" id="subject-search-btn">Search</button>
                </form>

                <form id="subjects-filter-form">
                    <label htmlFor="subjects-filter">Filter Classes</label>
                    <select id="subjects-filter" name="subjects-filter">
                        <option value="alphabetical">Alphabetical</option>
                        <option value="by-units">Most Units</option>
                        <option value="date-added">Date Added</option>
                        <option value="date-updated">Date Updated</option>
                    </select>

                    <label htmlFor="subjects-filter-order">Order</label>
                    <select id="subjects-filter-order" name="subjects-filter-order">
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>

                    <div className="checkbox-container">
                        <label htmlFor="subjects-filter-show-empty" className="checkbox-label">Show Classes With No Units</label>
                        <input type="checkbox" id="subjects-filter-show-empty" name="subjects-filter-show-empty" value="true" />
                        <label htmlFor="subjects-filter-show-empty" className="custom-checkbox"></label>
                    </div>

                    <button type="button" id="subject-filter-btn">Filter</button>
                </form>
            </aside>

            <section id="subjects-section"></section>
        </main>
    )
}