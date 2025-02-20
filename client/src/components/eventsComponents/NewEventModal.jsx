import { useState, useEffect } from "react";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import "../../styles/newEvent.css";

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
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    useEffect(() => {
        if (currentPage === 3) {
            setIsSubmitDisabled(true);

            if (!formData.host_name || !formData.host_email || !formData.host_phone || !formData.host_password || !formData.host_title || !formData.event_name || !formData.event_subject || !formData.event_description || !formData.event_date_time) {
                setIsSubmitDisabled(true);
                return;
            };

            const timer = setTimeout(() => {
                setIsSubmitDisabled(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [currentPage]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const originalDateTime = formData.event_date_time;
        const updatedDateTime = new Date(originalDateTime).toISOString();

        formData.event_date_time = updatedDateTime;

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
                <button id="modalCloseButton" className="new-event-nav-button" type="button" onClick={() => toggleNewEventModal()}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <form id="new-event-form" onSubmit={handleSubmit}>
                    <h3 id="modal-title">Create New Event</h3>

                    {/* Create Host Page */}
                    {currentPage === 1 && (
                        <section className="new-event-form-page" id="create-host-page">
                            <h4>Create Host</h4>
                            <input className="modal-input" type="text" name="host_name" placeholder="Host Name" value={formData.host_name} onChange={handleInputChange} required />
                            <input className="modal-input" type="email" name="host_email" placeholder="Email" value={formData.host_email} onChange={handleInputChange} required />
                            <input className="modal-input" type="tel" name="host_phone" placeholder="Phone" value={formData.host_phone} onChange={handleInputChange} required />
                            <input className="modal-input" type="password" name="host_password" placeholder="Password" value={formData.host_password} onChange={handleInputChange} required />
                            <input className="modal-input" type="text" name="host_title" placeholder="Title" value={formData.host_title} onChange={handleInputChange} required />
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
                        </section>
                    )}

                    {/* Confirm Info Page */}
                    {currentPage === 3 && (
                        <section className="new-event-form-page" id="confirm-info-page">
                            <h4>Confirm Your Information</h4>
                            {/* <pre>{JSON.stringify(formData, null, 5)}</pre> */}

                            <div className="confirm-info-holder">
                                <h5>Host Information</h5>
                                <p>Name: {formData.host_name}</p>
                                <p>Email: {formData.host_email}</p>
                                <p>Phone: {formData.host_phone}</p>
                                <p>Password: {formData.host_password}</p>
                                <p>Title: {formData.host_title}</p>
                            </div>

                            <div className="confirm-info-holder">
                                <h5>Event Information</h5>
                                <p>Name: {formData.event_name}</p>
                                <p>Organization: {formData.event_organization}</p>
                                <p>Subject: {formData.event_subject}</p>
                                <p>Description: {formData.event_description}</p>
                                <p>Date & Time: {formData.event_date_time}</p>
                                <p>Duration: {formData.event_duration}</p>
                            </div>
                        </section>
                    )}

                    <aside className="new-event-form-button-holder">
                        {currentPage === 1 ? null : (
                            <button className="new-event-nav-button new-event-nav-left" type="button" onClick={goToPreviousPage}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        )}
                        {currentPage === 3 ? (
                            <button className={`new-event-nav-button ${isSubmitDisabled ? "disabled" : ""}`} type="submit" disabled={isSubmitDisabled}>Create Event</button>
                        ) : (
                            <button className="new-event-nav-button new-event-nav-right" type="button" onClick={goToNextPage}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        )}
                    </aside>
                </form>
            </div>
        </>
    );
};