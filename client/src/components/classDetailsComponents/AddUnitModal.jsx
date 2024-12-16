import { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from '../LoadingScreen';
import MessagePopup from '../MessagePopup';

import '../../styles/newLesson.css';

export default function AddUnitModal({ toggleAddForm, cls }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [units, setUnits] = useState([]);
    const [usedIndexes, setUsedIndexes] = useState([]);
    const [invalidFields, setInvalidFields] = useState({});
    const [unitForm, setUnitForm] = useState({
        name: "",
        description: "",
        learning_objectives: "",
        unit_outcomes: "",
        prerequisites: "",
        unit_index: null,
    });

    useEffect(() => {
        async function fetchUnits() {
            try {
                const res = await fetch(`/api/units/${cls.subjectid}/${cls.unique_string_id}`);
                let data = await res.json();
                data = data.sort((a, b) => a.unit_index - b.unit_index);
                setUnits(data);
                setUsedIndexes(data.map((unit) => unit.unit_index));
            } catch (error) {
                console.error(`Error fetching units: ${error.message}`);
            };
        };

        fetchUnits();
        setLoading(false);
    }, []);

    const handleIndexChange = (e) => {
        setUnitForm({ ...unitForm, unit_index: e.target.value });

        if (usedIndexes.includes(parseInt(e.target.value))) {
            setInvalidFields({ unit_index: true });
        } else {
            setInvalidFields({ unit_index: false });
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!unitForm.name || !unitForm.description || !unitForm.learning_objectives || !unitForm.unit_outcomes || !unitForm.prerequisites || !unitForm.unit_index) {
            setMessage("Please fill out all fields");
            setInvalidFields({
                name: !unitForm.name,
                description: !unitForm.description,
                learning_objectives: !unitForm.learning_objectives,
                unit_outcomes: !unitForm.unit_outcomes,
                prerequisites: !unitForm.prerequisites,
                unit_index: !unitForm.unit_index,
            });
            return;
        };

        if (usedIndexes.includes(parseInt(unitForm.unit_index))) {
            setMessage("Unit index already in use");
            setInvalidFields({ unit_index: true });
            return;
        };

        try {
            const res = await fetch(`/api/units/${cls.subjectid}/${cls.unique_string_id}/new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(unitForm),
            });
            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage("Unit added successfully");
                setUnitForm({
                    name: "",
                    description: "",
                    learning_objectives: "",
                    unit_outcomes: "",
                    prerequisites: "",
                    unit_index: null,
                });
                toggleAddForm();
            };
        } catch (error) {
            setMessage("Error adding unit");
            console.error(`Error adding unit: ${error.message}`);
        };
    };

    return (
        <>
            {loading && <LoadingScreen />}
            <div id="modalOverlay"></div>
            <div id="add-lesson-modal" className="modal">
                {message && <MessagePopup message={message} setMessage={setMessage} />}
                
                <div className="modal-header">
                    <h2>Add Unit</h2>
                    <h4>You're adding a unit to: <span id="add-lesson-modal-topic-name">{cls.name}</span></h4>
                    <button onClick={toggleAddForm} className="modal-close-button">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`new-lesson-form-input-holder ${invalidFields.name ? "invalid-field" : ""}`}>
                        <label htmlFor="unit-name" className="form-label">Unit Name:</label>
                        <input type="text" placeholder="Unit name" id="unit-name" value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} />
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.description ? "invalid-field" : ""}`}>
                        <label htmlFor="unit-description" className="form-label">Unit Description:</label>
                        <textarea placeholder="Unit description" id="unit-description" value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.learning_objectives ? "invalid-field" : ""}`}>
                        <label htmlFor="unit-objectives" className="form-label">Learning Objectives:</label>
                        <textarea placeholder="Unit objectives" id="unit-objectives" value={unitForm.learning_objectives} onChange={(e) => setUnitForm({ ...unitForm, learning_objectives: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.unit_outcomes ? "invalid-field" : ""}`}>
                        <label htmlFor="unit-outcomes" className="form-label">Unit Outcomes:</label>
                        <textarea placeholder="Unit outcomes" id="unit-outcomes" value={unitForm.unit_outcomes} onChange={(e) => setUnitForm({ ...unitForm, unit_outcomes: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.prerequisites ? "invalid-field" : ""}`}>
                        <label htmlFor="unit-prerequisites" className="form-label">Unit Prerequisites:</label>
                        <textarea placeholder="Unit prerequisites" id="unit-prerequisites" value={unitForm.prerequisites} onChange={(e) => setUnitForm({ ...unitForm, prerequisites: e.target.value })}></textarea>
                    </div>
                    <div className={`new-lesson-form-input-holder ${invalidFields.unit_index ? "invalid-field" : ""}`}>
                        <label htmlFor="unit-index" className="form-label">Unit Index:</label>
                        <input type="number" placeholder="Unit index" id="unit-index" min="1" value={unitForm.unit_index} onChange={(e) => handleIndexChange(e)} />

                        <div className="current-units-holder">
                            <h4>Current Units:</h4>
                            <ol>
                                {units.map((unit) => (
                                    <li key={unit.unique_string_id}>{unit.name}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                    <button type="submit" id="add-lesson-modal-submit-button">Add Unit</button>
                </form>
            </div>
        </>
    );
};