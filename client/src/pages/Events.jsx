import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FetchContext } from "../context/FetchProvider.jsx";
import PageTitle from "../components/PageTitle.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import MessagePopup from "../components/MessagePopup.jsx";
import EventCard from "../components/eventsComponents/EventCard.jsx";
import NewEventModal from "../components/eventsComponents/NewEventModal.jsx";
import "../styles/events.css";
import "../styles/eventModals.css";

export default function Events() {
    const { fetchWithRetry } = useContext(FetchContext);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const [events, setEvents] = useState([]);
    const [currentEvents, setCurrentEvents] = useState([]);
    const [openNewEventModal, setOpenNewEventModal] = useState(false);

    const toggleNewEventModal = () => {
        setOpenNewEventModal(!openNewEventModal);
        document.body.classList.toggle("modal-open");
    };

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await fetchWithRetry('/api/events');
                //const data = await response.json();

                const currentDate = new Date();
                const currentEvents = data.filter(event => {
                    const eventDate = new Date(event.event_date_time);
                    return eventDate.toDateString() === currentDate.toDateString();
                });
                setCurrentEvents(currentEvents);
                setEvents(data);
                setLoading(false);
            } catch (error) {
                console.error(`Error fetching events: ${error.message}`);
            };
        };

        fetchEvents();
    }, []);

    return (
        <main id="events-body" className="container">
            {loading ? <LoadingScreen /> : null}
            {message ? <MessagePopup message={message} /> : null}
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
                        <h2 className="events-section-header">Current Events</h2>
                        <ul id="current-event-list">
                            {currentEvents.map((event, index) => {
                                const evenOrOdd = index % 2 === 0 ? 'even' : 'odd';
                                return (
                                    <EventCard 
                                        key="current-event-card-${index}"
                                        event={event} 
                                        cardKey={event.event_id} 
                                        currentEvent={true} 
                                        evenOrOdd={evenOrOdd}
                                    />
                                );
                            })}
                        </ul>
                    </section>
                : null}

                <section id="all-events-section">
                    <h2 className="events-section-header">All Events</h2>
                    <ul id="event-list">
                        {events.length > 0 ? events.map((event, index) => {
                            return <EventCard key={`event-card-${index}`} event={event} cardKey={event.event_id} currentEvent={false} />;
                        }) : <li id="default-li" key="event-default">Nothing yet! <a href="#">Add some events</a> to get started!</li>}
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