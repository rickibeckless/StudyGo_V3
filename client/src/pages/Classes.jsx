import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import GeneralClassesPage from "../components/classesComponents/GeneralClassesPage.jsx";
import SubjectPage from "../components/classesComponents/SubjectPage.jsx";
import "../styles/classes.css";

export default function Classes() {
    const location = useLocation();
    const { subjectId: paramSubjectId } = useParams();
    const [subjectId, setSubjectId] = useState(paramSubjectId || null);
    const [goToClassesPage, setGoToClassesPage] = useState(false);

    useEffect(() => {
        const currentPath = location.pathname;
        const pathSegments = currentPath.split('/').filter(Boolean);

        if (currentPath === '/classes') {
            setGoToClassesPage(true);
        } else if (pathSegments.length === 1) {
            const subject = pathSegments[0];
            setSubjectId(subject);
        };
    }, [location]);

    const applyFilters = () => {
        const filter = document.getElementById('subjects-filter').value;
        const order = document.getElementById('subjects-filter-order').value;
        const showEmpty = document.getElementById('subjects-filter-show-empty').checked;

        const classesList = document.getElementById('subject-list');
        const classes = classesList.querySelectorAll('.subject-holder');

        const classesArray = Array.from(classes);

        classesArray.sort((a, b) => {
            const aText = a.querySelector('.subject').textContent;
            const bText = b.querySelector('.subject').textContent;

            if (filter === 'alphabetical') {
                return order === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
            } else if (filter === 'by-units') {
                const aUnits = a.querySelector('.subject-class-count-number').textContent;
                const bUnits = b.querySelector('.subject-class-count-number').textContent;

                return order === 'asc' ? aUnits - bUnits : bUnits - aUnits;
            } else if (filter === 'date-added') {
                const aDate = new Date(a.querySelector('.subject').dataset.dateAdded);
                const bDate = new Date(b.querySelector('.subject').dataset.dateAdded);

                return order === 'asc' ? aDate - bDate : bDate - aDate;
            } else if (filter === 'date-updated') {
                const aDate = new Date(a.querySelector('.subject').dataset.dateUpdated);
                const bDate = new Date(b.querySelector('.subject').dataset.dateUpdated);

                return order === 'asc' ? aDate - bDate : bDate - aDate;
            }
        });

        classesList.innerHTML = '';
        classesArray.forEach(cls => classesList.appendChild(cls));

        if (!showEmpty) {
            classesArray.forEach(cls => {
                const count = cls.querySelector('.subject-class-count-number').textContent;
                if (count === '0') {
                    cls.style.display = 'none';
                } else {
                    cls.style.display = 'flex';
                }
            });
        }

        document.getElementById('subjects-filter-form').reset();

        return classesArray;
    };

    const handleSearch = () => {
        const searchInput = document.getElementById('subjects-search').value.toLowerCase();
        const classesList = document.getElementById('subject-list');
        const classes = classesList.querySelectorAll('.subject-holder');

        classes.forEach(cls => {
            const clsName = cls.querySelector('.subject').textContent.toLowerCase();
            if (!clsName.includes(searchInput)) {
                cls.style.display = 'none';
            } else {
                cls.style.display = 'flex';
            };
        });
    };

    const clearSearchAndFilters = () => {
        document.getElementById('subjects-search').value = '';

        document.getElementById('subjects-filter-form').reset();

        const classesList = document.getElementById('subject-list');
        const classes = classesList.querySelectorAll('.subject-holder');
        classes.forEach(cls => {
            cls.style.display = 'flex';
        });
    };

    return (
        <main id="subjects-body" className="container">
            <aside id="subjects-filter-holder">
                <p id="subject-clear-btn" onClick={() => { clearSearchAndFilters() }}>clear filters</p>
                <form id="subjects-search-form">
                    <label htmlFor="subjects-search">Search Classes</label>
                    <input type="text" id="subjects-search" name="subjects-search" placeholder="Search for a class..." />
                    <button type="button" id="subject-search-btn" onClick={() => {handleSearch()}}>Search</button>
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

                    <button type="button" id="subject-filter-btn" onClick={() => {applyFilters()}}>Filter</button>
                </form>
            </aside>

            <section id="subjects-section">
                {subjectId ? <SubjectPage subjectId={subjectId} /> : <GeneralClassesPage />}
            </section>
        </main>
    );
};