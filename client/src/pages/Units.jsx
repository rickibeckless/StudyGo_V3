import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FetchContext } from "../context/FetchProvider.jsx";
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
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const { subjectId, classId, unitId } = useParams();
    
    const [currentTopic, setCurrentTopic] = useState(null);
    const [allCurrentSubTopics, setAllCurrentSubTopics] = useState([]);
    const [currentSubTopic, setCurrentSubTopic] = useState(null);
    const [currentSubTopicType, setCurrentSubTopicType] = useState(null);

    const [subject, setSubject] = useState([]);
    const [cls, setClass] = useState([]);
    const [unit, setUnit] = useState([]);
    const [nextUnit, setNextUnit] = useState([]);
    const [topics, setTopics] = useState([]);

    const [openSubtopicDropdown, setOpenSubtopicDropdown] = useState(false);
    const [displaySubTopicContent, setDisplaySubTopicContent] = useState(false);
    const [contentType, setContentType] = useState("overview");

    const toggleSubtopicDropdown = (e, topic) => {
        e.stopPropagation();
        setCurrentTopic(topic);

        let subTopics = [];
        subTopics.push(topic.lessons);
        subTopics.push(topic.notes);
        subTopics.push(topic.terms_defs);

        setAllCurrentSubTopics(subTopics);
        setOpenSubtopicDropdown(!openSubtopicDropdown);
    };

    const openSubTopic = async (e, currentTopic, subTopic) => {
        e.stopPropagation();
        setCurrentSubTopic(subTopic);

        if (subTopic === 'notes') {
            setCurrentSubTopicType('Notes');
        } else if (subTopic === 'terms_defs') {
            setCurrentSubTopicType('Terms/Definitions');
        } else {
            setCurrentSubTopicType('Lesson');
        };

        setDisplaySubTopicContent(true);
    };

    const displayOverviewOrSummary = (e, type) => {
        e.stopPropagation();
        setDisplaySubTopicContent(false);
        setContentType(type);
        setCurrentTopic(null);
    };

    const goToLastSubTopic = () => {
        if (!currentTopic) {
            if (contentType === 'overview') {
                setDisplaySubTopicContent(false);
                setContentType('summary');
            } else if (contentType === 'summary') {
                if (topics.length > 0) {
                    const lastTopic = topics[topics.length - 1];
                    setCurrentTopic(lastTopic);
    
                    const lastSubTopic = lastTopic.lessons?.length ? lastTopic.lessons[lastTopic.lessons.length - 1] : lastTopic.terms_defs?.length ? 'terms_defs' : lastTopic.notes?.length ? 'notes' : null;
    
                    if (lastSubTopic) {
                        setCurrentSubTopic(lastSubTopic);
                        setCurrentSubTopicType(lastTopic.lessons?.length ? 'Lesson' : lastTopic.terms_defs?.length ? 'Terms/Definitions' : 'Notes');
                    }
    
                    setDisplaySubTopicContent(true);
                } else {
                    setDisplaySubTopicContent(false);
                    setContentType('overview');
                }
            }
        } else {
            const flatSubTopics = [
                ...(currentTopic.notes?.length ? ['notes'] : []),
                ...(currentTopic.terms_defs?.length ? ['terms_defs'] : []),
                ...currentTopic.lessons
            ];
    
            const currentIndex = flatSubTopics.findIndex(subTopic => subTopic === currentSubTopic);
    
            if (currentIndex > 0) {
                const lastSubTopic = flatSubTopics[currentIndex - 1];
                setCurrentSubTopic(lastSubTopic);
                setCurrentSubTopicType(
                    lastSubTopic === 'notes'
                        ? 'Notes'
                        : lastSubTopic === 'terms_defs'
                        ? 'Terms/Definitions'
                        : 'Lesson'
                );
                setDisplaySubTopicContent(true);
            } else {
                const currentTopicIndex = topics.findIndex(topic => topic.unique_string_id === currentTopic.unique_string_id);
                const lastTopic = topics[currentTopicIndex - 1];
    
                if (lastTopic) {
                    setCurrentTopic(lastTopic);
    
                    const lastSubTopic = lastTopic.lessons?.length ? lastTopic.lessons[lastTopic.lessons.length - 1] : lastTopic.terms_defs?.length ? 'terms_defs' : lastTopic.notes?.length ? 'notes' : null;
    
                    if (lastSubTopic) {
                        setCurrentSubTopic(lastSubTopic);
                        setCurrentSubTopicType(
                            lastTopic.lessons?.length
                                ? 'Lesson'
                                : lastTopic.terms_defs?.length
                                ? 'Terms/Definitions'
                                : 'Notes'
                        );
                    }
    
                    setDisplaySubTopicContent(true);
                } else {
                    setDisplaySubTopicContent(false);
                    setContentType('overview');
                    setCurrentTopic(null);
                };
            };
        };
    };

    const goToNextSubTopic = () => {
        if (!currentTopic) {
            if (contentType === 'overview') {
                if (topics.length > 0) {
                    setCurrentTopic(topics[0]);
                    setCurrentSubTopic(topics[0].notes?.length ? 'notes' : topics[0].terms_defs?.length ? 'terms_defs' : topics[0].lessons[0]);
                    setCurrentSubTopicType(topics[0].notes?.length ? 'Notes' : topics[0].terms_defs?.length ? 'Terms/Definitions' : 'Lesson');
                    setDisplaySubTopicContent(true);
                } else {
                    setDisplaySubTopicContent(false);
                    setContentType('summary');
                };
            } else if (contentType === 'summary') {
                if (nextUnit) {
                    const confirmation = window.confirm("Are you sure you want to go to the next unit?");
                    
                    if (confirmation) {
                        navigate(`/units/${nextUnit.subjectid}/${nextUnit.classid}/${nextUnit.unique_string_id}`);
                    } else {
                        // navigate(`/${subjectId}/${classId}`);
                        return;
                    };
                } else {
                    setMessage("You have reached the end of the units for this class. You will now be redirected to the class page.");

                    setTimeout(() => {
                        setMessage("");
                        navigate(`/${subjectId}/${classId}`);
                    }, 5000);
                };
            };
        } else {
            const flatSubTopics = [
                ...(currentTopic.notes?.length ? ['notes'] : []),
                ...(currentTopic.terms_defs?.length ? ['terms_defs'] : []),
                ...currentTopic.lessons
            ];
        
            const currentIndex = flatSubTopics.findIndex(subTopic => subTopic === currentSubTopic);
        
            const nextSubTopic = flatSubTopics[currentIndex + 1];
        
            if (nextSubTopic) {
                setCurrentSubTopic(nextSubTopic);
        
                if (nextSubTopic === 'notes') {
                    setCurrentSubTopicType('Notes');
                } else if (nextSubTopic === 'terms_defs') {
                    setCurrentSubTopicType('Terms/Definitions');
                } else {
                    setCurrentSubTopicType('Lesson');
                };
        
                setDisplaySubTopicContent(true);
            } else {
                const currentTopicIndex = topics.findIndex(topic => topic.unique_string_id === currentTopic.unique_string_id);
                const nextTopic = topics[currentTopicIndex + 1];

                if (nextTopic) {
                    setCurrentTopic(nextTopic);
                    setCurrentSubTopic(nextTopic.notes?.length ? 'notes' : nextTopic.terms_defs?.length ? 'terms_defs' : nextTopic.lessons[0]);
                    setCurrentSubTopicType(nextTopic.notes?.length ? 'Notes' : nextTopic.terms_defs?.length ? 'Terms/Definitions' : 'Lesson');
                    setDisplaySubTopicContent(true);
                } else {
                    setDisplaySubTopicContent(false);
                    setContentType('summary');
                    setCurrentTopic(null);
                };
            };
        };
    };    

    useEffect(() => {
        async function fetchSubject() {
            try {
                const subject = await fetchWithRetry(`/api/subjects/${subjectId}`);
                //const subject = await res.json();
                setSubject(subject[0]);
                fetchClass();
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchClass() {
            try {
                const cls = await fetchWithRetry(`/api/classes/${subjectId}/${classId}`);
                //const cls = await res.json();
                setClass(cls[0]);
                fetchUnit();
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchUnit() {
            try {
                const unit = await fetchWithRetry(`/api/units/${subjectId}/${classId}/${unitId}`);
                //const unit = await res.json();
                setUnit(unit[0]);
                fetchTopics(unit[0]);
                fetchNextUnit(unit[0].unit_index);
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchTopics(unit) {
            try {
                const topics = await fetchWithRetry(`/api/topics/${subjectId}/${classId}/${unitId}`);
                //const topics = await res.json();
                setTopics(topics);
                setLoading(false);
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchNextUnit(currentUnitIndex) {
            try {
                const units = await fetchWithRetry(`/api/units/${subjectId}/${classId}`);
                //const units = await res.json();
                const nextUnit = units.find(unit => unit.unit_index === currentUnitIndex + 1);
                setNextUnit(nextUnit);
            } catch (error) {
                console.error(error);
            };
        };

        fetchSubject();
        setDisplaySubTopicContent(false);
        setContentType('overview');
        setCurrentTopic(null);
    }, [loading, subjectId, classId, unitId]);

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}
            <PageTitle title={`${unit.name} | StudyGo`} />

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
                                            <li key={topic.id} className="topic-item" onClick={(e) => toggleSubtopicDropdown(e, topic)}>
                                                {topic.name}
                                                <span className="sub-topic-total-index">
                                                    {topic.lessons?.length + (topic.notes ? 1 : 0) + (topic.terms_defs ? 1 : 0)}
                                                </span>
                                            </li>

                                            {currentTopic?.unique_string_id === topic.unique_string_id && (
                                                <ul className="topic-dropdown">
                                                    {currentTopic?.notes.length > 0 && (
                                                        <li className={`sub-topic-item ${currentSubTopic === 'notes' ? 'current-sub-topic' : ''}`} onClick={(e) => openSubTopic(e, currentTopic, 'notes')}>Notes</li>
                                                    )}
                                                    {currentTopic?.terms_defs.length > 0 && (
                                                        <li className={`sub-topic-item ${currentSubTopic === 'terms_defs' ? 'current-sub-topic' : ''}`} onClick={(e) => openSubTopic(e, currentTopic, 'terms_defs')}>Term/Definitions</li>
                                                    )}
                                                    {currentTopic?.lessons.length > 0 && (
                                                        <>
                                                            {currentTopic.lessons.map((lesson, index) => (
                                                                <li className={`sub-topic-item ${currentSubTopic === lesson ? 'current-sub-topic' : ''}`} onClick={(e) => openSubTopic(e, currentTopic, lesson)}>Lesson {++index}</li>
                                                            ))}
                                                        </>
                                                    )}
                                                </ul>
                                            )}
                                        </>
                                    ))
                                ) : null}
                            </div>
                            <li className="topic-item summary" onClick={(e) => displayOverviewOrSummary(e, 'summary')}>Summary</li>
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
                                    {currentSubTopicType === 'Lesson' ? (
                                        <li className="units-current-subtopic-holder">{currentSubTopic.name}</li>
                                    ) : (
                                        <li className="units-current-subtopic-holder">{currentSubTopicType}</li>
                                    )}
                                </>
                            ) : contentType === 'overview' ? (
                                <li className="units-current-topic-holder">Overview</li>
                            ) : contentType === 'summary' ? (
                                <li className="units-current-topic-holder">Summary</li>
                            ) : null
                            }

                            <li className="nav-sub-topic-btn-holder">
                                <button type="button" className="nav-sub-topic-btn" onClick={() => goToLastSubTopic()}>Back</button>
                                <button type="button" className="nav-sub-topic-btn" onClick={() => goToNextSubTopic()}>Next</button>
                            </li>
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
    );
};