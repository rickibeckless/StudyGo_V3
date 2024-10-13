/**
 * Desc: Template for all pages, includes page title, loading screen, and message popup.
 *       This template is used to create new pages.
 *       May also be used for modals and components.
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

// if there is authentication and sessions, an auth context may be needed
// import { AuthContext } from "../contexts/AuthContext.js"; // note: this context is for authentication

// sets the page title, used by all pages in the format "Page Title | StudyGo"
import PageTitle from "../components/PageTitle.jsx"; // note: modals will not use this component

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../components/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../components/MessagePopup.jsx";

// styles that a component uses may also be imported here
import "./StyleTemplate.css"; // note: styles will be global, so use unique class and/or id names

// some pages may also need to import utils, hooks, or context
import '../utils/validators.js'; // note: this validator is for the classes pages url validation

export default function PageTemplate() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const navigate = useNavigate(); // used to navigate to a different page

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title="Page Title | StudyGo" />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};