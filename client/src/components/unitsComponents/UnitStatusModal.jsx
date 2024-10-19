import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleHalfStroke, faCircle, faCircleCheck, faCircleExclamation} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import '../../styles/unitStatusModal.css';

export default function UnitStatusModal({ refreshUnit, unit, toggleUnitStatusModal }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(unit.status);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleStatusClick = async (e, status) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/units/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                setStatus(status);
                refreshUnit();
                setMessage('Unit status updated');
                setTimeout(() => {
                    setMessage('');
                    toggleUnitStatusModal();
                }, 1000);
            } else {
                throw new Error('Failed to update unit status');
            }
        } catch (error) {
            setMessage(error.message);
        };
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <div id="modalOverlay"></div>
            <div id="unit-status-modal" className="modal">
                <div className="modal-content">
                    <h2>Set Status:</h2>
                    <div className={`status-holder ${status === 'not started' ? 'selected' : ''}`} onClick={(e) => handleStatusClick(e, 'not started')}>
                        <p className="status-text">Not Started</p>
                        <button type="button" className="status-btn">
                            <FontAwesomeIcon icon={faCircle} className="status-icon" />
                        </button>
                    </div>
                    <div className={`status-holder ${status === 'in progress' ? 'selected' : ''}`} onClick={(e) => handleStatusClick(e, 'in progress')}>
                        <p className="status-text">In Progress</p>
                        <button type="button" className="status-btn">
                            <FontAwesomeIcon icon={faCircleHalfStroke} className="status-icon" />
                        </button>
                    </div>
                    <div className={`status-holder ${status === 'completed' ? 'selected' : ''}`} onClick={(e) => handleStatusClick(e, 'completed')}>
                        <p className="status-text">Completed</p>
                        <button type="button" className="status-btn">
                            <FontAwesomeIcon icon={faCircleCheck} className="status-icon" />
                        </button>
                    </div>
                    <div className={`status-holder ${status === 'completed-redo' ? 'selected' : ''}`} onClick={(e) => handleStatusClick(e, 'completed-redo')}>
                        <p className="status-text">Needs Review</p>
                        <button type="button" className="status-btn">
                            <FontAwesomeIcon icon={faCircleExclamation} className="status-icon" />
                        </button>
                    </div>
                </div>
                <button id="modalCloseButton" type="button" onClick={() => toggleUnitStatusModal()}>Close</button>
            </div>
        </>
    );
};