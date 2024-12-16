import { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingScreen from '../LoadingScreen';
import MessagePopup from '../MessagePopup';

import '../../styles/newLesson.css';

export default function AddLessonModal({ toggleAddForm, topic }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [invalidFields, setInvalidFields] = useState({});
    const [lessonForm, setLessonForm] = useState({
        name: "",
        description: "",
        lesson_content: "",
    });

    const modules = {
        toolbar: {
            container: '#toolbar',
        },
    };

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'header',
        'list', 'bullet', 'indent', 'link', 'image', 'video', 'color', 'background',
        'code', 'code-block', 'align', 'direction', 'script'
    ];

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!lessonForm.name || !lessonForm.description || !lessonForm.lesson_content) {
            setMessage("Please fill out all fields");
            setInvalidFields({
                name: !lessonForm.name,
                description: !lessonForm.description,
                lesson_content: !lessonForm.lesson_content,
            });
            return;
        };

        try {
            const res = await fetch(`/api/topics/${topic.unique_string_id}/new/lesson`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(lessonForm),
            });
            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage("Lesson added successfully");
                setLessonForm({
                    name: "",
                    description: "",
                    lesson_content: "",
                });
                toggleAddForm();
            };
        } catch (error) {
            setMessage("Error adding lesson");
            console.error(`Error adding lesson: ${error.message}`);
        };
    };

    return (
        <>
            {loading && <LoadingScreen />}
            <div id="modalOverlay"></div>
            <div id="add-lesson-modal" className="modal">
                {message && <MessagePopup message={message} setMessage={setMessage} />}
                
                <div className="modal-header">
                    <h2>Add Lesson</h2>
                    <h4>You're adding a lesson to: <span id="add-lesson-modal-topic-name">{topic.name}</span></h4>
                    <button onClick={toggleAddForm} className="modal-close-button">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`new-lesson-form-input-holder ${invalidFields.name ? "invalid-field" : ""}`}>
                        <label htmlFor="lesson-name" className="form-label">Lesson Name:</label>
                        <input type="text" placeholder="Lesson name" id="lesson-name" value={lessonForm.name} onChange={(e) => setLessonForm({ ...lessonForm, name: e.target.value })} />
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.description ? "invalid-field" : ""}`}>
                        <label htmlFor="lesson-description" className="form-label">Lesson Description:</label>
                        <textarea placeholder="Lesson description" id="lesson-description" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.lesson_content ? "invalid-field" : ""}`}>
                        <p className="form-label">Lesson Content:</p>
                        <div id="toolbar">
                            <span className="ql-formats">
                                <button className="ql-bold"></button>
                                <button className="ql-italic"></button>
                                <button className="ql-underline"></button>
                                <button className="ql-strike"></button>
                            </span>
                            <span className="ql-formats">
                                <select className="ql-header">
                                    <option value="1"></option>
                                    <option value="2"></option>
                                    <option value="3"></option>
                                    <option defaultValue=""></option>
                                </select>
                                <button className="ql-blockquote"></button>
                                <button className="ql-code-block"></button>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-list" value="ordered"></button>
                                <button className="ql-list" value="bullet"></button>
                                <button className="ql-indent" value="-1"></button>
                                <button className="ql-indent" value="+1"></button>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-link"></button>
                                <button className="ql-image"></button>
                                <button className="ql-video"></button>
                            </span>
                            <span className="ql-formats">
                                <select className="ql-color"></select>
                                <select className="ql-background"></select>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-clean"></button>
                            </span>
                            <span className="ql-formats">
                                <select className="ql-align"></select>
                                <button className="ql-direction" value="rtl"></button>
                                <button className="ql-script" value="sub"></button>
                                <button className="ql-script" value="super"></button>
                            </span>
                        </div>

                        <ReactQuill formats={formats} modules={modules} theme="snow" value={lessonForm.lesson_content} onChange={(e) => setLessonForm({ ...lessonForm, lesson_content: e })} />
                    </div>
                    <button type="submit" id="add-lesson-modal-submit-button">Add Lesson</button>
                </form>
            </div>
        </>
    );
};