import { useState, useEffect, useContext } from 'react';
import { FetchContext } from '../../context/FetchProvider.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Quill from 'quill';
import LoadingScreen from '../LoadingScreen';
import MessagePopup from '../MessagePopup';

const AddLessonModal = ({ show, onClose, subjectId, classId, unit, topic }) => {
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const quill = new Quill('#editor');

    return (
        <>
            <div id="modalOverlay"></div>
            <div id="add-lesson-modal" className="modal">
                <div className="add-lesson-modal-content">
                    <form onSubmit={handleSubmit}>
                        
                    </form>
                </div>
            </div>
        </>
    );
};