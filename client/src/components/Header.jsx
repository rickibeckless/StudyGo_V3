import { useLocation } from "react-router-dom";

export default function Header() {
    const location = useLocation();

    return (
        <header id="main-header">
            <h1 id="main-logo"><a href="/">StudyGo</a></h1>
            <nav id="main-navbar">
                <ul>
                    {location.pathname !== "/subjects" && <li><a href="/subjects">Subjects</a></li>}
                    {location.pathname !== "/classes" && <li><a href="/classes">Classes</a></li>}
                    {location.pathname !== "/events" && <li><a href="/events">Events</a></li>}
                </ul>
            </nav>
        </header>
    );
};