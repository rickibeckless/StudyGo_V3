import { useEffect, useState, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { FetchContext } from "../../context/FetchProvider.jsx";
import PageTitle from "../PageTitle.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import UnitFormModal from "./UnitFormModal.jsx";

export default function GeneralClassesPage() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const { fetchWithRetry } = useContext(FetchContext);
    const navigate = useNavigate();

    const initialHiddenState = JSON.parse(localStorage.getItem("hiddenWalkthrough")) || [];
    const isHidden = initialHiddenState.includes("classes");
    const [hiddenWalkthrough, setHiddenWalkthrough] = useState(isHidden);
    const [walkthrough, setWalkthrough] = useState(false);
    const walkthroughData = ({
        page: "classes",
        steps: [
            {
                index: 1,
                title: "Welcome to the 'Classes' Page!",
                instruction: "Here's a quick walkthrough we've put together to help you get started!",
                focusedElement: null,
                assets: ["https://i.ibb.co/bz0dYLT/Study-Go-Ani-Logo.gif"]
            },
            {
                index: 2,
                title: "Step 1: View All Classes",
                instruction: "Here you can view all the classes available on StudyGo. Click on a class to view more details.",
                focusedElement: "subject-list",
                assets: []
            },
            {
                index: 3,
                title: "Step 2: Search for a Class",
                instruction: "Use the search bar to find a specific class.",
                focusedElement: "search-bar",
                assets: []
            },
            {
                index: 4,
                title: "Step 3: Filter Classes",
                instruction: "Use the filter options to sort classes by name, number of units, date added, or date updated.",
                focusedElement: "subjects-filter",
                assets: []
            },
            {
                index: 5,
                title: "Step 4: Add a Class",
                instruction: "Click the 'Add Class' button to add a new class.",
                focusedElement: "add-class-button",
                assets: []
            },
            {
                index: 6,
                title: "Step 5: Walkthrough Complete!",
                instruction: "You've completed the walkthrough! You can always access it again from the 'Help' menu.",
                focusedElement: null,
                assets: []
            }
        ]
    });

    const [classes, setClasses] = useState([]);
    const [unitsByClass, setUnitsByClass] = useState({});
    const [topicsByUnit, setTopicsByUnit] = useState({});
    const [openClassFormModal, setOpenClassFormModal] = useState(false);
    const [openUnitFormModal, setOpenUnitFormModal] = useState(false);
    const [openClassId, setOpenClassId] = useState(null);
    const [openUnitId, setOpenUnitId] = useState(null);

    useEffect(() => {
        async function fetchClasses() {
            try {
                const classesData = await fetchWithRetry("/api/classes");

                if (!classesData) {
                    setMessage("An unexpected error occurred. Please try again.");
                    setLoading(false);
                    return;
                };

                setClasses(classesData);
                classesData.forEach(cls => fetchUnits(cls.unique_string_id, cls.subjectid));
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setMessage("An unexpected error occurred. Please try again.");
            };
        };

        fetchClasses();
    }, []);

    const fetchUnits = async (classId, subjectId) => {
        const unitsRes = await fetch(`/api/units/${subjectId}/${classId}`);
        let unitsData = await unitsRes.json();

        unitsData.sort((a, b) => a.unit_index - b.unit_index);

        setUnitsByClass(prevState => ({
            ...prevState,
            [classId]: unitsData
        }));

        unitsData.forEach(unit => fetchTopics(classId, unit.unique_string_id));
    };

    const fetchTopics = async (classId, unitId) => {
        const topicsRes = await fetch(`/api/topics/${unitId}`);
        let topicsData = await topicsRes.json();

        topicsData.sort((a, b) => a.topic_index - b.topic_index);

        setTopicsByUnit(prevState => ({
            ...prevState,
            [unitId]: topicsData
        }));
    };

    const toggleAddForm = (type) => {
        console.log("Add form clicked");
    };

    const toggleUnitsDropdown = (e, classId) => {
        e.stopPropagation();
        setOpenClassId(openClassId === classId ? null : classId);
    };

    const toggleTopicsDropdown = (e, unitId) => {
        e.stopPropagation();
        setOpenUnitId(openUnitId === unitId ? null : unitId);
    };

    const truncateDescription = (text, maxLength = 300) => {
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    return (
        <>
            <PageTitle title="All Classes | StudyGo" />
            {loading && <LoadingScreen />}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <div id="subjects-section-header">
                <h2>All Classes</h2>
                <button id="add-subject-button" title="Add a class" onClick={() => toggleAddForm("class")}>Add Class</button>
            </div>
            <ul id="subject-list">
                {classes?.map(cls => (
                    <div className="subject-holder" onClick={(e) => toggleUnitsDropdown(e, cls.unique_string_id)} key={cls.unique_string_id}>
                        <li className="subject">
                            {cls.name}
                            <a href={`/${cls.subjectid}/${cls.unique_string_id}`} title={`${window.location.origin}/${cls.subjectid}/${cls.unique_string_id}`} className="view-all-classes-link">
                                (all {cls.name} units →)
                            </a>
                        </li>

                        {openClassId !== cls.unique_string_id ? (
                            <div className="subject-description" >
                                {truncateDescription(cls.description)}
                            </div>
                        ) : (
                            <div className="class-holder">
                                {unitsByClass[cls.unique_string_id] ? (
                                    unitsByClass[cls.unique_string_id].length === 0 ? (
                                        <li className="class">No Units Available!</li>
                                    ) : (
                                        unitsByClass[cls.unique_string_id]?.map(unit => (
                                            <>
                                                <li className="class" onClick={(e) => toggleTopicsDropdown(e, unit.unique_string_id)}>
                                                    {unit.name}
                                                </li>

                                                {openUnitId === unit.unique_string_id && (
                                                    <ul className="unit-dropdown">
                                                        {topicsByUnit[unit.unique_string_id] ? (
                                                            topicsByUnit[unit.unique_string_id].map(topic => (
                                                                <li className="unit-item-holder" key={topic.unique_string_id} onClick={(e) => e.stopPropagation()}>
                                                                    <a href={`/units/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}
                                                                        title={`${window.location.origin}/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}
                                                                        className="unit"
                                                                    >
                                                                        {topic.name}
                                                                    </a>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="unit-item-holder">
                                                                <p className="unit">No topics available!</p>
                                                            </li>
                                                        )}
                                                    </ul>
                                                )}
                                            </>
                                        ))
                                    )
                                ) : (
                                    <li className="class">No Units Available!</li>
                                )}
                            </div>
                        )}

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
                                <p className="subject-class-count">
                                    <span className="subject-class-count-number">0</span> units
                                </p>
                            )}
                            <button className="add-class-button" title="Add a unit" onClick={() => toggleAddForm("unit", cls)}>Add Unit</button>
                        </div>
                    </div>
                ))}
            </ul>
        </>
    );
};