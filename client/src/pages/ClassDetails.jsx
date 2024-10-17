import { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import DOMPurify from 'dompurify';
import { FetchContext } from "../context/FetchProvider.jsx";
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import MessagePopup from "../components/MessagePopup.jsx";
import "../styles/classDetails.css";

export default function ClassDetails() {
    const { subjectId, classId } = useParams();
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [classData, setClassData] = useState({});
    const [units, setUnits] = useState([]);
    const [topicsByUnit, setTopicsByUnit] = useState({});
    const [openLessonFormModal, setOpenLessonFormModal] = useState(false);

    useEffect(() => {
        if (subjectId && classId) {
            const fetchClassData = async () => {
                try {
                    const data = await fetchWithRetry(`/api/classes/${subjectId}/${classId}`);
                    setClassData(data[0]);
                } catch (error) {
                    setMessage("Error fetching class data");
                    console.error(`Error fetching class data: ${error.message}`);
                };
            };

            const fetchUnits = async () => {
                try {
                    const data = await fetchWithRetry(`/api/units/${subjectId}/${classId}`);
                    setUnits(data);
                } catch (error) {
                    setMessage("Error fetching units");
                    console.error(`Error fetching units: ${error.message}`);
                };
            };

            fetchClassData();
            fetchUnits();
            setLoading(false);
        };
    }, [subjectId, classId]);

    useEffect(() => {
        const fetchTopicsByUnit = async (unitId) => {
            try {
                const res = await fetch(`/api/topics/${subjectId}/${classId}/${unitId}`);
                const data = await res.json();
                setTopicsByUnit((prevTopics) => ({
                    ...prevTopics,
                    [unitId]: data,
                }));
            } catch (error) {
                setMessage(`Error fetching topics for unit ${unitId}`);
                console.error(`Error fetching topics for unit ${unitId}:`, error.message);
            };
        };

        units.forEach((unit) => {
            fetchTopicsByUnit(unit.unique_string_id);
        });
    }, [units]);

    // add the modals to add lesson and delete lesson

    const convertDate = (date) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
    };

    return (
        <main id="class-details-body" className="container">
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}
            <PageTitle title={`${classData.name} | StudyGo`} />

            <section id="class-section">
                <div id="class-header">
                    <h2>{classData.name}</h2>
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
                                <a className="unit-name" href={`/units/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}>{unit.name}</a>
                                <p className="unit-description">{unit.description}</p>
                                {topicsByUnit[unit.unique_string_id] ? (
                                    <ul className="topic-list">
                                        {topicsByUnit[unit.unique_string_id].map((topic) => (
                                            <li className="topic-holder">
                                                <p className="topic-name" key={topic.unique_string_id}>
                                                    {topic.name}
                                                    <button className="add-lesson-button" title="Add Lesson">Add Lesson</button>
                                                </p>
                                                <p className="topic-description">{topic.description}</p>
                                                <ul className="sub-topic-list">
                                                    {topic.lessons.map((lesson) => (
                                                        <li className="classes-lesson-holder" key={lesson.unique_string_id}>
                                                            <p className="classes-lesson-name">
                                                                Lesson: {lesson.name}
                                                                <button className="delete-lesson-button" title="Delete Lesson">Delete Lesson</button>
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
    );
};