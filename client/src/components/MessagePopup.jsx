export default function MessagePopup({ message, setMessage, styledMessage, confirmationAction }) {
    /*
        Added styledMessage prop to conditionally render HTML content.
        This was added after editing the Events component to use HTML 
          content in the message to display a list of ideas for events.
    */

    const handleConfirmation = () => {
        confirmationAction();
        setMessage("");
    };

    return (
        <div className="message-popup">
            {styledMessage ? (
                <div className="message-popup-content" dangerouslySetInnerHTML={{ __html: message }} />
            ) : (
                <h3 className="message-popup-content">{message}</h3>
            )}

            {confirmationAction && (
                <button className="message-popup-confirm" onClick={() => handleConfirmation()}>Confirm</button>
            )}
            <button className="message-popup-close" onClick={() => setMessage("")}>Close</button>
        </div>
    )
};