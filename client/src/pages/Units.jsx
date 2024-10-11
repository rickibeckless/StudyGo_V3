import { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import PageTitle from "../components/PageTitle.jsx";

export default function Units() {
    const { subjectId, classId, unitId } = useParams();
    const currentTopic = localStorage.getItem('currentTopic');
    const currentSubTopicType = localStorage.getItem('currentSubTopicType');
    const currentSubTopicId = localStorage.getItem('currentSubTopic-topicId');
    const currentSubTopicFullId = localStorage.getItem('currentSubTopic-id');

    const [subject, setSubject] = useState([]);
    const [classes, setClasses] = useState([]);
    const [units, setUnits] = useState([]);
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        async function fetchSubject() {
            try {
                const res = await fetch(`/api/subjects/${subjectId}`);
                const subject = await res.json();
                setSubject(subject);
                fetchClasses();
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchClasses() {
            try {
                const res = await fetch(`/api/classes/${subjectId}`);
                const classes = await res.json();
                setClasses(classes);
                fetchUnits();
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchUnits() {
            try {
                const res = await fetch(`/api/units/${subjectId}/${classId}/${unitId}`);
                const units = await res.json();
                setUnits(units);
                fetchTopics(units);
            } catch (error) {
                console.error(error);
            };
        };

        async function fetchTopics(units) {
            try {
                const res = await fetch(`/api/topics/${subjectId}/${classId}/${unitId}`);
                const topics = await res.json();
                setTopics(topics);
            } catch (error) {
                console.error(error);
            };
        };

        fetchSubject();
    }, []);

    return (
        <>
            <aside id="left-nav">
                <div id="left-nav-search">
                    <input type="text" id="left-nav-search-input" placeholder="Search topics..." />
                    <button title="Search" type="button" id="left-nav-search-button">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
                <nav id="left-nav-topics">
                    <ul id="left-nav-topics-list"></ul>
                </nav>
            </aside>

            <main id="main-body">
                <nav id="right-nav">
                    <ul id="right-nav-list"></ul>
                </nav>

                <div className="main-body-container">
                    <section id="right-content"></section>

                    <footer id="main-footer">
                        <nav id="footer-navbar">
                            <ul>
                                <li><a href="">About</a></li>
                                <li><a href="">Terms of Service</a></li>
                                <li><a href="">Privacy Policy</a></li>
                                <li><a href="">Help</a></li>
                                <li><a href="">Contact</a></li>
                            </ul>
                        </nav>
                        <p id="footer-cr-statement">
                            Copyright &copy; 2024 <a id="footer-cr-link" href="https://github.com/rickibeckless"
                                target="_blank" rel="noopener nofollow noreferrer" title="Ricki Beckless GitHub">Ricki
                                Beckless</a>. All rights
                            reserved.
                        </p>
                    </footer>
                </div>
            </main>
        </>
    )
}