import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../LoadingScreen';
import MessagePopup from '../MessagePopup';

import '../../styles/newLesson.css';

export default function NewSubjectModal({ toggleAddForm }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [invalidFields, setInvalidFields] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const res = await fetch(`/api/subjects/`);
                let data = await res.json();

                if (data) {
                    setSubjects(data);
                };
            } catch (error) {
                console.error(`Error fetching subjects: ${error.message}`);
            };
        };

        fetchSubjects();
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.description) {
            setMessage("Please fill out all fields");
            setInvalidFields({
                name: !formData.name,
                description: !formData.description
            });
            return;
        };

        try {
            const res = await fetch(`api/subjects/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.error) {
                setMessage(data.error);
            } else {
                setSubjects([...subjects, data]);
                setFormData({
                    name: '',
                    description: ''
                });
                toggleAddForm();
            };
        } catch (error) {
            setMessage(`Error adding subject: ${error.message}`);
            console.error(error.message);
        };

        setLoading(false);
    };

    return (
        <>
            {loading && <LoadingScreen />}
            <div id="modalOverlay"></div>
            <div id="add-lesson-modal" className="modal">
                {message && <MessagePopup message={message} setMessage={setMessage} />}

                <div className="modal-header">
                    <h2>Add Subject</h2>
                    <h4>You're adding a new subject!</h4>
                    <button onClick={toggleAddForm} className="modal-close-button">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`new-lesson-form-input-holder ${invalidFields.name ? "invalid-field" : ""}`}>
                        <label htmlFor="subject-name" className="form-label">Subject Name:</label>
                        <input type="text" placeholder="Subject name" id="subject-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.description ? "invalid-field" : ""}`}>
                        <label htmlFor="subject-description" className="form-label">Subject Description:</label>
                        <textarea placeholder="Subject description" id="subject-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder`}>
                        <div className="current-units-holder">
                            <h4>Current Subjects:</h4>
                            <ol>
                                {subjects.map((subject) => (
                                    <li key={subject.unique_string_id}>{subject.name}</li>
                                ))}
                            </ol>
                            <p>REMINDER: subjects have no index/specific order!</p>
                        </div>
                    </div>
                    <button type="submit" id="add-lesson-modal-submit-button">Add Subject</button>
                </form>
            </div>
        </>
    );
};