import { useState, useEffect } from "react";
import LoadingScreen from "../LoadingScreen.jsx";
import VerifyHostModal from "./VerifyHostModal.jsx";
import MessagePopup from "../MessagePopup.jsx";

export default function HostEditEventModal({ event, host, toggleEditEventModal }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [verifiedHost, setVerifiedHost] = useState(false);
    const [verifyHostModalVisible, setVerifyHostModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        host_name: host.host_name,
        host_email: host.host_email,
        host_phone: host.host_phone,
        host_password: host.host_password,
        host_title: host.host_title,
        event_name: event.event_name,
        event_organization: event.event_organization,
        event_subject: event.event_subject,
        event_description: event.event_description,
        event_date_time: event.event_date_time,
        event_duration: event.event_duration
    });

    const toggleVerifyHostModal = () => {
        setVerifyHostModalVisible(!verifyHostModalVisible);
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const durationString = `${formData.event_duration.hours} hours`;
    
            const updatedData = {
                ...formData,
                event_duration: durationString,
                event_date_time: new Date(formData.event_date_time).toISOString()
            };
    
            const res = await fetch(`/api/events/${host.host_id}/${event.event_id}/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
    
            const data = await res.json();
    
            toggleEditEventModal();
        } catch (error) {
            setMessage(`Error updating event, please try again. ${error.message}`);
        }

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
            {!verifiedHost ? (
                <VerifyHostModal 
                    host={host} 
                    setVerifiedHost={setVerifiedHost} 
                    toggleVerifyHostModal={toggleVerifyHostModal} 
                    toggleEditEventModal={toggleEditEventModal}
                />
            ) : 
                <form id="event-modal-content" onSubmit={handleSubmit}>
                    {currentPage === 1 && (
                        <section className="new-event-form-page" id="create-host-page">
                            <h3>Edit Host</h3>

                            <label htmlFor="host_name">Host Name:</label>
                            <input className="modal-input" type="text" id="host_name" name="host_name" value={formData.host_name} onChange={(e) => setFormData({ ...formData, host_name: e.target.value })} required />
                            
                            <label htmlFor="host_email">Host Email:</label>
                            <input className="modal-input" type="email" id="host_email" name="host_email" value={formData.host_email} onChange={(e) => setFormData({ ...formData, host_email: e.target.value })} required />
                            
                            <label htmlFor="host_phone">Host Phone:</label>
                            <input className="modal-input" type="tel" id="host_phone" name="host_phone" value={formData.host_phone} onChange={(e) => setFormData({ ...formData, host_phone: e.target.value })} required />
                            
                            <label htmlFor="host_password">Host Password:</label>
                            <input className="modal-input" type="password" id="host_password" name="host_password" value={formData.host_password} onChange={(e) => setFormData({ ...formData, host_password: e.target.value })} required />
                            
                            <label htmlFor="host_title">Host Title:</label>
                            <input className="modal-input" type="text" id="host_title" name="host_title" value={formData.host_title} onChange={(e) => setFormData({ ...formData, host_title: e.target.value })} required />

                            <button type="button" onClick={goToNextPage}>Next</button>
                            <button id="modalCloseButton" type="button" onClick={() => toggleEditEventModal()}>Close</button>
                        </section>
                    )}

                    {currentPage === 2 && (
                        <section className="new-event-form-page" id="create-event-page">
                            <h3>Edit Event</h3>

                            <label htmlFor="event_name">Event Name:</label>
                            <input className="modal-input" type="text" id="event_name" name="event_name" value={formData.event_name} onChange={(e) => setFormData({ ...formData, event_name: e.target.value })} required />

                            <label htmlFor="event_organization">Organization:</label>
                            <input className="modal-input" type="text" id="event_organization" name="event_organization" value={formData.event_organization} onChange={(e) => setFormData({ ...formData, event_organization: e.target.value })} required />

                            <label htmlFor="event_subject">Subject:</label>
                            <input className="modal-input" type="text" id="event_subject" name="event_subject" value={formData.event_subject} onChange={(e) => setFormData({ ...formData, event_subject: e.target.value })} required />

                            <label htmlFor="event_description">Description:</label>
                            <textarea className="modal-input" id="event_description" name="event_description" value={formData.event_description} onChange={(e) => setFormData({ ...formData, event_description: e.target.value })} required></textarea>

                            <label htmlFor="event_date_time">Date & Time:</label>
                            {/* <input className="modal-input" type="datetime-local" id="event_date_time" name="event_date_time" value={formData.event_date_time} onChange={(e) => setFormData({ ...formData, event_date_time: e.target.value })} required /> */}
                            <input
                                className="modal-input"
                                type="datetime-local"
                                id="event_date_time"
                                name="event_date_time"
                                value={formData.event_date_time ? new Date(formData.event_date_time).toISOString().slice(0, 16) : ''}
                                onChange={(e) => setFormData({ ...formData, event_date_time: e.target.value })}
                                required
                            />

                            <label htmlFor="event_duration">Duration:</label>
                            {/* <input className="modal-input" type="text" id="event_duration" name="event_duration" placeholder="Duration (e.g., 1 hour)" value={formData.event_duration} onChange={(e) => setFormData({ ...formData, event_duration: e.target.value })} required /> */}

                            {/* <input
                                className="modal-input"
                                type="text"
                                id="event_duration"
                                name="event_duration"
                                placeholder="Duration (e.g., 1 hour)"
                                value={`${formData.event_duration.hours || 0} hours`}
                                onChange={(e) => {
                                    const durationValue = parseInt(e.target.value, 10);
                                    setFormData({
                                        ...formData,
                                        event_duration: { hours: durationValue || 0 },
                                    });
                                }}
                                required
                            /> */}

                            <input
                                className="modal-input"
                                type="text"
                                id="event_duration"
                                name="event_duration"
                                placeholder="Duration (e.g., 4 hours)"
                                value={formData.event_duration.hours ? `${formData.event_duration.hours} hours` : ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const hoursMatch = value.match(/(\d+)/);

                                    if (hoursMatch) {
                                        const hours = parseInt(hoursMatch[0], 10);

                                        setFormData({
                                            ...formData,
                                            event_duration: { hours: hours }
                                        });
                                    }
                                }}
                                required
                            />

                            <button type="button" onClick={goToPreviousPage}>Back</button>
                            <button type="button" onClick={goToNextPage}>Next</button>
                            <button id="modalCloseButton" type="button" onClick={() => toggleEditEventModal()}>Close</button>
                        </section>
                    )}

                    {currentPage === 3 && (
                        <section className="new-event-form-page" id="confirm-info-page">
                            <h3>Confirm Your Information</h3>
                            <pre>{JSON.stringify(formData, null, 2)}</pre>
                            <button type="button" onClick={goToPreviousPage}>Back</button>
                            <button type="submit">Update Event</button>
                            <button id="modalCloseButton" type="button" onClick={() => toggleEditEventModal()}>Close</button>
                        </section>
                    )}
                </form>
            }
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};