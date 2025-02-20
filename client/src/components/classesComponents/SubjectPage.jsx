import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../PageTitle.jsx";
import MessagePopup from "../MessagePopup.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import NewClassModal from "../subjectsComponents/NewClassModal.jsx";
import AddUnitModal from "../classDetailsComponents/AddUnitModal.jsx";

export default function SubjectPage({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [classes, setClasses] = useState(null);
    const [unitsByClass, setUnitsByClass] = useState({});
    const [topicsByUnit, setTopicsByUnit] = useState({});
    const [openClassFormModal, setOpenClassFormModal] = useState(false);
    const [openUnitFormModal, setOpenUnitFormModal] = useState(false);
    const [openClassId, setOpenClassId] = useState(null);
    const [openUnitId, setOpenUnitId] = useState(null);
    const [editingClass, setEditingClass] = useState({});

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [styledMessage, setStyledMessage] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);
    const navigate = useNavigate();

    const toggleUnitsDropdown = (e, classId) => {
        e.stopPropagation();
        setOpenClassId(openClassId === classId ? null : classId);
    };

    const toggleTopicsDropdown = (e, unitId) => {
        e.stopPropagation();
        setOpenUnitId(openUnitId === unitId ? null : unitId);
    };

    if (openUnitFormModal) {
        document.body.classList.add("modal-open");
    } else {
        document.body.classList.remove("modal-open");
    };

    const fetchSubject = async () => {
        const subjectRes = await fetch(`/api/subjects/${subjectId}`);
        if (subjectRes.status === 404 || subjectRes.status === 500) {
            navigate('/404');
        };

        const subjectData = await subjectRes.json();

        setSubject(subjectData[0]);
    };

    const fetchClasses = async () => {
        const classesRes = await fetch(`/api/classes/${subjectId}`);
        let classesData = await classesRes.json();

        console.log(classesData)
        classesData.sort((a, b) => a.class_index - b.class_index);

        setClasses(classesData);

        classesData.forEach(cls => fetchUnits(cls.unique_string_id));
    };

    useEffect(() => {
        try {
            fetchSubject();
            fetchClasses();
        } catch (error) {
            setConfirmationAction(null);
            setStyledMessage(false);
            setMessage('Error fetching subject');
        }

        setLoading(false);
    }, [subjectId]);

    const fetchUnits = async (classId) => {
        const unitsRes = await fetch(`/api/units/${subjectId}/${classId}`);
        let unitsData = await unitsRes.json();

        unitsData.sort((a, b) => a.unit_index - b.unit_index);           // sorted units by index (02/03/2025)

        setUnitsByClass(prevState => ({
            ...prevState,
            [classId]: unitsData
        }));

        unitsData.forEach(unit => fetchTopics(classId, unit.unique_string_id));
    };

    const fetchTopics = async (classId, unitId) => {
        const topicsRes = await fetch(`/api/topics/${unitId}`);          // updated path to only use unitId (02/03/2025)
        let topicsData = await topicsRes.json();

        topicsData.sort((a, b) => a.topic_index - b.topic_index);        // sorted topics by index (02/03/2025)

        setTopicsByUnit(prevState => ({
            ...prevState,
            [unitId]: topicsData
        }));
    };

    if (!subject) {
        return <LoadingScreen />;
    };

    const toggleAddForm = (type, parent) => {
        if (openUnitFormModal || openClassFormModal) {
            document.body.classList.remove("modal-open");
        } else {
            document.body.classList.add("modal-open");
        };

        if (type === "class") {
            setOpenClassFormModal(!openClassFormModal);
            fetchClasses();
        } else if (type === "unit") {
            setEditingClass(parent);
            setOpenUnitFormModal(!openUnitFormModal);
            fetchUnits(parent.unique_string_id);
        } else {
            setOpenClassFormModal(false);
            setOpenUnitFormModal(false);
        };
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title={`${subject.name} Classes | StudyGo`} />
            {message && <MessagePopup message={message} setMessage={setMessage} styledMessage={styledMessage} confirmationAction={confirmationAction} />}

            <div id="subjects-section-header">
                <h2>All {subject.name} Classes</h2>
                <button id="add-class-button" title="Add a class" onClick={() => toggleAddForm("class", subject)}>Add Class</button>
            </div>

            <ul id="subject-list">
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
                    ))
                )}
            </ul>

            {openClassFormModal && <NewClassModal toggleAddForm={toggleAddForm} subject={subject} />}
            {openUnitFormModal && <AddUnitModal toggleAddForm={toggleAddForm} cls={editingClass} />}
        </>
    );
};