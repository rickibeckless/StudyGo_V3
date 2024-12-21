import { useState } from "react";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faStar, faPenToSquare, faPlus, faBan } from '@fortawesome/free-solid-svg-icons';
import MessagePopup from "../MessagePopup.jsx";
import '../../styles/unitsBody.css';

export default function UnitsBodyContent({ topic, currentSubTopic, refreshTopic }) {
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

    const [editCurrentTermDef, setEditCurrentTermDef] = useState(false);
    const [isEditingTermDef, setIsEditingTermDef] = useState(false);
    const [termDefToEdit, setTermDefToEdit] = useState(null);
    const [termDefForm, setTermDefForm] = useState({
        term: '',
        definition: []
    });
    const [editTermDefForm, setEditTermDefForm] = useState({
        termid: '',
        definition: []
    });

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

    const toggleEditEvent = (e, type) => {
        e.preventDefault();
        if (type === "termdef") setEditCurrentTermDef(!editCurrentTermDef);
        if (type === "note") setEditCurrentNote(!editCurrentNote);
    };

    const handleEditClick = (type, data) => {
        if (type === "note") {
            setIsEditing(true);
            setNoteToEdit(data);
            setEditNoteForm({
                text: data.text,
                starred: data.starred
            });
            setEditCurrentNote(!editCurrentNote);
        } else if (type === "termdef") {
            setIsEditingTermDef(true);
            setTermDefToEdit(data);
            setEditTermDefForm({
                termid: data.termid,
                definition: data.definition
            });
            setEditCurrentTermDef(!editCurrentTermDef);
        };
    };

    const handleDeleteClick = async (type, dataInfo) => {
        try {
            const res = await fetch(`/api/topics/${topic.subjectid}/${topic.classid}/${topic.unitid}/${topic.unique_string_id}/delete/${type}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dataInfo })
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

    const handleChange = (e, type, change) => {
        let { name, value } = e.target;

        if (name === "definition" && type === "termdef" && change !== "edit") {
            value = value.split('\n');
        };

        let params = (prevData) => ({
            ...prevData,
            [name]: value
        });

        if (type === "note") change === "update" ? setEditNoteForm(params) : setNoteForm(params);
        if (type === "termdef") {
            if (change === "update") {
                setEditTermDefForm(
                    (prevData) => ({
                        ...prevData,
                        termid: e.target.dataset.termid,
                        [name]: value
                    })
                );

                setIsEditingTermDef(true);
            } else if (change === "edit") {
                setEditTermDefForm(
                    (prevData) => ({
                        ...prevData,
                        termid: e.target.dataset.termid,
                        originaldef: e.target.dataset.originaldef,
                        definition: value
                    })
                );
            } else {
                setTermDefForm(params);
            };
        };
    };

    const handleSubmit = async (e, type, change) => {
        e.preventDefault();

        try {
            let form = {};
            let body = {};

            if (type === "note") {
                form = noteForm;
                body = isEditing ? { oldNote: noteToEdit, newNote: editNoteForm } : { note: form };

                if ((isEditing && !noteToEdit.text) || (!isEditing && !noteForm.text)) {
                    setMessage("Note cannot be empty");
                    return;
                };
            } else if (type === "termdef") {
                form = termDefForm;
                body = isEditingTermDef ? { termdef: editTermDefForm } : { termdef: form };

                if ((isEditingTermDef && (!editTermDefForm.termid || (editTermDefForm.definition.length === 0))) || (!isEditingTermDef && (!termDefForm.term || (termDefForm.definition.length === 0)))) {
                    setMessage("Term and/or definition cannot be empty");
                    return;
                };
            };

            const res = await fetch(`/api/topics/${topic.subjectid}/${topic.classid}/${topic.unitid}/${topic.unique_string_id}/${change}/${type}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                if (type === "note") {
                    setNoteForm({ text: '', starred: false });
                    setEditNoteForm({ text: '', starred: false });
                    setIsEditing(false);
                    setEditCurrentNote(false);
                    setNoteToEdit(null);

                    setMessage(isEditing ? "Note updated successfully" : "Note added successfully");
                } else if (type === "termdef") {
                    setTermDefForm({ term: '', definition: [] });
                    setEditTermDefForm({ termid: '', definition: [] });
                    setIsEditingTermDef(false);
                    setEditCurrentTermDef(false);
                    setTermDefToEdit(null);

                    setMessage(isEditingTermDef ? "Term and definition updated successfully" : "Term and definition added successfully");
                };

                refreshTopic();
            } else {
                setMessage(data.message);
            };
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
                    {topic?.notes?.length > 0 ? (
                        topic?.notes?.map((note, index) => (
                            <ul className="note-holder">
                                <button className={`sub-topic-btn star-btn note-star-btn ${note.starred === true ? 'starred' : ''}`} type="button" onClick={() => handleStarClick(note)}>
                                    <FontAwesomeIcon icon={faStar} />
                                </button>

                                {editCurrentNote ? (
                                    noteToEdit === note ? (
                                        <span className="edit-note-holder">
                                            <li className="note">
                                                <input type="text" className="add-sub-topic-input add-note-input" placeholder="edit note..." name="text" value={editNoteForm.text || ''} onChange={(e) => handleChange(e, 'note', 'update')} />
                                            </li>

                                            <span className="note-btn-holder">
                                                <button className="sub-topic-btn delete-sub-topic-btn" type="button" onClick={(e) => toggleEditEvent(e, "note")}>
                                                    <FontAwesomeIcon icon={faBan} />
                                                </button>
                                                <button className="sub-topic-btn edit-sub-topic-btn" type="button" onClick={(e) => handleSubmit(e, "note", "update")}>
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
                                            <button className="sub-topic-btn edit-sub-topic-btn" type="button" onClick={() => handleEditClick("note", note)}>
                                                <FontAwesomeIcon icon={faPenToSquare} />
                                            </button>

                                            <button className="sub-topic-btn delete-sub-topic-btn" type="button" onClick={() => handleDeleteClick("note", note)}>
                                                <FontAwesomeIcon icon={faTrashCan} />
                                            </button>
                                        </span>
                                    </>
                                )}
                            </ul>
                        ))
                    ) : (
                        <ul className="note-holder">
                            <button className="sub-topic-btn star-btn note-star-btn starred" type="button">
                                <FontAwesomeIcon icon={faStar} />
                            </button>

                            <li className="note default-subtopic">Got some information to remember? Add some notes!</li>
                        </ul>
                    )}

                    <ul className="note-holder">
                        <li className="note">
                            {editCurrentNote ? (
                                <input type="text" className="add-sub-topic-input add-note-input" placeholder="new note..." />

                            ) : (
                                <input type="text" className="add-sub-topic-input add-note-input" placeholder="new note..." name="text" value={noteForm.text} onChange={(e) => handleChange(e, 'note', 'add')} />
                            )}
                        </li>
                        <button className="sub-topic-btn add-sub-topic-btn add-note-btn" type="button" onClick={(e) => handleSubmit(e, "note", "new")}>
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
                                            {editCurrentTermDef ? (
                                                termDefToEdit.definition === definition ? (
                                                    <>
                                                        <input type="text" className="add-sub-topic-input" placeholder={`Edit Definition for '${term_def.term}'`} name="definition" data-termid={`${term_def.unique_string_id}`} data-originaldef={`${definition}`} value={editTermDefForm.definition || ''} onChange={(e) => handleChange(e, 'termdef', 'edit')} />
                                                        <button className="sub-topic-btn delete-sub-topic-btn" type="button" onClick={(e) => toggleEditEvent(e, "termdef")}>
                                                            <FontAwesomeIcon icon={faBan} />
                                                        </button>
                                                        <button className="sub-topic-btn add-sub-topic-btn term-def-btn" id="add-def-btn" type="button" onClick={(e) => handleSubmit(e, "termdef", "update")}>
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    definition
                                                )
                                            ) : (
                                                <>
                                                    {definition}

                                                    <span className="term-def-btn-holder">
                                                        <button className="sub-topic-btn edit-sub-topic-btn term-def-btn" type="button" onClick={() => handleEditClick("termdef", { termid: term_def.unique_string_id, definition })}>
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                        </button>

                                                        <button className="sub-topic-btn delete-sub-topic-btn term-def-btn" id="delete-def-btn" type="button" onClick={() => handleDeleteClick("termdef", { termid: term_def.unique_string_id, definition })}>
                                                            <FontAwesomeIcon icon={faTrashCan} />
                                                        </button>
                                                    </span>
                                                </>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="definition">
                                        {editCurrentTermDef ? (
                                            termDefToEdit.definition === term_def.definition ? (
                                                <>
                                                    <input type="text" className="add-sub-topic-input" placeholder={`Edit Definition for '${term_def.term}'`} name="definition" data-termid={`${term_def.unique_string_id}`} data-originaldef={`${term_def.definition}`} value={editTermDefForm.definition || ''} onChange={(e) => handleChange(e, 'termdef', 'edit')} />
                                                    <button className="sub-topic-btn delete-sub-topic-btn" type="button" onClick={(e) => toggleEditEvent(e, "termdef")}>
                                                        <FontAwesomeIcon icon={faBan} />
                                                    </button>
                                                    <button className="sub-topic-btn add-sub-topic-btn term-def-btn" id="add-def-btn" type="button" onClick={(e) => handleSubmit(e, "termdef", "update")}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                </>
                                            ) : (
                                                term_def.definition
                                            )
                                        ) : (
                                            <>
                                                {term_def.definition}

                                                <span className="term-def-btn-holder">
                                                    <button className="sub-topic-btn edit-sub-topic-btn term-def-btn" type="button" onClick={() => handleEditClick("termdef", { termid: term_def.unique_string_id, definition: term_def.definition })}>
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                    </button>

                                                    <button className="sub-topic-btn delete-sub-topic-btn term-def-btn" id="delete-def-btn" type="button" onClick={() => handleDeleteClick("termdef", { termid: term_def.unique_string_id, definition: term_def.definition })}>
                                                        <FontAwesomeIcon icon={faTrashCan} />
                                                    </button>
                                                </span>
                                            </>
                                        )}
                                    </li>
                                )}
                                <li className="definition">
                                    {editTermDefForm.termid === term_def.unique_string_id ? (
                                        <input type="text" className="add-sub-topic-input" placeholder={`New Definition for '${term_def.term}'`} name="definition" data-termid={`${term_def.unique_string_id}`} value={editTermDefForm.definition || ''} onChange={(e) => handleChange(e, 'termdef', 'update')} />
                                    ) : (
                                        <input type="text" className="add-sub-topic-input" placeholder={`New Definition for '${term_def.term}'`} name="definition" data-termid={`${term_def.unique_string_id}`} value='' onChange={(e) => handleChange(e, 'termdef', 'update')} />
                                    )}
                                    <button className="sub-topic-btn add-sub-topic-btn term-def-btn" id="add-def-btn" type="button" onClick={(e) => handleSubmit(e, "termdef", "update")}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </li>
                            </ul>
                            <button className="sub-topic-btn delete-sub-topic-btn term-def-btn" id="delete-term-def-btn" type="button" onClick={() => handleDeleteClick("termdef", { termid: term_def.unique_string_id })}>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                        </ul>
                    ))}
                    <div className="termdef-holder">
                        <input type="text" className="add-sub-topic-input" placeholder="new term..." name="term" value={termDefForm.term} onChange={(e) => handleChange(e, 'termdef', 'add')} />
                        <ul className="definition-holder">
                            <li className="definition">
                                <textarea className="add-sub-topic-input" placeholder="Separate each new definition with a new line (e.g: Enter)" name="definition" onChange={(e) => handleChange(e, 'termdef', 'add')}></textarea>
                                <button className="sub-topic-btn add-sub-topic-btn term-def-btn" id="add-def-btn" type="button" title="Add" onClick={(e) => handleSubmit(e, "termdef", "new")}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </li>
                        </ul>
                    </div>
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