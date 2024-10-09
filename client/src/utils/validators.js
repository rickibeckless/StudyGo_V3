export const isValidSubject = async (subjectId) => {
    const res = await fetch(`/api/subjects/${subjectId}`);
    if (res.ok) {
        return true;
    }
    return false;
};

export const isValidClass = async (subjectId, classId) => {
    const res = await fetch(`/api/classes/${subjectId}/${classId}`);
    if (res.ok) {
        return true;
    }
    return false;
};

export const isValidUnit = async (subjectId, classId, unitId) => {
    const res = await fetch(`/api/classes/${subjectId}/${classId}/${unitId}`);
    if (res.ok) {
        return true;
    }
    return false;
};
