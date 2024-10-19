export default function UnitFormModal({ subjectId, classId, classes, toggleUnitFormModal }) {
    const className = classes.find(cls => cls.unique_string_id === classId).name;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = document.getElementById('classForm');
        const formData = new FormData(form);
        const formObj = Object.fromEntries(formData.entries());
        formObj.classId = classId;

        formObj.learningObjectives = formObj.learningObjectives
            ? formObj.learningObjectives.split('\n').map(item => item.trim()).filter(Boolean)
            : [];

        const res = await fetch(`/api/units/${subjectId}/${classId}/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObj)
        });

        const data = await res.json();

        form.reset();
        toggleUnitFormModal(subjectId, classId);
    }

    return (
        <>
            <div id="modalOverlay"></div>
            <div id="classModal" className="modal">
                <h3 id="modal-title">Add Unit to {className}</h3>
                <form id="classForm">
                    <input className="modal-input" id="modalNameInput" type="text" name="name" placeholder="Unit Name" required />
                    <textarea className="modal-input" id="modalDescriptionInput" name="description" placeholder="Unit Description" rows="4"></textarea>
                    <textarea className="modal-input" id="modalLearningObjectivesInput" name="learningObjectives" placeholder="Learning Objectives (one per line)" rows="4"></textarea>
                    <textarea className="modal-input" id="modalUnitOutcomesInput" name="unitOutcomes" placeholder="Unit Outcomes" rows="4"></textarea>
                    <textarea className="modal-input" id="modalPrerequisitesInput" name="prerequisites" placeholder="Prerequisites" rows="4"></textarea>
                    <input type="number" min="1" className="modal-input" id="modalIdexInput" name="index" placeholder="Index" />

                    <div id="class-form-btn-holder">
                        <button id="modalCloseButton" type="button" onClick={(e) => toggleUnitFormModal(e, subjectId, classId)}>Close</button>
                        <button id="modalSubmitButton" type="submit" onClick={(e) => handleSubmit(e)}>Add Unit</button>
                    </div>
                </form>
            </div>
        </>
    );
};