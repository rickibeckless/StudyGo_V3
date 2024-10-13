import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageTitle from "../PageTitle.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import EventModal from "./EventModal.jsx";

export default function EventCard({ event, cardKey, currentEvent, evenOrOdd }) {
    const [openEventModal, setOpenEventModal] = useState(false);
    
    const toggleEventModal = () => {
        setOpenEventModal(!openEventModal);
        document.body.classList.toggle("modal-open");
    };

    const eventDateTime = new Date(event.event_date_time);

    const eventDateFull = eventDateTime.toDateString()
    const eventDate = eventDateTime.toLocaleDateString();
    const eventTime = eventDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const eventDuration = event.event_duration.hours;
    const eventEndDateTime = new Date(eventDateTime.getTime() + eventDuration * 60 * 60 * 1000);

    const eventEndTime = eventEndDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    const timeUntilEvent = new Date(event.event_date_time).getTime() - new Date().getTime();

    const timeUntilEventDays = Math.floor(timeUntilEvent / (1000 * 60 * 60 * 24));
    const leftoverMilliseconds = timeUntilEvent % (1000 * 60 * 60 * 24);
    const leftoverHours = Math.floor(leftoverMilliseconds / (1000 * 60 * 60));
    const leftoverMinutes = Math.floor((leftoverMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    const formattedDays = String(timeUntilEventDays).padStart(2, '0');
    const formattedHours = String(leftoverHours).padStart(2, '0');

    const splicedDescription = event.event_description.length > 40 ? `${event.event_description.slice(0, 40)}...` : event.event_description;

    const handleEventClick = () => {
        toggleEventModal();
    };

    return (
        <>
            <li key={cardKey} className={`${currentEvent ? `current-event-item` : `event-item`} ${evenOrOdd ? `${evenOrOdd}` : ``}`} onClick={() => handleEventClick()}>
                <div className="event-container">
                    <div className="event-info-holder">
                        <h3 className="event-info-title">{event.event_name}</h3>
                        {!currentEvent ? <p className="event-info-description">{event.event_description}</p> : <p className="event-info-description">{splicedDescription}</p>}
                        {/* <p className="event-info-description">{event.event_description}</p> */}
                        {!currentEvent ?
                            <div className="event-info-date-time-holder">
                                <p className="event-info-date" title={eventDateFull}>{eventDate}</p>
                                <p className="event-info-time">{eventTime} — {eventEndTime}</p>
                                
                                <h4 className="event-info-time-title">Time Until Event:</h4>
                                <p className="event-info-remaining">{formattedDays} days, {formattedHours} hours, {leftoverMinutes} minutes</p>
                            </div>
                        : null
                        }
                    </div>
                </div>
            </li>

            {openEventModal && (
                <EventModal event={event} currentEvent={currentEvent} toggleEventModal={toggleEventModal} />
            )}
        </>
    );
};