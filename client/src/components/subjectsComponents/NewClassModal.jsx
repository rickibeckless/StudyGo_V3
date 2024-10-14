import MessagePopup from "../MessagePopup";
import LoadingScreen from "../LoadingScreen";
import { useEffect, useState } from "react";

export default function NewClassModal({ subject, toggleNewClassModal }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        index: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch(`api/classes/${subject.unique_string_id}/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            const data = await res.json();

            setLoading(false);
            toggleNewClassModal();
        } catch (error) {
            setLoading(false);
            setMessage("Problem adding class: ", error);
            console.error(error.message);
        };

    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}

            <div id="modalOverlay"></div>
            <div id="classModal" className="modal">
                <h3 id="modal-title">Add Class to {subject.name}</h3>
                <form id="classForm">
                    <input className="modal-input" type="text" name="name" placeholder="Class Name" value={formData.name} onChange={handleInputChange} required />
                    <textarea className="modal-input" name="description" placeholder="Class Description" value={formData.description} onChange={handleInputChange} required rows="4"></textarea>
                    <input className="modal-input" type="number" name="index" placeholder="Class Index" min="1" value={formData.index} onChange={handleInputChange} required />

                    <div id="class-form-btn-holder">
                        <button id="modalCloseButton" type="button" onClick={(e) => toggleNewClassModal(e, subject)}>Close</button>
                        <button id="modalSubmitButton" type="submit" onClick={(e) => handleSubmit(e)}>Add Class</button>
                    </div>
                </form>
                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};