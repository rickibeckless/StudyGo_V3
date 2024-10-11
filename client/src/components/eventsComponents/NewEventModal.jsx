import { useState } from "react";
import LoadingScreen from "../LoadingScreen.jsx";

export default function NewEventModal({ toggleNewEventModal }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        host_name: '',
        host_email: '',
        host_phone: '',
        host_password: '',
        host_title: '',
        event_name: '',
        event_organization: '',
        event_subject: '',
        event_description: '',
        event_date_time: '',
        event_duration: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('/api/events/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        toggleNewEventModal();
    };

    const goToNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

    return (
        <>
            <div id="modalOverlay"></div>
            <div id="new-event-modal" className="modal">
                <h3 id="modal-title">Create New Event</h3>
                <form id="new-event-form" onSubmit={handleSubmit}>
                    {/* Create Host Page */}
                    {currentPage === 1 && (
                        <section className="new-event-form-page" id="create-host-page">
                            <h4>Create Host</h4>
                            <input className="modal-input" type="text" name="host_name" placeholder="Host Name" value={formData.host_name} onChange={handleInputChange} required />
                            <input className="modal-input" type="email" name="host_email" placeholder="Email" value={formData.host_email} onChange={handleInputChange} required />
                            <input className="modal-input" type="tel" name="host_phone" placeholder="Phone" value={formData.host_phone} onChange={handleInputChange} required />
                            <input className="modal-input" type="password" name="host_password" placeholder="Password" value={formData.host_password} onChange={handleInputChange} required />
                            <input className="modal-input" type="text" name="host_title" placeholder="Title" value={formData.host_title} onChange={handleInputChange} required />
                            <button type="button" onClick={goToNextPage}>Next</button>
                            <button id="modalCloseButton" type="button" onClick={() => toggleNewEventModal()}>Close</button>
                        </section>
                    )}

                    {/* Create Event Page */}
                    {currentPage === 2 && (
                        <section className="new-event-form-page" id="create-event-page">
                            <h4>Create Event</h4>
                            <input className="modal-input" type="text" name="event_name" placeholder="Event Name" value={formData.event_name} onChange={handleInputChange} required />
                            <input className="modal-input" type="text" name="event_organization" placeholder="Organization" value={formData.event_organization} onChange={handleInputChange} />
                            <input className="modal-input" type="text" name="event_subject" placeholder="Subject" value={formData.event_subject} onChange={handleInputChange} required />
                            <textarea className="modal-input" name="event_description" placeholder="Description" value={formData.event_description} onChange={handleInputChange} required></textarea>
                            <input className="modal-input" type="datetime-local" name="event_date_time" value={formData.event_date_time} onChange={handleInputChange} required />
                            <input className="modal-input" type="text" name="event_duration" placeholder="Duration (e.g., 1 hour)" value={formData.event_duration} onChange={handleInputChange} />
                            <button type="button" onClick={goToPreviousPage}>Back</button>
                            <button type="button" onClick={goToNextPage}>Next</button>
                            <button id="modalCloseButton" type="button" onClick={() => toggleNewEventModal()}>Close</button>
                        </section>
                    )}

                    {/* Confirm Info Page */}
                    {currentPage === 3 && (
                        <section className="new-event-form-page" id="confirm-info-page">
                            <h4>Confirm Your Information</h4>
                            <pre>{JSON.stringify(formData, null, 2)}</pre>
                            <button type="button" onClick={goToPreviousPage}>Back</button>
                            <button type="submit">Create Event</button>
                            <button id="modalCloseButton" type="button" onClick={() => toggleNewEventModal()}>Close</button>
                        </section>
                    )}
                </form>
            </div>
        </>
    );
};