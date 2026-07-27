import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Booking } from "../types";
import Card from "./Card";

const localizer = momentLocalizer(moment);

interface BookingCalendarProps {
  bookings: Booking[];
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const events = bookings.map((b) => ({
    title: `Booking #${b.id}`,
    start: new Date(b.event_date),
    end: new Date(b.event_date),
    allDay: true,
  }));

  const eventPropGetter = () => ({
    className: "bg-rose-100 text-rose-700 rounded-md border-none",
  });

  return (
    <Card title="Bookings Calendar">
      <div className="h-96">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventPropGetter}
          views={["month", "week", "day"]}
          defaultView="month"
          toolbar
          style={{ height: "100%" }}
        />
      </div>
    </Card>
  );
}
