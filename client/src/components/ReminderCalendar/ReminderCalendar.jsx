import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ReminderCalendar.css";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

function ReminderCalendar() {
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);

  useEffect(() => {
    const fetchReminders = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "reminders"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      setReminders(data);
    };

    fetchReminders();
  }, []);

  const getTileClass = ({ date }) => {
    const hasReminder = reminders.some(r =>
      new Date(r.startTime).toDateString() === date.toDateString()
    );
    return hasReminder ? "reminder-date" : null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const events = reminders.filter(r =>
      new Date(r.startTime).toDateString() === date.toDateString()
    );
    setEventsOnSelectedDate(events);
  };

  return (
    <div className="calendar-section">
      <h3>Auction Reminders</h3>
      <Calendar
        tileClassName={getTileClass}
        onClickDay={handleDateClick}
      />

      {selectedDate && (
        <div className="events-list">
          <h4>Events on {selectedDate.toDateString()}</h4>
          {eventsOnSelectedDate.length === 0 ? (
            <p>No events</p>
          ) : (
            <ul>
              {eventsOnSelectedDate.map((event, i) => (
                <li key={i}>
                  <strong>{event.title}</strong><br />
                  {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ReminderCalendar;