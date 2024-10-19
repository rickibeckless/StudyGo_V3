import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleHalfStroke, faCircle, faCircleCheck, faCircleExclamation} from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import UnitStatusModal from "./UnitStatusModal.jsx";
import '../../styles/overviewOrSummary.css';

export default function OverviewOrSummary({ refreshUnit, contentType, unit }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [unitStatusModalOpen, setUnitStatusModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (unit.description && unit.prerequisites && unit.learning_objectives && unit.unit_outcomes) {
            setLoading(false);
        }
    }, [loading, unit]);

    const toggleUnitStatusModal = () => {
        setUnitStatusModalOpen(!unitStatusModalOpen);
        document.body.classList.toggle("modal-open");
    };

    return (
        <>
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            {contentType === 'overview' ? (
                <dl className="unit-overview">
                    <dt className="unit-description-title">Description:</dt>
                    <dd className="unit-description">{unit.description}</dd>

                    <dt className="prerequisites-title">Prerequisites:</dt>
                    <dd className="prerequisites">{unit.prerequisites}</dd>

                    <dt className="learning-objectives-title">Learning Objectives:</dt>
                    <ul className="learning-objectives">
                        {unit.learning_objectives?.map((objective, index) => (
                            <li key={index} className="objective-item">{objective}</li>
                        ))}
                    </ul>

                    <dt className="unit-outcome-title">Outcome:</dt>
                    <dd className="unit-outcome">{unit.unit_outcomes}</dd>
                </dl>
            ) : contentType === 'summary' ? (
                <div className="summary-holder">
                    <div className="summary-status-holder">
                        <h3>Unit Status:</h3>
                        {unit.status === 'not started' ? (
                            <>
                                <button type="button" className="summary-status-btn" title="Unit Not Started" onClick={() => toggleUnitStatusModal()}>
                                    <FontAwesomeIcon icon={faCircle} className="status-icon" />
                                </button>
                            </>
                        ) : (unit.status === "in progress" || unit.status === "'in progress'")  ? (
                            <>
                                <button type="button" className="summary-status-btn" title="Unit In Progress" onClick={() => toggleUnitStatusModal()}>
                                    <FontAwesomeIcon icon={faCircleHalfStroke} className="status-icon" />
                                </button>
                            </>
                        ) : unit.status === 'completed' ? (
                            <>
                                <button type="button" className="summary-status-btn" title="Unit Completed" onClick={() => toggleUnitStatusModal()}>
                                    <FontAwesomeIcon icon={faCircleCheck} className="status-icon" />
                                </button>
                            </>
                        ) : unit.status === 'completed-redo' ? (
                            <>
                                <button type="button" className="summary-status-btn" title="Unit Completed - To Redo" onClick={() => toggleUnitStatusModal()}>
                                    <FontAwesomeIcon icon={faCircleExclamation} className="status-icon" />
                                </button>
                            </>
                        ) : null}
                    </div>

                    {/* <h2 className="summary-title">Summary</h2>
                    <p className="summary-description">This is the summary of the unit</p>
                    <div className="summary-content">
                        <p>Summary content goes here</p>
                    </div> */}
                </div>
            ) : null}
            {unitStatusModalOpen && <UnitStatusModal refreshUnit={refreshUnit} unit={unit} toggleUnitStatusModal={toggleUnitStatusModal} />}
        </>
    );
};