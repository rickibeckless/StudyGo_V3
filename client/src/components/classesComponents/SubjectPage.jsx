import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import PageTitle from "../PageTitle.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import UnitFormModal from "./UnitFormModal.jsx";

export default function SubjectPage({ subjectId }) {
    const [subject, setSubject] = useState(null);
    const [classes, setClasses] = useState(null);
    const [unitsByClass, setUnitsByClass] = useState({});
    const [topicsByUnit, setTopicsByUnit] = useState({});
    const [openUnitFormModal, setOpenUnitFormModal] = useState(false);
    const [unitFormModalIds, setUnitFormModalIds] = useState({ subjectId: null, classId: null });
    const [openClassId, setOpenClassId] = useState(null);
    const [openUnitId, setOpenUnitId] = useState(null);

    const toggleUnitFormModal = (e, subjectId, classId) => {
        e.stopPropagation();
        setOpenUnitFormModal(!openUnitFormModal);
        setUnitFormModalIds({ subjectId, classId });
    };

    const toggleUnitsDropdown = (e, classId) => {
        e.stopPropagation();
        setOpenClassId(openClassId === classId ? null : classId);
    };

    const toggleTopicsDropdown = (e, unitId) => {
        e.stopPropagation();
        setOpenUnitId(openUnitId === unitId ? null : unitId);
    };

    if (openUnitFormModal) {
        document.body.classList.add("modal-open");
    } else {
        document.body.classList.remove("modal-open");
    };

    useEffect(() => {
        const fetchSubject = async () => {
            const subjectRes = await fetch(`/api/subjects/${subjectId}`);
            const subjectData = await subjectRes.json();
            setSubject(subjectData[0]);
        };

        const fetchClasses = async () => {
            const classesRes = await fetch(`/api/classes/${subjectId}`);
            const classesData = await classesRes.json();
            setClasses(classesData);

            classesData.forEach(cls => fetchUnits(cls.unique_string_id));
        };

        fetchSubject();
        fetchClasses();
    }, [subjectId]);

    const fetchUnits = async (classId) => {
        const unitsRes = await fetch(`/api/classes/${subjectId}/${classId}`);
        const unitsData = await unitsRes.json();

        setUnitsByClass(prevState => ({
            ...prevState,
            [classId]: unitsData
        }));

        unitsData.forEach(unit => fetchTopics(classId, unit.unique_string_id));
    };

    const fetchTopics = async (classId, unitId) => {
        const topicsRes = await fetch(`/api/topics/${subjectId}/${classId}/${unitId}`);
        const topicsData = await topicsRes.json();

        setTopicsByUnit(prevState => ({
            ...prevState,
            [unitId]: topicsData
        }));
    };

    if (!subject) {
        return <LoadingScreen />;
    };

    return (
        <>
            <PageTitle title={`${subject.name} Classes | StudyGo`} />
            <h2>All {subject.name} Classes</h2>
            <ul id="subject-list">
                {classes === null && <LoadingScreen />}

                {classes?.length === 0 ? (
                    <li id="default-li">
                        Nothing yet! <a href="#">Add some classes</a> to get started!
                    </li>
                ) : (
                    classes?.map(cls => (
                        <div className="subject-holder" onClick={(e) => toggleUnitsDropdown(e, cls.unique_string_id)} key={cls.unique_string_id}>
                            <li className="subject">
                                {cls.name}
                                <a href={`/${subjectId}/${cls.unique_string_id}`} title={`${window.location.origin}/${subjectId}/${cls.unique_string_id}`} className="view-all-classes-link">
                                    (all {cls.name} units →)
                                </a>
                            </li>

                            {openClassId !== cls.unique_string_id ? (
                                <div className="subject-description" >
                                    {cls.description}

                                    <div className="count-and-button-holder">
                                        {unitsByClass[cls.unique_string_id] ? (
                                            unitsByClass[cls.unique_string_id].length === 1 ? (
                                                <p className="subject-class-count">
                                                    <span className="subject-class-count-number">{unitsByClass[cls.unique_string_id].length}</span> unit
                                                </p>
                                            ) : (
                                                <p className="subject-class-count">
                                                    <span className="subject-class-count-number">{unitsByClass[cls.unique_string_id].length}</span> units
                                                </p>
                                            )
                                        ) : (
                                            <LoadingScreen />
                                        )}
                                        <button className="add-class-button" title="Add a unit" onClick={(e) => toggleUnitFormModal(e, subjectId, cls.unique_string_id)}>+</button>
                                    </div>
                                </div>
                            ) : (
                                <ul className="class-dropdown">
                                    {unitsByClass[cls.unique_string_id] ? (
                                        unitsByClass[cls.unique_string_id].length === 0 ? (
                                            <div className="class-holder">
                                                <li className="class">No Units Available!</li>
                                            </div>
                                        ) : (
                                            unitsByClass[cls.unique_string_id].map(unit => (
                                                <div className="class-holder" key={unit.unique_string_id}>
                                                    <li className="class" onClick={(e) => toggleTopicsDropdown(e, unit.unique_string_id)}>
                                                        {unit.name}
                                                    </li>

                                                    {openUnitId === unit.unique_string_id && (
                                                        <ul className="unit-dropdown">
                                                            {topicsByUnit[unit.unique_string_id] ? (
                                                                topicsByUnit[unit.unique_string_id].map(topic => (
                                                                    <li className="unit-item-holder" key={topic.unique_string_id} onClick={(e) => e.stopPropagation()}>
                                                                        <a href={`${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}
                                                                            title={`${window.location.origin}/${unit.subjectid}/${unit.classid}/${unit.unique_string_id}`}
                                                                            className="unit"
                                                                        >
                                                                            {topic.name}
                                                                        </a>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <LoadingScreen />
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        <LoadingScreen />
                                    )}
                                </ul>
                            )}
                        </div>
                    ))
                )}
            </ul>
            {openUnitFormModal && (
                <UnitFormModal
                    subjectId={unitFormModalIds.subjectId}
                    classId={unitFormModalIds.classId}
                    classes={classes}
                    toggleUnitFormModal={toggleUnitFormModal}
                />
            )}
        </>
    );
};