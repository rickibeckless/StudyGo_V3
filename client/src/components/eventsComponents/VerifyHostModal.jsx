import { useState, useEffect } from "react";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";

export default function VerifyHostModal({ host, setVerifiedHost, toggleVerifyHostModal, toggleEditEventModal }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const verifyHost = async (e) => {
        e.preventDefault();
        const hostEmail = document.getElementById("host_email").value;
        const hostPassword = document.getElementById("host_password").value;

        if (hostEmail === host.host_email && hostPassword === host.host_password) {
            setMessage("Host verified successfully.");
            toggleVerifyHostModal();
            setVerifiedHost(true);
        } else {
            setMessage("Invalid host email or password. Please try again.");
        };
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <form id="event-modal-content" onSubmit={verifyHost}>
                <h3>Host Sign In:</h3>

                <label htmlFor="host_email">Host Email:</label>
                <input className="modal-input" type="email" id="host_email" name="host_email" required />

                <label htmlFor="host_password">Host Password:</label>
                <input className="modal-input" type="password" id="host_password" name="host_password" required />

                <button type="submit">Sign In</button>
                <button type="button" onClick={() => toggleEditEventModal()}>Cancel</button>
            </form>
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
}