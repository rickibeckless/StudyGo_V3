import React, { useEffect, useState } from "react";
import PageTitle from "../components/PageTitle.jsx";
import "../styles/home.css";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function Home() {
    const handleButtonClick = () => {
        const homeSectionBtn = document.getElementById('home-section-button');
        homeSectionBtn.scrollIntoView({ behavior: 'smooth' });
    };

    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        const subjectsRes = await fetch('/api/subjects');
        const subjects = await subjectsRes.json();

        const classesRes = await fetch(`/api/classes`);
        const classes = await classesRes.json();
        
        setClasses(classes);

        const classesSubIdsSet = new Set(classes.map(clsObj => clsObj.subjectid));
        const filteredSubjects = subjects.filter(subject => classesSubIdsSet.has(subject.unique_string_id));
        filteredSubjects.splice(5);
        setSubjects(filteredSubjects);
    };

    return (
        <main id="home-body" className="container">
            <PageTitle title="StudyGo" />
            <section id="home-section">
                <h2 id="home-section-title">Welcome to StudyGo</h2>
                <p id="home-section-description">The best place to learn and study online.</p>
                <button
                    id="home-section-button"
                    className="button"
                    type="button"
                    onClick={handleButtonClick}
                >
                    Get Started
                </button>
            </section>

            <section id="home-subjects-section">
                <h2>Top 5 Subjects</h2>
                <ul id="home-subject-list">
                    {subjects === null && <LoadingScreen />}

                    {subjects.length === 0 ? (
                        <>
                            <li id="default-li">Nothing yet! <a href="#">Add some subjects</a> to get started!</li>
                            <LoadingScreen />
                        </>
                    ) : (
                        subjects.map(subject => (
                            <Subject
                                key={subject.unique_string_id}
                                subject={subject}
                                classes={classes.filter(cls => cls.subjectid === subject.unique_string_id)}
                            />
                        ))
                    )}
                </ul>
            </section>
        </main>
    );
};

function Subject({ subject, classes }) {
    const [showClasses, setShowClasses] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

    const toggleClasses = () => {
        setShowClasses(!showClasses);
        setShowDescription(!showDescription);
    };

    if (!classes) {
        return (
            <LoadingScreen />
        );
    };

    return (
        <div className="home-subject-holder" id={subject.unique_string_id}>
            <li className="home-subject" onClick={toggleClasses}>
                {subject.name}
                <a href={`/${subject.unique_string_id}`} className={`home-view-all-classes-link ${showClasses ? '' : 'hidden-class-link'}`}>
                    (all {subject.name} classes →)
                </a>
            </li>
            <p className={`home-subject-description ${showDescription ? '' : 'hidden-description'}`}>
                {subject.description}
            </p>
            {showClasses && (
                <ul className="home-class-dropdown">
                    {classes.length > 0 ? (
                        classes.slice(0, 5).map(classObj => (
                            <Class key={classObj.unique_string_id} classObj={classObj} />
                        ))
                    ) : (
                        <li>No classes available!</li>
                    )}
                </ul>
            )}
        </div>
    );
};

function Class({ classObj }) {
    const [showUnits, setShowUnits] = useState(false);
    const [units, setUnits] = useState([]);

    const fetchUnits = async () => {
        const res = await fetch(`/api/classes/${classObj.subjectid}/${classObj.unique_string_id}`);
        const units = await res.json();
        setUnits(units);
    };

    const toggleUnits = () => {
        setShowUnits(!showUnits);
        if (units.length === 0) {
            fetchUnits();
        }
    };

    return (
        <div className="home-class-holder">
            <li className="home-class" onClick={toggleUnits}>
                {classObj.name}
            </li>
            {showUnits && (
                <ul className="unit-dropdown home-unit-dropdown">
                    {units.length > 0 ? (
                        units.map(unit => (
                            <Unit key={unit.unique_string_id} unit={unit} />
                        ))
                    ) : (
                        <li>No units available!</li>
                    )}
                </ul>
            )}
        </div>
    );
};

function Unit({ unit }) {
    return (
        <li className="home-unit-item-holder">
            <a href={`/${unit.subjectid}/${unit.unique_string_id}`} className="home-unit">
                {unit.name}
            </a>
        </li>
    );
};