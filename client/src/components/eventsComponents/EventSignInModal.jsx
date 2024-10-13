import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";

export default function EventSignInModal({ event, host, toggleEventModal, toggleSigninEventModal }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [hostOrAttendee, setHostOrAttendee] = useState("");
    const [userVerified, setUserVerified] = useState(false);
    const [formData, setFormData] = useState({
        user_email: '',
        user_password: ''
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

    const handleHostOrAttendeeChange = (e) => {
        setHostOrAttendee(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (hostOrAttendee === "attendee") {
                const res = await fetch(`/api/events/${event.event_id}/attendees`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await res.json();

                const attendee = data.find(attendee => attendee.attendee_email === formData.user_email);

                if (!attendee) {
                    setLoading(false);
                    setMessage("Attendee not found. Please register for event first.");
                    return;
                } else if (attendee.attendee_password !== formData.user_password) {
                    setLoading(false);
                    setMessage("Incorrect password. Please try again.");
                    return;
                } else {
                    setUserVerified(true);
                    setLoading(false);
                    setMessage("Successfully signed in for event!");
                    toggleSigninEventModal();
                    toggleEventModal();
                    navigate(`/events/${event.event_id}?=${hostOrAttendee}?=${attendee.attendee_id}`);
                }; 
            } else if (hostOrAttendee === "host") {
                if (formData.user_email === host.host_email && formData.user_password === host.host_password) {
                    setUserVerified(true);
                    setLoading(false);
                    setMessage("Successfully signed in for event!");
                    toggleSigninEventModal();
                    toggleEventModal();
                    navigate(`/events/${event.event_id}?=${hostOrAttendee}?=${host.host_id}`);
                } else {
                    setLoading(false);
                    setMessage("Invalid host email or password. Please try again.");
                };
            };
        } catch (error) {
            setLoading(false);
            setMessage("Error signing in for event. Please try again.");
            console.error(`Error signing in for event: ${error.message}`);
        };
    };
    
    const goToNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

    const capitalizedHostOrAttendee = hostOrAttendee.charAt(0).toUpperCase() + hostOrAttendee.slice(1);

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <form id="event-modal-content" onSubmit={handleSubmit}>
                <h3>Join Event</h3>

                {currentPage === 1 && (
                    <section className="new-event-form-page" id="create-host-page">
                        <h4>Are you a Host or Attendee?</h4>

                        <div className="event-signin-type-holder">
                            <label htmlFor="host">Host</label>
                            <input className="event-signin-type-input" type="radio" id="host" name="host_or_attendee" value="host" required onChange={handleHostOrAttendeeChange} />
                        </div>

                        <div className="event-signin-type-holder">
                            <label htmlFor="attendee">Attendee</label>
                            <input className="event-signin-type-input" type="radio" id="attendee" name="host_or_attendee" value="attendee" required onChange={handleHostOrAttendeeChange} />
                        </div>

                        <button type="button" onClick={goToNextPage}>Next</button>
                        <button type="button" onClick={() => toggleSigninEventModal()}>Cancel</button>
                    </section>
                )}

                {currentPage === 2 && (
                    <section className="new-event-form-page" id="create-host-page">
                        <h4>{capitalizedHostOrAttendee} Sign In:</h4>

                        <label htmlFor="user_email">Email:</label>
                        <input className="modal-input" type="email" id="user_email" name="user_email" required onChange={handleInputChange} />

                        <label htmlFor="user_password">Password:</label>
                        <input className="modal-input" type="password" id="user_password" name="user_password" required onChange={handleInputChange} />

                        <button type="submit">Sign In</button>
                        <button type="button" onClick={goToPreviousPage}>Back</button>
                        <button type="button" onClick={() => toggleSigninEventModal()}>Cancel</button>
                    </section>
                )}
            </form>
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};