import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function Classes() {
    const location = useLocation();
    const { subjectId: paramSubjectId } = useParams();
    const [subjectId, setSubjectId] = useState(paramSubjectId || null);

    useEffect(() => {
        const currentPath = location.pathname;
        const pathSegments = currentPath.split('/').filter(Boolean);

        if (currentPath === '/classes') {
            GeneralClassesPage();
        } else if (pathSegments.length === 1) {
            const subject = pathSegments[0];
            setSubjectId(subject);
        }
    }, [location]);

    return (
        <main id="subjects-body" className="container">
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

            <section id="subjects-section">
                {subjectId ? <SubjectPage subjectId={subjectId} /> : <GeneralClassesPage />}
            </section>
        </main>
    );
}

function GeneralClassesPage() {

    return (
        <>
            <PageTitle title="All Classes | StudyGo" />
            <h2>General Classes</h2>
        </>
    );
}

function SubjectPage({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [classes, setClasses] = useState(null);
    const [unitsByClass, setUnitsByClass] = useState({});

    useEffect(() => {
        const fetchSubject = async () => {
            console.log(`Fetching subject data for subjectId: ${subjectId}`);
            const subjectRes = await fetch(`/api/subjects/${subjectId}`);
            const subjectData = await subjectRes.json();
            setSubject(subjectData[0]);
        };

        const fetchClasses = async () => {
            console.log(`Fetching classes for subjectId: ${subjectId}`);
            const classesRes = await fetch(`/api/classes/${subjectId}`);
            const classesData = await classesRes.json();
            setClasses(classesData);

            classesData.forEach(cls => fetchUnits(cls.unique_string_id));
        };

        fetchSubject();
        fetchClasses();
    }, [subjectId]);

    const fetchUnits = async (classId) => {
        console.log(`Fetching units for classId: ${classId}`);
        const unitsRes = await fetch(`/api/classes/${subjectId}/${classId}`);
        const unitsData = await unitsRes.json();

        setUnitsByClass(prevState => ({
            ...prevState,
            [classId]: unitsData
        }));
    };

    if (!subject) {
        return <LoadingScreen />;
    }

    return (
        <>
            <PageTitle title={`${subject.name} Classes | StudyGo`} />
            <h2>All {subject.name} Classes</h2>
            <ul id="subject-list">
                {classes === null && <LoadingScreen />}

                {classes?.length === 0 ? (
                    <li id="default-li">
                        Nothing yet! <a href="#">Add some classes</a> to get started!
                    </li>
                ) : (
                    classes.map(cls => (
                        <div className="subject-holder" key={cls.unique_string_id}>
                            <li className="subject">
                                {cls.name}
                                <a href={`/${subjectId}/${cls.unique_string_id}`} title={`${window.location.origin}/${subjectId}/${cls.unique_string_id}`} className="view-all-classes-link">
                                    (all {cls.name} units →)
                                </a>
                            </li>
                            <div className="subject-description">{cls.description}
                                <div className="count-and-button-holder">
                                    {unitsByClass[cls.unique_string_id] ? (
                                        unitsByClass[cls.unique_string_id].length === 1 ? (
                                            <p className="subject-class-count">
                                                <span className="subject-class-count-number">{unitsByClass[cls.unique_string_id].length}</span> unit
                                            </p>
                                        ) : (
                                            <p className="subject-class-count">
                                                <span className="subject-class-count-number">{unitsByClass[cls.unique_string_id].length}</span> units
                                            </p>
                                        )
                                        
                                    ) : (
                                        <LoadingScreen />
                                    )}
                                    <button className="add-class-button" title="Add a unit" onClick={openUnitFormModal}>+</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </ul>
        </>
    );
};

function openUnitFormModal() {
    console.log("Open unit form modal");
}