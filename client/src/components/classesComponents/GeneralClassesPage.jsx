import { useEffect, useState, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { FetchContext } from "../../context/FetchProvider.jsx";
import PageTitle from "../PageTitle.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import UnitFormModal from "./UnitFormModal.jsx";

export default function GeneralClassesPage() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const { fetchWithRetry } = useContext(FetchContext);
    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        async function fetchClasses() {
            try {
                const classesData = await fetchWithRetry("/api/classes");

                if (!classesData) {
                    setMessage("An unexpected error occurred. Please try again.");
                    setLoading(false);
                    return;
                };

                setClasses(classesData);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setMessage("An unexpected error occurred. Please try again.");
            };
        };

        fetchClasses();
    }, []);

    return (
        <>
            <PageTitle title="All Classes | StudyGo" />
            {loading ? <LoadingScreen /> : null}
            {message ? <MessagePopup message={message} /> : null}

            <h2>General Classes</h2>

            <ul id="subject-list">
                {classes?.map(cls => (
                    <li key={cls.unique_string_id}>
                        <h3>{cls.name}</h3>
                        <p>{cls.description}</p>
                    </li>
                ))}
            </ul>
        </>
    );
};