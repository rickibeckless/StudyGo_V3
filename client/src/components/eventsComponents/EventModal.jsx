import { useState, useEffect } from "react";
import LoadingScreen from "../LoadingScreen.jsx";

export default function EventModal({ event, toggleEventModal, currentEvent }) {
    const [host, setHost] = useState(null);
    const [hostInfoVisible, setHostInfoVisible] = useState(false);
    console.log(event);

    useEffect(() => {
        async function fetchHost() {
            try {
                const res = await fetch(`/api/events/${event.event_host_id}`);
                const data = await res.json();
                setHost(data[0]);
            } catch (error) {
                console.error(`Error fetching host: ${error.message}`);
            };
        };

        fetchHost();
    }, []);

    const toggleHostInfo = () => {
        setHostInfoVisible(!hostInfoVisible);
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

    return (
        <>
            <div id="modalOverlay"></div>
            <div id="event-modal" className="modal">
                <div id="event-modal-content">
                    <h3 className="event-modal-info-title">{event.event_name}</h3>

                    <div className="event-host-info">
                        <h4 className="event-info-header">Host: <span className="event-info-host-name">{host?.host_name} "<span className="event-info-host-info-title">{host?.host_title}</span>"</span></h4>
                        
                        <div className="event-host-expanded-info-holder">
                            <div className="arrow-holder">
                                <span className="event-host-label">Host Contact Information</span>
                                <div className={`event-host-arrow ${hostInfoVisible ? 'down' : 'right'}`} onClick={() => toggleHostInfo()}></div>
                            </div>
                            <div className={`event-host-expanded-info ${hostInfoVisible ? 'visible' : 'hidden'}`}>
                                <h4 className="event-info-header">Email: <span className="event-info-host-email">{host?.host_email}</span></h4>
                                <h4 className="event-info-header">Phone: <span className="event-info-host-phone">{host?.host_phone}</span></h4>
                            </div>
                        </div>
                    </div>
                    
                    <h4 className="event-info-header">Organization: <span className="event-info-organization">{event.event_organization}</span></h4>
                    <h4 className="event-info-header">Subject: <span className="event-info-subject">{event.event_subject}</span></h4>
                    <h4 className="event-info-header">Description: <span className="event-info-description">{event.event_description}</span></h4>
                    <h4 className="event-info-header">Date & Time: <span className="event-info-time">{eventTime} — {eventEndTime}</span></h4>
                    <h4 className="event-info-header">Date: <span className="event-info-date" title={eventDateFull}>{eventDate}</span></h4>
                    
                    {!currentEvent ?
                        <div className="event-info-date-time-holder">
                            <h4 className="event-info-time-title">Time Until Event:</h4>
                            <p className="event-info-remaining">{formattedDays} days, {formattedHours} hours, {leftoverMinutes} minutes</p>
                        </div>
                    : null
                    }
                </div>
                <button id="modalCloseButton" type="button" onClick={() => toggleEventModal()}>Close</button>
            </div>
        </>
    );
};