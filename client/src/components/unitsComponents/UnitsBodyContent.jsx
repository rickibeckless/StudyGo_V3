import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faStar, faPenToSquare, faPlus } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import '../../styles/unitsBody.css';

export default function UnitsBodyContent({ topic, currentSubTopic, subTopics, refreshTopic }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(false);
    }, []);

    const [noteForm, setNoteForm] = useState({
        content: ''
    });

    const handleNoteChange = (e) => {
        const { name, value } = e.target;
        setNoteForm((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const addNewNote = async (e) => {
        e.preventDefault();

        console.log(noteForm.content);

        try { // /api/topics/:subjectId/:classId/:unitId/:topicId/new/note
            const res = await fetch(`/api/topics/${topic.subjectid}/${topic.classid}/${topic.unitid}/${topic.unique_string_id}/new/note`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note: [noteForm.content] })
            });

            const data = await res.json();

            if (res.ok) {
                refreshTopic();
                setMessage("Note added successfully");
            } else {
                setMessage(data.message);
            }

            setNoteForm({ content: '' });
        } catch (error) {
            setMessage(error.message);
        };
    };

    const sanitizedHTML = DOMPurify.sanitize(currentSubTopic?.lesson_content);

    return (
        <>
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            {currentSubTopic === 'notes' ? (
                <>
                    {topic?.notes?.map((note, index) => (
                        <ul className="note-holder">
                            <button className="sub-topic-btn star-btn note-star-btn" type="button">
                                <FontAwesomeIcon icon={faStar} />
                            </button>

                            <li key={index} className="note">{note}</li>

                            <span className="note-btn-holder">
                                <button className="sub-topic-btn edit-sub-topic-btn" type="button">
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>

                                <button className="sub-topic-btn delete-sub-topic-btn" type="button">
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            </span>
                        </ul>
                    ))}

                    <ul className="note-holder">
                        <li className="note">
                            <input type="text" className="add-sub-topic-input add-note-input" placeholder="new note..." name="content" value={noteForm.content} onChange={handleNoteChange} />
                        </li>
                        <button className="sub-topic-btn add-sub-topic-btn add-note-btn" type="button" onClick={(e) => addNewNote(e)}>
                            <FontAwesomeIcon icon={faPlus} />
                        </button>
                    </ul>
                </>
            ) : currentSubTopic === 'terms_defs' ? (
                <>
                    {topic.terms_defs?.map((term_def, index) => (
                        <ul className="termdef-holder">
                            <h4 key={index} className="term">{term_def.term}</h4>
                            <ul className="definition-holder">
                                {Array.isArray(term_def.definition) ? (
                                    term_def.definition.map((definition, index) => (
                                        <li key={index} className="definition">
                                            <button type="button" className="sub-topic-btn star-btn term-def-btn">
                                                <FontAwesomeIcon icon={faStar} />
                                            </button>

                                            {definition}

                                            <span className="term-def-btn-holder">
                                                <button className="sub-topic-btn edit-sub-topic-btn term-def-btn" type="button">
                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                </button>

                                                <button className="sub-topic-btn delete-sub-topic-btn term-def-btn" id="delete-def-btn" type="button">
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                </button>
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="definition">
                                        <button type="button" className="sub-topic-btn star-btn term-def-btn">
                                            <FontAwesomeIcon icon={faStar} />
                                        </button>

                                        {term_def.definition}

                                        <span className="term-def-btn-holder">
                                            <button className="sub-topic-btn edit-sub-topic-btn term-def-btn" type="button">
                                                <FontAwesomeIcon icon={faPenToSquare} />
                                            </button>

                                            <button className="sub-topic-btn delete-sub-topic-btn term-def-btn" id="delete-def-btn" type="button">
                                                <FontAwesomeIcon icon={faTrashCan} />
                                            </button>
                                        </span>
                                    </li>
                                )}
                                <li className="definition">
                                    <input type="text" className="add-sub-topic-input" placeholder="new definition..." />
                                    <button className="sub-topic-btn add-sub-topic-btn term-def-btn" id="add-def-btn" type="button">
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </li>
                            </ul>
                            <button className="sub-topic-btn delete-sub-topic-btn term-def-btn" id="delete-term-def-btn" type="button">
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </ul>
                    ))}
                    <ul className="termdef-holder">
                        <input type="text" className="add-sub-topic-input" placeholder="new term..." />
                        <ul className="definition-holder">
                            <li className="definition">
                                <input type="text" className="add-sub-topic-input" placeholder="new definition..." />
                                <button className="sub-topic-btn add-sub-topic-btn term-def-btn" id="add-def-btn" type="button">
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </li>
                        </ul>
                    </ul>
                </>
            ) : currentSubTopic ? (
                <div className="lesson-holder">
                    <h2 className="lesson-title">{currentSubTopic.name}</h2>
                    <p className="lesson-description">{currentSubTopic.description}</p>
                    <div className="lesson-content" dangerouslySetInnerHTML={{ __html: sanitizedHTML }}></div>
                </div>
            ) : null 
            }
        </>
    );
};