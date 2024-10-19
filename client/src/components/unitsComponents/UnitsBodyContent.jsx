import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faStar, faPenToSquare, faPlus, faBan } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import '../../styles/unitsBody.css';

export default function UnitsBodyContent({ topic, currentSubTopic, subTopics, refreshTopic }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [editCurrentNote, setEditCurrentNote] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState(null);
    const [noteForm, setNoteForm] = useState({
        text: '',
        starred: false
    });
    const [editNoteForm, setEditNoteForm] = useState({
        text: '',
        starred: false
    });

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleStarClick = async (note) => {
        try {
            const res = await fetch(`/api/topics/${topic.subjectid}/${topic.classid}/${topic.unitid}/${topic.unique_string_id}/star/note`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note })
            });

            const data = await res.json();

            if (res.ok) {
                refreshTopic();
                setMessage(data.message);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage(error.message);
        };
    };

    const toggleEditEvent = (e) => {
        e.preventDefault();
        setEditCurrentNote(!editCurrentNote);
    };

    const handleEditClick = (note) => {
        setIsEditing(true);
        setNoteToEdit(note);
        setEditNoteForm({
            text: note.text,
            starred: note.starred
        });
        setEditCurrentNote(!editCurrentNote);
    };

    const handleDeleteClick = async (note) => {
        try {
            const res = await fetch(`/api/topics/${topic.subjectid}/${topic.classid}/${topic.unitid}/${topic.unique_string_id}/delete/note`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note })
            });

            const data = await res.json();

            if (res.ok) {
                refreshTopic();
                setMessage(data.message);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage(error.message);
        };
    };

    const handleNoteChange = (e, type) => {
        const { name, value } = e.target;

        if (type === 'edit') {
            setEditNoteForm((prevData) => ({
                ...prevData,
                [name]: value
            }));
        } else if (type === 'add') {
            setNoteForm((prevData) => ({
                ...prevData,
                [name]: value
            }));
        };
    };

    const addNewNote = async (e) => {
        e.preventDefault();

        if (isEditing && !noteToEdit.text) {
            setMessage("Note cannot be empty");
            return;
        };

        if (!isEditing && !noteForm.text) {
            setMessage("Note cannot be empty");
            return;
        };
    
        try {
            let url = '';
            let method = '';
            let body = {};
    
            if (isEditing) {
                url = `/api/topics/${topic.subjectid}/${topic.classid}/${topic.unitid}/${topic.unique_string_id}/update/note`;
                method = 'PATCH';
                body = {
                    oldNote: noteToEdit,
                    newNote: editNoteForm
                };
            } else {
                url = `/api/topics/${topic.subjectid}/${topic.classid}/${topic.unitid}/${topic.unique_string_id}/new/note`;
                method = 'PATCH';
                body = { note: noteForm };
            }
    
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            });
    
            const data = await res.json();
    
            if (res.ok) {
                refreshTopic();
                setMessage(isEditing ? "Note updated successfully" : "Note added successfully");
            } else {
                setMessage(data.message);
            }

            setNoteForm({ text: '', starred: false });
            setEditNoteForm({ text: '', starred: false });
            setIsEditing(false);
            setEditCurrentNote(false);
            setNoteToEdit(null);
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
                            <button className={`sub-topic-btn star-btn note-star-btn ${note.starred === true ? 'starred' : ''}`} type="button" onClick={() => handleStarClick(note)}>
                                <FontAwesomeIcon icon={faStar} />
                            </button>

                            {editCurrentNote ? (
                                noteToEdit === note ? (
                                    <span className="edit-note-holder">
                                        <li className="note">
                                            <input type="text" className="add-sub-topic-input add-note-input" placeholder="edit note..." name="text" value={editNoteForm.text || ''} onChange={(e) => handleNoteChange(e, 'edit')} />
                                        </li>
                                        
                                        <span className="note-btn-holder">
                                            <button className="sub-topic-btn delete-sub-topic-btn" type="button" onClick={(e) => toggleEditEvent(e)}>
                                                <FontAwesomeIcon icon={faBan} />
                                            </button>
                                            <button className="sub-topic-btn edit-sub-topic-btn" type="button" onClick={(e) => addNewNote(e)}>
                                                <FontAwesomeIcon icon={faPlus} />
                                            </button>
                                        </span>
                                    </span>
                                ) : (
                                    <li key={index} className="note">{note.text}</li>
                                )
                            ) : (
                                <>
                                    <li key={index} className="note">{note.text}</li>
                                
                                    <span className="note-btn-holder">
                                        <button className="sub-topic-btn edit-sub-topic-btn" type="button" onClick={() => handleEditClick(note)}>
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>

                                        <button className="sub-topic-btn delete-sub-topic-btn" type="button" onClick={() => handleDeleteClick(note)}>
                                            <FontAwesomeIcon icon={faTrashCan} />
                                        </button>
                                    </span>
                                </>
                            )}
                        </ul>
                    ))}

                    <ul className="note-holder">
                        <li className="note">
                            {editCurrentNote ? (
                                <input type="text" className="add-sub-topic-input add-note-input" placeholder="new note..." />

                            ) : (
                                <input type="text" className="add-sub-topic-input add-note-input" placeholder="new note..." name="text" value={noteForm.text} onChange={(e) => handleNoteChange(e, 'add')} />
                            )}
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