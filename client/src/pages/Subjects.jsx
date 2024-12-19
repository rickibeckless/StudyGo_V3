import { useEffect, useState, useContext } from "react";
import { FetchContext } from "../context/FetchProvider.jsx";
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import MessagePopup from "../components/MessagePopup.jsx";
import Walkthrough from "../components/Walkthrough.jsx";
import "../styles/subjects.css";

import NewSubjectModal from "../components/subjectsComponents/NewSubjectModal.jsx";
import NewClassModal from "../components/subjectsComponents/NewClassModal.jsx";

export default function Subjects() {
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    
    const initialHiddenState = JSON.parse(localStorage.getItem("hiddenWalkthrough")) || [];
    const isHidden = initialHiddenState.includes("subjects");
    const [hiddenWalkthrough, setHiddenWalkthrough] = useState(isHidden);
    const [walkthrough, setWalkthrough] = useState(false);
    const [walkthroughData, setWalkthroughData] = useState({});

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
    const [openNewSubjectModal, setOpenNewSubjectModal] = useState(false);

    const toggleAddForm = (type, parent) => {
        if (openNewClassModal || openNewSubjectModal) {
            document.body.classList.remove("modal-open");
        } else {
            document.body.classList.add("modal-open");
        };

        if (type === "subject") {
            setOpenNewSubjectModal(!openNewSubjectModal);
            fetchSubjects();
        } else if (type === "class") {
            setCurrentSubject(parent);
            setOpenNewClassModal(!openNewClassModal);
            fetchClasses();
        } else {
            setOpenNewSubjectModal(false);
            setOpenNewClassModal(false);
            fetchSubjects();
            fetchClasses();
        }
    };

    const toggleClassDropdown = async (e, subject) => {
        e.stopPropagation();

        setOpenClassDropdown(!openClassDropdown);

        let classesData = await fetchWithRetry(`/api/classes/${subject.unique_string_id}`);

        if (!classesData || classesData.length === 0 || classesData === undefined || classesData === null) {
            classesData = [];
        };
        setClassesBySubject(classesData);

        setOpenSubjectId(openSubjectId === subject.unique_string_id ? null : subject.unique_string_id);
    };

    const toggleUnitDropdown = async (e, cls) => {
        e.stopPropagation();
        setOpenUnitDropdown(!openUnitDropdown);

        const unitsData = await fetchWithRetry(`/api/units/${cls.subjectid}/${cls.unique_string_id}`);
        setUnitsByClass(unitsData);

        setOpenClassId(openClassId === cls.unique_string_id ? null : cls.unique_string_id);
    };

    async function fetchSubjects() {
        setLoading(true);
        try {
            const subjectData = await fetchWithRetry(`/api/subjects/`);
            setSubjects(subjectData);
        } catch (error) {
            setMessage("Error getting subjects: ", error.message);
        };
        setLoading(false);
    };

    async function fetchClasses() {
        setLoading(true);
        try {
            const classesData = await fetchWithRetry(`/api/classes/`);
            setClasses(classesData);
        } catch (error) {
            setMessage("Error getting classes: ", error.message);
        };
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        fetchSubjects();
        fetchClasses();

        if (!hiddenWalkthrough) {
            document.body.classList.add("modal-open");
            setWalkthrough(true);
            setWalkthroughData({
                page: "subjects",
                steps: [
                    {
                        index: 1,
                        title: "Welcome to the 'Subjects' Page!",
                        instruction: "Here's a quick walkthrough we've put together to help you get started! (p.s: you can click the 'x' if you don't want to hear it!)",
                        focusedElement: null,
                        assets: ["https://i.ibb.co/cTZkxJR/Code-Path-Study-Go-v3-Walkthrough.gif"]
                    },
                    {
                        index: 2,
                        title: "Search and Filters",
                        instruction: "On your left, you have your search and filters. Search for a subject or filter how the subjects are sorted!",
                        focusedElement: "subjects-filter-holder",
                        assets: []
                    },
                    {
                        index: 3,
                        title: "View all Subjects",
                        instruction: "On your right, you have a view of all subjects currently on StudyGo! Select a subject to view the top five classes with the most content, or select (all ___ classes) to view them all!",
                        focusedElement: "subjects-section",
                        assets: []
                    },
                    {
                        index: 4,
                        title: "Happy Studying!",
                        instruction: "That's it for this walkthrough so we'll turn you loose! Enjoy your time here and study hard!",
                        focusedElement: null,
                        assets: []
                    }
                ]
            });
        } else {
            setWalkthrough(false);
            document.body.classList.remove("modal-open");
            setWalkthroughData({});
        };
    }, []);

    return (
        <>
            <PageTitle title="All Subjects | StudyGo" />
            {loading && <LoadingScreen />}
            {message && <MessagePopup message={message} setMessage={setMessage} />}
            {walkthrough && 
                <Walkthrough 
                    walkthroughData={walkthroughData}
                    setWalkthrough={setWalkthrough}
                    setWalkthroughData={setWalkthroughData}
                    setHiddenWalkthrough={setHiddenWalkthrough}
                />
            }

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
                    <div id="subjects-section-header">
                        <h2>All Subjects</h2>
                        <button id="add-subject-button" title="Add a subject" onClick={() => toggleAddForm("subject")}>Add Subject</button>
                    </div>
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
                                        </div>
                                    ) : (
                                        <div className="class-holder">
                                            {classesBySubject.length === 0 ? (
                                                <li className="class" key="default-class-li">No classes available!</li>
                                            ) : (
                                                classesBySubject.map(cls => (
                                                    <>
                                                        <li className="class" id={`${cls.unique_string_id}-class`} key={`${cls.unique_string_id}-class`} onClick={(e) => toggleUnitDropdown(e, cls)}>{cls.name}</li>

                                                        {openClassId === cls.unique_string_id && (
                                                            <ul className="class-dropdown" id={`${cls.unique_string_id}-class-dropdown`}>
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
                                                    </>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    <div className="count-and-button-holder">
                                        <p className="subject-class-count">
                                            <span className="subject-class-count-number">
                                                {classes.filter(cls => cls.subjectid === subject.unique_string_id).length}
                                            </span>
                                            {classes.filter(cls => cls.subjectid === subject.unique_string_id).length === 1 ? " class" : " classes"}
                                        </p>
                                        <button className="add-class-button" title="Add a class" onClick={() => toggleAddForm("class", subject)}>Add Class</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </ul>
                </section>
            </main>

            {openNewSubjectModal && (<NewSubjectModal toggleAddForm={toggleAddForm} />)}
            {openNewClassModal && (<NewClassModal subject={currentSubject} toggleAddForm={toggleAddForm} />)}
        </>
    );
};