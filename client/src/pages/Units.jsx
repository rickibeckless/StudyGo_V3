import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from "../components/LoadingScreen.jsx";
import MessagePopup from "../components/MessagePopup.jsx";
import PageTitle from "../components/PageTitle.jsx";
import UnitsHeader from "../components/unitsComponents/UnitsHeader.jsx";
import UnitsBodyContent from "../components/unitsComponents/UnitsBodyContent.jsx";
import OverviewOrSummary from "../components/unitsComponents/OverviewOrSummary.jsx";
import Footer from "../components/Footer.jsx";
import '../styles/units.css';

export default function Units() {
    const { subjectId, classId, unitId } = useParams();
    // const currentTopic = localStorage.getItem('currentTopic');
    // const currentSubTopicType = localStorage.getItem('currentSubTopicType');
    // const currentSubTopicId = localStorage.getItem('currentSubTopic-topicId');
    // const currentSubTopicFullId = localStorage.getItem('currentSubTopic-id');

    const [currentTopic, setCurrentTopic] = useState(null);
    const [allCurrentSubTopics, setAllCurrentSubTopics] = useState([]);
    const [currentSubTopicIndex, setCurrentSubTopicIndex] = useState(null);
    const [currentSubTopic, setCurrentSubTopic] = useState(null);
    const [currentSubTopicType, setCurrentSubTopicType] = useState(null);

    const [subject, setSubject] = useState([]);
    const [cls, setClass] = useState([]);
    const [unit, setUnit] = useState([]);
    const [topics, setTopics] = useState([]);

    const [openSubtopicDropdown, setOpenSubtopicDropdown] = useState(false);
    const [displaySubTopicContent, setDisplaySubTopicContent] = useState(false);
    const [contentType, setContentType] = useState("overview");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const toggleSubtopicDropdown = (e, topic) => {
        e.stopPropagation();
        //console.log(topic);
        setCurrentTopic(topic);

        let subTopics = [];
        subTopics.push(topic.lessons);
        subTopics.push(topic.notes);
        subTopics.push(topic.terms_defs);

        setAllCurrentSubTopics(subTopics);
        //console.log(allCurrentSubTopics);

        setCurrentSubTopicIndex(topic.topic_index);

        setOpenSubtopicDropdown(!openSubtopicDropdown);
    };

    const openSubTopic = async (e, currentTopic, subTopic) => {
        e.stopPropagation();
        //console.log(currentTopic);
        //console.log(subTopic);
        setCurrentSubTopic(subTopic);

        if (subTopic === 'notes') {
            setCurrentSubTopicType('Notes');
        } else if (subTopic === 'terms_defs') {
            setCurrentSubTopicType('Terms/Definitions');
        } else {
            setCurrentSubTopicType('Lesson');
        }

        setDisplaySubTopicContent(true);
    };

    const displayOverviewOrSummary = (e, type) => {
        e.stopPropagation();
        setDisplaySubTopicContent(false);
        setContentType(type);
        setCurrentTopic(null);
    };

    useEffect(() => {
        async function fetchSubject() {
            try {
                const res = await fetch(`/api/subjects/${subjectId}`);
                const subject = await res.json();
                setSubject(subject[0]);
                fetchClass();
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchClass() {
            try {
                const res = await fetch(`/api/classes/${classId}`);
                const cls = await res.json();
                setClass(cls[0]);
                fetchUnit();
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchUnit() {
            try {
                const res = await fetch(`/api/units/${subjectId}/${classId}/${unitId}`);
                const unit = await res.json();
                setUnit(unit[0]);
                fetchTopics(unit[0]);
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchTopics(unit) {
            try {
                const res = await fetch(`/api/topics/${subjectId}/${classId}/${unitId}`);
                const topics = await res.json();
                setTopics(topics);
            } catch (error) {
                console.error(error);
            };
        };

        fetchSubject();
    }, []);

    return (
        <>
            <div className="units-container">
                <UnitsHeader subject={subject} cls={cls} unit={unit} />
                <aside id="units-left-nav">
                    <div id="units-left-nav-search">
                        <input type="text" id="units-left-nav-search-input" placeholder="Search topics..." />
                        <button title="Search" type="button" id="units-left-nav-search-button">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    </div>
                    <nav id="units-left-nav-topics">
                        <ul id="units-left-nav-topics-list">
                            <li className="topic-item" onClick={(e) => displayOverviewOrSummary(e, 'overview')}>Overview</li>
                            <div className="topic-item-holder">
                                {topics.length > 0 ? (
                                    topics.map(topic => (
                                        <>
                                            <li key={topic.id} className="topic-item" onClick={(e) => toggleSubtopicDropdown(e, topic)}>{topic.name}</li>

                                            {currentTopic?.unique_string_id === topic.unique_string_id && (
                                                <ul className="topic-dropdown">
                                                    {currentTopic?.notes.length > 0 && (
                                                        <li className="sub-topic-item" onClick={(e) => openSubTopic(e, currentTopic, 'notes')}>Notes</li>
                                                    )}
                                                    {currentTopic?.terms_defs.length > 0 && (
                                                        <li className="sub-topic-item" onClick={(e) => openSubTopic(e, currentTopic, 'terms_defs')}>Term/Definitions</li>
                                                    )}
                                                    {currentTopic?.lessons.length > 0 && (
                                                        <>
                                                            {currentTopic.lessons.map((lesson, index) => (
                                                                <li className="sub-topic-item" onClick={(e) => openSubTopic(e, currentTopic, lesson)}>Lesson {++index}</li>
                                                            ))}
                                                        </>
                                                    )}
                                                </ul>
                                            )}
                                        </>
                                    ))
                                ) : (
                                    <li>No topics available!</li>
                                )}
                            </div>
                            <li className="topic-item" onClick={(e) => displayOverviewOrSummary(e, 'summary')}>Summary</li>
                        </ul>
                    </nav>
                </aside>

                <main id="units-main-body">
                    <nav id="units-right-nav">
                        <ul id="units-right-nav-list">
                            {currentTopic ? (
                                <>
                                    <li className="units-current-topic-holder">{currentTopic?.name}</li>
                                    <li className="units-right-nav-divider">/</li>
                                    <li className="units-current-subtopic-holder">{currentSubTopicType}</li>
                                </>
                            ) : contentType === 'overview' ? (
                                <li className="units-current-topic-holder">Overview</li>
                            ) : contentType === 'summary' ? (
                                <li className="units-current-topic-holder">Summary</li>
                            ) : null
                            }
                        </ul>
                        <div id="custom-right-nav-border"></div>
                    </nav>

                    <div className="units-main-body-container">
                        <section id="units-right-content">
                            {displaySubTopicContent ? (
                                <UnitsBodyContent topic={currentTopic} currentSubTopic={currentSubTopic} subTopics={allCurrentSubTopics} />  
                            ) : (
                                <OverviewOrSummary contentType={contentType} unit={unit} />
                            )}
                        </section>

                        <Footer />
                    </div>
                </main>
            </div>
        </>
    )
}