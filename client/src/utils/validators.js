export const isValidSubject = async (subjectId) => {
    const res = await fetch(`/api/validate/subject/${subjectId}`);
    if (res.ok) {
        return true;
    }
    return false;
};

export const isValidClass = async (subjectId, classId) => {
    const res = await fetch(`/api/validate/class/${subjectId}/${classId}`);
    if (res.ok) {
        return true;
    }
    return false;
};

export const isValidUnit = async (subjectId, classId, unitId) => {
    const res = await fetch(`/api/validate/unit/${subjectId}/${classId}/${unitId}`);
    if (res.ok) {
        return true;
    }
    return false;
};
