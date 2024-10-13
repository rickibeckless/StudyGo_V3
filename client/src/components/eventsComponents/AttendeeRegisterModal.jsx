import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";

export default function AttendeeRegisterEventModal({ event, currentEvent, toggleEventModal, toggleAttendeeRegisterEventModal }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        attendee_name: '',
        attendee_email: '',
        attendee_phone: '',
        attendee_password: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const res = await fetch(`/api/events/${event.event_id}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            const data = await res.json();
    
            setLoading(false);
            setMessage("Successfully registered for event!");

            if (currentEvent) {
                toggleAttendeeRegisterEventModal();
                toggleEventModal();
                navigate(`/events/${event.event_id}?=${data.attendee_id}`);
            }

            toggleAttendeeRegisterEventModal();
        } catch (error) {
            setLoading(false);
            setMessage("Error registering for event. Please try again.");
        };

    };

    const goToNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <form id="event-modal-content" onSubmit={handleSubmit}>
                <h3 id="modal-title">Register For Event</h3>

                {/* Attendee Register For Event Page */}
                {currentPage === 1 && (
                    <section className="new-event-form-page" id="create-host-page">
                        <h4>Register For Event</h4>
                        <label htmlFor="attendee_name">Name</label>
                        <input type="text" id="attendee_name" name="attendee_name" onChange={handleInputChange} required />
                        <label htmlFor="attendee_email">Email</label>
                        <input type="email" id="attendee_email" name="attendee_email" onChange={handleInputChange} required />
                        <label htmlFor="attendee_phone">Phone</label>
                        <input type="tel" id="attendee_phone" name="attendee_phone" onChange={handleInputChange} required />
                        <label htmlFor="attendee_password">Password</label>
                        <input type="password" id="attendee_password" name="attendee_password" onChange={handleInputChange} required />
                        <button type="button" onClick={goToNextPage}>Next</button>
                        <button id="modalCloseButton" type="button" onClick={() => toggleAttendeeRegisterEventModal()}>Close</button>
                    </section>
                )}

                {/* Confirm Info Page */}
                {currentPage === 2 && (
                    <section className="new-event-form-page" id="confirm-info-page">
                        <h4>Confirm Your Information</h4>
                        <pre>{JSON.stringify(formData, null, 2)}</pre>
                        <button type="button" onClick={goToPreviousPage}>Back</button>
                        <button type="submit">Register For Event!</button>
                        <button id="modalCloseButton" type="button" onClick={() => toggleAttendeeRegisterEventModal()}>Close</button>
                    </section>
                )}
            </form>
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};