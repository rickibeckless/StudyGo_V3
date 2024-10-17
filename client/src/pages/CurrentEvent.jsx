import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FetchContext } from "../context/FetchProvider.jsx";
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import MessagePopup from "../components/MessagePopup.jsx";

export default function CurrentEvent() {
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    return (
        <main id="current-event-body" className="container">
            <PageTitle title="Current Event | StudyGo" />
        </main>
    );
};