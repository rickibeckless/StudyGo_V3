import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageTitle from "../components/PageTitle.jsx";
import "../styles/events.css";
import EventCard from "../components/eventsComponents/EventCard.jsx";
import NewEventModal from "../components/eventsComponents/NewEventModal.jsx";

export default function Events() {
    const [events, setEvents] = useState([]);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [openNewEventModal, setOpenNewEventModal] = useState(false);

    if (openNewEventModal) {
        document.body.classList.add("modal-open");
    } else {
        document.body.classList.remove("modal-open");
    };

    const toggleNewEventModal = () => {
        setOpenNewEventModal(!openNewEventModal);
    };

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch("/api/events");
                const data = await response.json();
                const currentDate = new Date();
                const currentEvents = data.filter(event => {
                    const eventDate = new Date(event.event_date_time);
                    return eventDate.toDateString() === currentDate.toDateString();
                });

                setCurrentEvents(currentEvents);
                setEvents(data);
            } catch (error) {
                console.error(`Error fetching events: ${error.message}`);
            };
        };

        fetchEvents();
    }, []);

    return (
        <main id="events-body" className="container">
            <PageTitle title="All Events | StudyGo" />
            {/* <aside id="subjects-filter-holder">
                <p id="subject-clear-btn" onClick={() => { clearSearchAndFilters() }}>clear filters</p>
                <form id="events-search-form">
                    <label htmlFor="events-search">Search Events</label>
                    <input type="text" id="events-search" name="events-search" placeholder="Search for an event..." />
                    <button type="button" id="event-search-btn">Search</button>
                </form>

                <form id="events-filter-form">
                    <label htmlFor="events-filter">Filter Events</label>
                    <select id="events-filter" name="events-filter">
                        <option value="alphabetical">Alphabetical</option>
                        <option value="by-date">By Date</option>
                        <option value="by-importance">By Importance</option>
                        <option value="by-urgency">By Urgency</option>
                    </select>

                    <label htmlFor="events-filter-order">Order</label>
                    <select id="events-filter-order" name="events-filter-order">
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>

                    <div className="checkbox-container">
                        <label htmlFor="events-filter-show-completed" className="checkbox-label">Show Completed Events</label>
                        <input type="checkbox" id="events-filter-show-completed" name="events-filter-show-completed" value="true" />
                        <label htmlFor="events-filter-show-completed" className="custom-checkbox"></label>
                    </div>

                    <button type="button" id="event-filter-btn">Filter</button>
                </form>
            </aside> */}

            <div id="events-section-holder">
                {currentEvents.length > 0 ?
                    <section id="current-events-section">
                        <h2>Current Events</h2>
                        <ul id="current-event-list">
                            {currentEvents.map(event => {
                                return <EventCard event={event} cardKey={event.event_id} currentEvent={true} />;
                            })}
                        </ul>
                    </section>
                : null}

                <section id="all-events-section">
                    <h2>All Events</h2>
                    <ul id="event-list">
                        {events.length > 0 ? events.map(event => {
                            return <EventCard event={event} cardKey={event.event_id} currentEvent={false} />;
                        }) : <li id="default-li">Nothing yet! <a href="#">Add some events</a> to get started!</li>}
                    </ul>
                </section>
            </div>

            <aside id="new-event-button-holder">
                <button type="button" id="new-event-button" onClick={() => toggleNewEventModal()}>New Event</button>
            </aside>

            {openNewEventModal && (
                <NewEventModal toggleNewEventModal={toggleNewEventModal} />
            )}
        </main>
    );
};