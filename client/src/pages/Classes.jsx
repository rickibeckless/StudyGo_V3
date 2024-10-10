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

function GeneralClassesPage() {

    return (
        <>
            <PageTitle title="All Classes | StudyGo" />
            <h2>General Classes</h2>
        </>
    );
};

function SubjectPage({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [classes, setClasses] = useState(null);
    const [unitsByClass, setUnitsByClass] = useState({});
    const [topicsByUnit, setTopicsByUnit] = useState({});
    const [openUnitFormModal, setOpenUnitFormModal] = useState(false);
    const [unitFormModalIds, setUnitFormModalIds] = useState({ subjectId: null, classId: null });
    const [openClassId, setOpenClassId] = useState(null);
    const [openUnitId, setOpenUnitId] = useState(null);

    const toggleUnitFormModal = (subjectId, classId) => {
        setOpenUnitFormModal(!openUnitFormModal);
        setUnitFormModalIds({ subjectId, classId });
    };

    const toggleUnitsDropdown = (e, classId) => {
        e.stopPropagation();
        setOpenClassId(openClassId === classId ? null : classId);
    };

    const toggleTopicsDropdown = (e, unitId) => {
        e.stopPropagation();
        setOpenUnitId(openUnitId === unitId ? null : unitId);
    };

    useEffect(() => {
        const fetchSubject = async () => {
            const subjectRes = await fetch(`/api/subjects/${subjectId}`);
            const subjectData = await subjectRes.json();
            setSubject(subjectData[0]);
        };

        const fetchClasses = async () => {
            const classesRes = await fetch(`/api/classes/${subjectId}`);
            const classesData = await classesRes.json();
            setClasses(classesData);

            classesData.forEach(cls => fetchUnits(cls.unique_string_id));
        };

        fetchSubject();
        fetchClasses();
    }, [subjectId]);

    const fetchUnits = async (classId) => {
        const unitsRes = await fetch(`/api/classes/${subjectId}/${classId}`);
        const unitsData = await unitsRes.json();

        setUnitsByClass(prevState => ({
            ...prevState,
            [classId]: unitsData
        }));

        unitsData.forEach(unit => fetchTopics(classId, unit.unique_string_id));
    };

    const fetchTopics = async (classId, unitId) => {
        const topicsRes = await fetch(`/api/topics/${subjectId}/${classId}/${unitId}`);
        const topicsData = await topicsRes.json();

        setTopicsByUnit(prevState => ({
            ...prevState,
            [unitId]: topicsData
        }));
    };

    if (!subject) {
        return <LoadingScreen />;
    };

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
                    classes?.map(cls => (
                        <div className="subject-holder" onClick={(e) => toggleUnitsDropdown(e, cls.unique_string_id)} key={cls.unique_string_id}>
                            <li className="subject">
                                {cls.name}
                                <a href={`/${subjectId}/${cls.unique_string_id}`} title={`${window.location.origin}/${subjectId}/${cls.unique_string_id}`} className="view-all-classes-link">
                                    (all {cls.name} units →)
                                </a>
                            </li>

                            {openClassId !== cls.unique_string_id ? (
                                <div className="subject-description" >
                                    {cls.description}
                                    
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
                                        <button className="add-class-button" title="Add a unit" onClick={() => toggleUnitFormModal(subjectId, cls.unique_string_id)}>+</button>
                                    </div>
                                </div>
                            ) : (
                                <ul className="class-dropdown">
                                    {unitsByClass[cls.unique_string_id] ? (
                                        unitsByClass[cls.unique_string_id].length === 0 ? (
                                            <div className="class-holder">
                                                <li className="class">No Units Available!</li>
                                            </div>
                                        ) : (
                                            unitsByClass[cls.unique_string_id].map(unit => (
                                                <div className="class-holder" key={unit.unique_string_id}>
                                                    <li className="class" onClick={(e) => toggleTopicsDropdown(e, unit.unique_string_id)}>
                                                        {unit.name}
                                                    </li>
                                                    
                                                    {openUnitId === unit.unique_string_id && (
                                                        <ul className="unit-dropdown">
                                                            {topicsByUnit[unit.unique_string_id] ? (
                                                                topicsByUnit[unit.unique_string_id].map(topic => (
                                                                    <li className="unit-item-holder" key={topic.unique_string_id} onClick={(e) => e.stopPropagation()}>
                                                                        <a href={`${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}
                                                                            title={`${window.location.origin}/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}
                                                                            className="unit"
                                                                        >
                                                                            {topic.name}
                                                                        </a>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <LoadingScreen />
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        <LoadingScreen />
                                    )}
                                </ul>
                            )}
                        </div>
                    ))
                )}
            </ul>
            {openUnitFormModal && (
                <UnitFormModal
                    subjectId={unitFormModalIds.subjectId}
                    classId={unitFormModalIds.classId}
                    classes={classes}
                    toggleUnitFormModal={toggleUnitFormModal}
                />
            )}
        </>
    );
};

function UnitFormModal({ subjectId, classId, classes, toggleUnitFormModal }) {
    const className = classes.find(cls => cls.unique_string_id === classId).name;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = document.getElementById('classForm');
        const formData = new FormData(form);
        const formObj = Object.fromEntries(formData.entries());
        formObj.classId = classId;

        formObj.learningObjectives = formObj.learningObjectives
            ? formObj.learningObjectives.split('\n').map(item => item.trim()).filter(Boolean)
            : [];

        const res = await fetch(`/api/units/${subjectId}/${classId}/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObj)
        });

        const data = await res.json();

        form.reset();
        toggleUnitFormModal(subjectId, classId);
    }

    return (
        <>
            <div id="modalOverlay"></div>
            <div id="classModal">
                <h3 id="modal-title">Add Unit to {className}</h3>
                <form id="classForm">
                    <input className="modal-input" id="modalNameInput" type="text" name="name" placeholder="Unit Name" required />
                    <textarea className="modal-input" id="modalDescriptionInput" name="description" placeholder="Unit Description" rows="4"></textarea>
                    <textarea className="modal-input" id="modalLearningObjectivesInput" name="learningObjectives" placeholder="Learning Objectives (one per line)" rows="4"></textarea>
                    <textarea className="modal-input" id="modalUnitOutcomesInput" name="unitOutcomes" placeholder="Unit Outcomes" rows="4"></textarea>
                    <textarea className="modal-input" id="modalPrerequisitesInput" name="prerequisites" placeholder="Prerequisites" rows="4"></textarea>

                    <div id="class-form-btn-holder">
                        <button id="modalCloseButton" type="button" onClick={() => toggleUnitFormModal(subjectId, classId)}>Close</button>
                        <button id="modalSubmitButton" type="submit" onClick={(e) => handleSubmit(e)}>Add Unit</button>
                    </div>
                </form>
            </div>
        </>
    );
};
