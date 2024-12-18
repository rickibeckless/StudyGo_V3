import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../LoadingScreen';
import MessagePopup from '../MessagePopup';

import '../../styles/newLesson.css';

export default function NewClassModal({ subject, toggleAddForm }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [usedIndexes, setUsedIndexes] = useState([]);
    const [invalidFields, setInvalidFields] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        class_index: ''
    });

    useEffect(() => {
        async function fetchClasses() {
            try {
                const res = await fetch(`/api/classes/${subject.unique_string_id}`);
                let data = await res.json();

                if (data) {
                    data = data.sort((a, b) => a.class_index - b.class_index);
                    setClasses(data);
                    setUsedIndexes(data.map((cls) => cls.class_index));
                };
            } catch (error) {
                console.error(`Error fetching classes: ${error.message}`);
            };
        };

        fetchClasses();
        setLoading(false);
    }, []);

    const handleIndexChange = (e) => {
        setFormData({ ...formData, class_index: e.target.value });

        if (usedIndexes.includes(parseInt(e.target.value))) {
            setInvalidFields({ class_index: true });
        } else {
            setInvalidFields({ class_index: false });
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.name || !formData.description || !formData.class_index) {
            setMessage("Please fill out all fields");
            setInvalidFields({
                name: !formData.name,
                description: !formData.description,
                class_index: !formData.class_index,
            });
            return;
        };

        if (usedIndexes.includes(parseInt(formData.class_index))) {
            setMessage("Class index already in use");
            setInvalidFields({ class_index: true });
            return;
        };

        try {
            const res = await fetch(`api/classes/${subject.unique_string_id}/new`, {
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
                setClasses([...classes, data]);
                setUsedIndexes([...usedIndexes, data.class_index]);
                setFormData({
                    name: '',
                    description: '',
                    class_index: ''
                });
                toggleAddForm();
            };
        } catch (error) {
            setMessage("Problem adding class: ", error);
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
                    <h2>Add Class</h2>
                    <h4>You're adding a class to: <span id="add-lesson-modal-topic-name">{subject.name}</span></h4>
                    <button onClick={toggleAddForm} className="modal-close-button">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`new-lesson-form-input-holder ${invalidFields.name ? "invalid-field" : ""}`}>
                        <label htmlFor="cls-name" className="form-label">Class Name:</label>
                        <input type="text" placeholder="Class name" id="cls-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.description ? "invalid-field" : ""}`}>
                        <label htmlFor="cls-description" className="form-label">Class Description:</label>
                        <textarea placeholder="Class description" id="cls-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.class_index ? "invalid-field" : ""}`}>
                        <label htmlFor="cls-index" className="form-label">Class Index:</label>
                        <input type="number" placeholder="Class index" id="cls-index" min="1" value={formData.class_index} onChange={(e) => handleIndexChange(e)} />

                        <div className="current-units-holder">
                            <h4>Current Classes:</h4>
                            <ol>
                                {classes.map((cls) => (
                                    <li key={cls.unique_string_id}>{cls.name}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                    <button type="submit" id="add-lesson-modal-submit-button">Add Class</button>
                </form>
            </div>
        </>
    );
};