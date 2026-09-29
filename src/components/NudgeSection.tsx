import React, { useState } from 'react';

const DAYS = [
  ['Mon', 1, 'MO'],
  ['Tue', 2, 'TU'],
  ['Wed', 3, 'WE'],
  ['Thu', 4, 'TH'],
  ['Fri', 5, 'FR'],
  ['Sat', 6, 'SA'],
  ['Sun', 0, 'SU']
] as const;

export const NudgeSection: React.FC = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(5); // Saturday
  const [time, setTime] = useState('18:00');

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatCalDate = (d: Date) =>
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    '00';

  const getCalendarUrl = () => {
    const [h, m] = (time || '18:00').split(':').map(Number);
    const day = DAYS[selectedDayIndex];
    const s = new Date();
    s.setHours(h, m, 0, 0);

    let add = (day[1] - s.getDay() + 7) % 7;
    if (add === 0 && s <= new Date()) {
      add = 7;
    }
    s.setDate(s.getDate() + add);
    const e = new Date(s.getTime() + 30 * 60000);

    return (
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' +
      encodeURIComponent('Write this week’s letter') +
      '&details=' +
      encodeURIComponent('Ten quiet minutes for someone you miss. Khath & Co.') +
      '&dates=' +
      formatCalDate(s) +
      '/' +
      formatCalDate(e) +
      '&recur=' +
      encodeURIComponent('RRULE:FREQ=WEEKLY;BYDAY=' + day[2])
    );
  };

  return (
    <section className="section" id="nudge">
      <div className="container">
        <div className="nudge rv in">
          <h2>A weekly nudge</h2>
          <p className="lead">
            Pick the day you usually have ten quiet minutes. We’ll add a repeating reminder to your calendar.
          </p>

          <div className="days" id="dayRow" role="group" aria-label="Day of the week">
            {DAYS.map((d, idx) => (
              <button
                key={d[0]}
                type="button"
                className={`day ${idx === selectedDayIndex ? 'on' : ''}`}
                onClick={() => setSelectedDayIndex(idx)}
                aria-pressed={idx === selectedDayIndex}
              >
                {d[0]}
              </button>
            ))}
          </div>

          <div className="nudge-row">
            <input
              className="field"
              type="time"
              id="nudgeTime"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Reminder time"
            />
            <a
              className="btn cta"
              id="nudgeBtn"
              href={getCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Add to Google Calendar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
