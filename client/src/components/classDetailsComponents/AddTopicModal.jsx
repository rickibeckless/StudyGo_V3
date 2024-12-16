import { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../LoadingScreen';
import MessagePopup from '../MessagePopup';

import '../../styles/newLesson.css';

export default function AddTopicModal({ toggleAddForm, unit }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [topics, setTopics] = useState([]);
    const [usedIndexes, setUsedIndexes] = useState([]);
    const [invalidFields, setInvalidFields] = useState({});
    const [topicForm, setTopicForm] = useState({
        name: "",
        description: "",
        topic_index: null,
    });

    useEffect(() => {
        async function fetchTopics() {
            try {
                const res = await fetch(`/api/topics/${unit.unique_string_id}`);
                let data = await res.json();
                data = data.sort((a, b) => a.topic_index - b.topic_index);
                setTopics(data);
                setUsedIndexes(data.map((topic) => topic.topic_index));
            } catch (error) {
                console.error(`Error fetching topics: ${error.message}`);
            };
        };

        fetchTopics();
        setLoading(false);
    }, []);

    const handleIndexChange = (e) => {
        setTopicForm({ ...topicForm, topic_index: e.target.value });

        if (usedIndexes.includes(parseInt(e.target.value))) {
            setInvalidFields({ topic_index: true });
        } else {
            setInvalidFields({ topic_index: false });
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!topicForm.name || !topicForm.description || !topicForm.topic_index) {
            setMessage("Please fill out all fields");
            setInvalidFields({
                name: !topicForm.name,
                description: !topicForm.description,
                topic_index: !topicForm.topic_index,
            });
            return;
        };

        if (usedIndexes.includes(parseInt(topicForm.topic_index))) {
            setMessage("Topic index already in use");
            setInvalidFields({ topic_index: true });
            return;
        };

        try {
            const res = await fetch(`/api/topics/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}/new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(topicForm),
            });
            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage("Topic added successfully");
                setTopicForm({
                    name: "",
                    description: "",
                    topic_index: null,
                });
                toggleAddForm();
            };
        } catch (error) {
            setMessage("Error adding topic");
            console.error(`Error adding topic: ${error.message}`);
        };
    };

    return (
        <>
            {loading && <LoadingScreen />}
            <div id="modalOverlay"></div>
            <div id="add-lesson-modal" className="modal">
                {message && <MessagePopup message={message} setMessage={setMessage} />}
                
                <div className="modal-header">
                    <h2>Add Topic</h2>
                    <h4>You're adding a topic to: <span id="add-lesson-modal-topic-name">{unit.name}</span></h4>
                    <button onClick={toggleAddForm} className="modal-close-button">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`new-lesson-form-input-holder ${invalidFields.name ? "invalid-field" : ""}`}>
                        <label htmlFor="topic-name" className="form-label">Topic Name:</label>
                        <input type="text" placeholder="Topic name" id="topic-name" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} />
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.description ? "invalid-field" : ""}`}>
                        <label htmlFor="topic-description" className="form-label">Topic Description:</label>
                        <textarea placeholder="Topic description" id="topic-description" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.topic_index ? "invalid-field" : ""}`}>
                        <label htmlFor="topic-index" className="form-label">Topic Index:</label>
                        <input type="number" placeholder="Topic index" id="topic-index" min="1" value={topicForm.topic_index} onChange={(e) => handleIndexChange(e)} />

                        <div className="current-units-holder">
                            <h4>Current Topics:</h4>
                            <ol>
                                {topics.map((topic) => (
                                    <li key={topic.unique_string_id}>{topic.name}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                    <button type="submit" id="add-lesson-modal-submit-button">Add Topic</button>
                </form>
            </div>
        </>
    );
};