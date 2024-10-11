import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageTitle from "../components/PageTitle.jsx";

export default function CurrentEvent() {

    return (
        <main id="current-event-body" className="container">
            <PageTitle title="Current Event | StudyGo" />
        </main>
    );
};