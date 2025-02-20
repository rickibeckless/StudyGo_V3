import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FetchContext } from "../context/FetchProvider.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import MessagePopup from "../components/MessagePopup.jsx";
import "../styles/classDetails.css";

import AddUnitModal from "../components/classDetailsComponents/AddUnitModal.jsx";
import AddTopicModal from "../components/classDetailsComponents/AddTopicModal.jsx";
import AddLessonModal from "../components/classDetailsComponents/AddLessonModal.jsx";

export default function ClassDetails() {
    const navigate = useNavigate();
    const { subjectId, classId } = useParams();
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [styledMessage, setStyledMessage] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null);

    const [classData, setClassData] = useState({});
    const [units, setUnits] = useState([]);
    const [topicsByUnit, setTopicsByUnit] = useState({});

    const [openNewUnitForm, setOpenNewUnitForm] = useState(false);
    const [openNewTopicForm, setOpenNewTopicForm] = useState(false);
    const [openNewLessonForm, setOpenNewLessonForm] = useState(false);
    const [editingUnit, setEditingUnit] = useState({});
    const [editingTopic, setEditingTopic] = useState({});

    const fetchClassData = async () => {
        try {
            const data = await fetchWithRetry(`/api/classes/${subjectId}/${classId}`);
            setClassData(data[0]);
        } catch (error) {
            setConfirmationAction(null);
            setStyledMessage(false);
            setMessage("Error fetching class data");
            console.error(`Error fetching class data: ${error.message}`);
        };
    };

    const fetchUnits = async () => {
        try {
            let data = await fetchWithRetry(`/api/units/${subjectId}/${classId}`);
            data = data.sort((a, b) => a.unit_index - b.unit_index);
            setUnits(data);
        } catch (error) {
            setConfirmationAction(null);
            setStyledMessage(false);
            setMessage("Error fetching units");
            console.error(`Error fetching units: ${error.message}`);
        };
    };

    const fetchTopicsByUnit = async (unitId) => {
        try {
            const res = await fetch(`/api/topics/${unitId}`);
            let data = await res.json();
            data = data.sort((a, b) => a.topic_index - b.topic_index);
            setTopicsByUnit((prevTopics) => ({
                ...prevTopics,
                [unitId]: data,
            }));
        } catch (error) {
            setConfirmationAction(null);
            setStyledMessage(false);
            setMessage(`Error fetching topics for unit ${unitId}`);
            console.error(`Error fetching topics for unit ${unitId}:`, error.message);
        };
    };

    useEffect(() => {
        if (subjectId && classId) {

            fetchClassData();
            fetchUnits();
            setLoading(false);
        };
    }, [subjectId, classId]);

    useEffect(() => {
        units.forEach((unit) => {
            fetchTopicsByUnit(unit.unique_string_id);
        });
    }, [units]);

    const convertDate = (date) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
    };

    const toggleAddForm = (type, parent) => {
        if (openNewLessonForm || openNewTopicForm || openNewUnitForm) {
            document.body.classList.remove("modal-open");
        } else {
            document.body.classList.add("modal-open");
        };

        if (type === "lesson") {
            setOpenNewLessonForm(!openNewLessonForm);
            setEditingTopic(parent);
            fetchTopicsByUnit(parent.unitid);
        } else if (type === "topic") {
            setOpenNewTopicForm(!openNewTopicForm);
            setEditingUnit(parent);
            fetchTopicsByUnit(parent.unique_string_id);
        } else if (type === "unit") {
            setOpenNewUnitForm(!openNewUnitForm);
            fetchUnits();
        } else {
            setOpenNewLessonForm(false);
            setOpenNewTopicForm(false);
            setOpenNewUnitForm(false);
            setEditingUnit({});
            setEditingTopic({});
            fetchUnits();
        };
    };

    const handleDelete = (type, topic, unit, lesson, cls) => {
        let name = type === "lesson" ? lesson?.name : type === "topic" ? topic?.name : type === "unit" ? unit?.name : type === "class" ? cls?.name : null;
        setStyledMessage(true);
        setConfirmationAction(() => () => confirmDelete(topic, unit, lesson));
        setMessage(`
            <h3>Delete ${type}</h3>
            <p>Are you sure you want to delete the ${type}: ${name}?</p>
        `);

        async function confirmDelete(topic, unit, lesson) {
            let url = type === "lesson" ? `/api/topics/${topic?.unique_string_id}/delete/lesson` : type === "topic" ? `/api/topics/${topic?.unique_string_id}/delete` : type === "unit" ? `/api/units/${unit?.unique_string_id}/delete` : type === "class" ? `/api/classes/${classData?.unique_string_id}` : null;
            let body = type === "lesson" ? JSON.stringify({ lessonId: lesson?.unique_string_id }) : null;

            try {
                const res = await fetch(url, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: body,
                });
                const data = await res.json();
                if (data.error) {
                    setConfirmationAction(null);
                    setStyledMessage(false);
                    setMessage(data.error);
                } else {
                    setConfirmationAction(null);
                    setStyledMessage(false);
                    setMessage(`${type} deleted successfully`);
                    type === "unit" ? fetchUnits() : type === "class" ? navigate(`/${subjectId}`) : fetchTopicsByUnit(topic?.unitid);
                };
            } catch (error) {
                setConfirmationAction(null);
                setMessage(`Error deleting ${type}`);
                console.error(`Error deleting ${type}: ${error.message}`);
            };
        };
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} styledMessage={styledMessage} confirmationAction={confirmationAction} />}
            <PageTitle title={`${classData.name} | StudyGo`} />

            <main id="class-details-body" className="container">
                <section id="class-section">
                    <div id="class-header">
                        <h2 className="add-button-holder">
                            <button type="button" className="delete-lesson-button" title={`Delete class: ${classData.name}`} onClick={() => handleDelete("class", null, null, null, classData)}>Delete Class</button>
                            Class: {classData.name}
                            <button type="button" className="add-lesson-button" title="Add Unit" onClick={() => toggleAddForm("unit", classData)}>Add Unit</button>
                        </h2>
                        <div id="class-stats-holder">
                            <p id="class-created-date">
                                Created: <span>{convertDate(classData.date_created)}</span>
                            </p>
                            <p id="class-updated-date">
                                Updated: <span>{convertDate(classData.date_updated)}</span>
                            </p>
                        </div>
                        <p id="class-description">{classData.description}</p>
                    </div>

                    <section id="unit-section">
                        <ul id="unit-list">
                            {units.map((unit) => (
                                <li className="unit-holder" key={unit.unique_string_id}>
                                    <div className="add-button-holder">
                                        <a className="unit-name" href={`/units/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}>
                                            Unit {unit.unit_index}: {unit.name}
                                        </a>
                                        <button type="button" className="add-lesson-button" title="Add Topic" onClick={() => toggleAddForm("topic", unit)}>Add Topic</button>
                                        <button
                                            type="button"
                                            className="delete-unit-button"
                                            title={`Delete Unit ${unit.unit_index}: ${unit.name}`}
                                            onClick={() => handleDelete("unit", null, unit, null)}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                    <p className="unit-description">{unit.description}</p>
                                    {topicsByUnit[unit.unique_string_id] ? (
                                        <ul className="topic-list">
                                            {topicsByUnit[unit.unique_string_id].map((topic) => (
                                                <li className="topic-holder">
                                                    <p className="topic-name" key={topic.unique_string_id}>
                                                        Topic {topic.topic_index}: {topic.name}

                                                        <div className="topic-button-holder">
                                                            <button
                                                                type="button"
                                                                className="delete-topic-button"
                                                                title={`Delete Topic ${topic.topic_index}: ${topic.name}`}
                                                                onClick={() => handleDelete("topic", topic, unit, null)}
                                                            >
                                                                Delete Topic
                                                            </button>
                                                            
                                                            <button type="button" className="add-lesson-button" title="Add Lesson" onClick={() => toggleAddForm("lesson", topic)}>Add Lesson</button>
                                                        </div>
                                                    </p>
                                                    <p className="topic-description">{topic.description}</p>
                                                    <ul className="sub-topic-list">
                                                        {topic.lessons?.map((lesson) => (
                                                            <li className="classes-lesson-holder" key={lesson.unique_string_id}>
                                                                <p className="classes-lesson-name">
                                                                    Lesson {lesson.lesson_index}: {lesson.name}
                                                                    <button type="button" className="delete-lesson-button" title="Delete Lesson" onClick={() => handleDelete("lesson", topic, unit, lesson)}>Delete Lesson</button>
                                                                </p>
                                                                <p className="classes-lesson-description">
                                                                    {lesson.description.split('\n').map((line, index) => (
                                                                        <>{line}<br /></>
                                                                    ))}
                                                                </p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        null
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                </section>
            </main>

            {openNewUnitForm && <AddUnitModal toggleAddForm={toggleAddForm} cls={classData} />}
            {openNewTopicForm && <AddTopicModal toggleAddForm={toggleAddForm} unit={editingUnit} />}
            {openNewLessonForm && <AddLessonModal toggleAddForm={toggleAddForm} topic={editingTopic} />}
        </>
    );
};