import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FetchContext } from "../context/FetchProvider.jsx";
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import MessagePopup from "../components/MessagePopup.jsx";
import "../styles/subjects.css";

import NewClassModal from "../components/subjectsComponents/NewClassModal.jsx";

export default function Subjects() {
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);

    const [classesBySubject, setClassesBySubject] = useState([]);
    const [unitsByClass, setUnitsByClass] = useState([]);

    const [openClassDropdown, setOpenClassDropdown] = useState(false);
    const [openUnitDropdown, setOpenUnitDropdown] = useState(false);
    const [openSubjectId, setOpenSubjectId] = useState(null);
    const [openClassId, setOpenClassId] = useState(null);

    const [currentSubject, setCurrentSubject] = useState([]);
    const [openNewClassModal, setOpenNewClassModal] = useState(false);

    const toggleNewClassModal = (e, subject) => {
        e.stopPropagation();
        setCurrentSubject(subject);
        setOpenNewClassModal(!openNewClassModal);
        document.body.classList.toggle("modal-open");
    };

    const toggleClassDropdown = async (e, subject) => {
        e.stopPropagation();
        setOpenClassDropdown(!openClassDropdown);

        const classesData = await fetchWithRetry(`/api/classes/${subject.unique_string_id}`);
        //const classesData = await classesRes.json();
        setClassesBySubject(classesData);

        setOpenSubjectId(openSubjectId === subject.unique_string_id ? null : subject.unique_string_id);
    };

    const toggleUnitDropdown = async (e, cls) => {
        e.stopPropagation();
        setOpenUnitDropdown(!openUnitDropdown);

        const unitsData = await fetchWithRetry(`/api/units/${cls.subjectid}/${cls.unique_string_id}`);
        //const unitsData = await unitsRes.json();
        setUnitsByClass(unitsData);

        setOpenClassId(openClassId === cls.unique_string_id ? null : cls.unique_string_id);
    };

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const subjectData = await fetchWithRetry(`/api/subjects/`);
                //const subjectData = await subjectsRes.json();

                if (!subjectData) {
                    setLoading(false);
                    navigate("/404");
                };

                setSubjects(subjectData);

                setLoading(false);
            } catch (error) {
                setLoading(false);
                setMessage("Error getting subjects: ", error.message);
            };
        };

        async function fetchClasses() {
            try {
                setLoading(true);

                const classesData = await fetchWithRetry(`/api/classes/`);
                //const classesData = await classesRes.json();

                setClasses(classesData);

                setLoading(false);
            } catch (error) {
                setLoading(false);
                setMessage("Error getting classes: ", error.message);
            };
        };

        fetchSubjects();
        fetchClasses();
    }, []);

    return (
        <>
            <PageTitle title="All Subjects | StudyGo" />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="subjects-body" className="container">
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

                <section id="subjects-section">
                    <h2>All Subjects</h2>
                    <ul id="subject-list">
                        {subjects.length === 0 ? (
                            <li id="default-li" key="default-li">Nothing yet! <a href="#">Add some subjects</a> to get started!</li>
                        ) : (
                            subjects.map(subject => (
                                <div className="subject-holder" id={subject.unique_string_id} key={subject.unique_string_id} onClick={(e) => toggleClassDropdown(e, subject)}>
                                    <li className="subject" key={`${subject.unique_string_id}-name`}>
                                        {subject.name}
                                        <a href={`/${subject.unique_string_id}`} title={`${window.location.origin}/${subject.unique_string_id}`} className="view-all-classes-link">(all {subject.name} classes →)</a>
                                    </li>

                                    {openSubjectId !== subject.unique_string_id ? (
                                        <div className="subject-description">
                                            {subject.description}
                                            <div className="count-and-button-holder">
                                                <p className="subject-class-count">
                                                    <span className="subject-class-count-number">
                                                        {classes.filter(cls => cls.subjectid === subject.unique_string_id).length}
                                                    </span>
                                                    {classes.filter(cls => cls.subjectid === subject.unique_string_id).length === 1 ? " class" : " classes"}
                                                </p>
                                                <button className="add-class-button" title="Add a class" onClick={(e) => toggleNewClassModal(e, subject)}>+</button>
                                            </div>
                                        </div>
                                    ) : (
                                        classesBySubject.map(cls => (
                                            <ul className="class-dropdown" id={`${cls.unique_string_id}-class-dropdown`}>
                                                <div className="class-holder">
                                                    {classesBySubject.length === 0 ? (
                                                        <li className="class" key="default-class-li">No classes available!</li>
                                                    ) : ( <>
                                                        <li className="class" id={`${cls.unique_string_id}-class`} key={`${cls.unique_string_id}-class`} onClick={(e) => toggleUnitDropdown(e, cls)}>{cls.name}</li>
                                                        
                                                        {openClassId === cls.unique_string_id && (
                                                            <ul className="unit-dropdown" id={`${cls.unique_string_id}-unit-dropdown`}>
                                                                {unitsByClass.length === 0 ? (
                                                                    <li className="unit-item-holder">
                                                                        <p className="unit">No units available!</p>
                                                                    </li>
                                                                ) : (
                                                                    unitsByClass.map(unit => (
                                                                        <li className="unit-item-holder">
                                                                            <a className="unit" href={`/units/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}>{unit.name}</a>
                                                                        </li>
                                                                    ))
                                                                )}
                                                            </ul>
                                                        )}
                                                    </> )}
                                                </div>
                                            </ul>
                                        ))
                                    )}
                                </div>
                            ))
                        )}
                    </ul>
                </section>
            </main>                                            
            {openNewClassModal && (
                <NewClassModal
                    subject={currentSubject}
                    toggleNewClassModal={toggleNewClassModal}
                />
            )}
        </>
    );
};