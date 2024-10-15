import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageTitle from "../PageTitle.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";

export default function OverviewOrSummary({ contentType, unit }) {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (unit.description && unit.prerequisites && unit.learning_objectives && unit.unit_outcomes) {
            setLoading(false);
        }
    }, [loading, unit]);

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
                    <h2 className="summary-title">Summary</h2>
                    <p className="summary-description">This is the summary of the unit</p>
                    <div className="summary-content">
                        <p>Summary content goes here</p>
                    </div>
                </div>
            ) : null}
        </>
    );
};