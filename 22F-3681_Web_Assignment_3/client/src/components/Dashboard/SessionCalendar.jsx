import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const SessionCalendar = ({ sessions }) => {
  const events = sessions.map(session => ({
    title: `${session.subject} with ${session.student?.username || 'N/A'}`,
    start: new Date(session.date + 'T' + session.time),
    end: moment(new Date(session.date + 'T' + session.time)).add(session.duration, 'hours').toDate(),
    allDay: false,
    resource: session, // Attach the session object for potential details
  }));

  return (
    <div className="session-calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={(event) => {
          const backgroundColor = event.resource.status === 'pending' ? '#f0ad4e' : '#5cb85c';
          return { style: { backgroundColor } };
        }}
        tooltipAccessor={(event) => `Subject: ${event.resource.subject}\nStudent: ${event.resource.student?.username || 'N/A'}\nStatus: ${event.resource.status}`}
      />
    </div>
  );
};

export default SessionCalendar;