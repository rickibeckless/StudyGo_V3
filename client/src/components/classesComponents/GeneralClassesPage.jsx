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

    const initialHiddenState = JSON.parse(localStorage.getItem("hiddenWalkthrough")) || [];
    const isHidden = initialHiddenState.includes("classes");
    const [hiddenWalkthrough, setHiddenWalkthrough] = useState(isHidden);
    const [walkthrough, setWalkthrough] = useState(false);
    const walkthroughData = ({
        page: "classes",
        steps: [
            {
                index: 1,
                title: "Welcome to the 'Classes' Page!",
                instruction: "Here's a quick walkthrough we've put together to help you get started!",
                focusedElement: null,
                assets: ["https://i.ibb.co/bz0dYLT/Study-Go-Ani-Logo.gif"]
            },
            {
                index: 2,
                title: "Step 1: View All Classes",
                instruction: "Here you can view all the classes available on StudyGo. Click on a class to view more details.",
                focusedElement: "subject-list",
                assets: []
            },
            {
                index: 3,
                title: "Step 2: Search for a Class",
                instruction: "Use the search bar to find a specific class.",
                focusedElement: "search-bar",
                assets: []
            },
            {
                index: 4,
                title: "Step 3: Filter Classes",
                instruction: "Use the filter options to sort classes by name, number of units, date added, or date updated.",
                focusedElement: "subjects-filter",
                assets: []
            },
            {
                index: 5,
                title: "Step 4: Add a Class",
                instruction: "Click the 'Add Class' button to add a new class.",
                focusedElement: "add-class-button",
                assets: []
            },
            {
                index: 6,
                title: "Step 5: Walkthrough Complete!",
                instruction: "You've completed the walkthrough! You can always access it again from the 'Help' menu.",
                focusedElement: null,
                assets: []
            }
        ]
    });

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

    const toggleAddForm = (type) => {
        console.log("Add form clicked");
    };

    return (
        <>
            <PageTitle title="All Classes | StudyGo" />
            {loading && <LoadingScreen />}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <div id="subjects-section-header">
                <h2>All Classes</h2>
                <button id="add-subject-button" title="Add a class" onClick={() => toggleAddForm("class")}>Add Class</button>
            </div>
            <ul id="subject-list">
                {classes?.map(cls => (
                    <div className="subject-holder">
                        <li className="subject" key={cls.unique_string_id}>{cls.name}</li>

                        <div className="subject-description">{cls.description}</div>
                        
                        <div className="count-and-button-holder">
                            <p className="subject-class-count">
                                <span className="subject-class-count-number">

                                </span>

                            </p>
                            <button className="add-class-button" title="Add a unit" onClick={() => toggleAddForm("unit")}>Add Unit</button>
                        </div>
                    </div>
                ))}
            </ul>
        </>
    );
};