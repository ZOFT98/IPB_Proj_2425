import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import MapContainer from "../components/MapContainer";

const HomePage = () => {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const displayMonth = displayDate.getMonth();
  const displayYear = displayDate.getFullYear();
  const monthName = displayDate.toLocaleString('pt-PT', { month: 'long' });
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();

  const handleDateClick = (day) => {
    const newSelectedDate = new Date(displayYear, displayMonth, day);
    setSelectedDate(newSelectedDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    let dayCount = 1;

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < firstDayOfMonth) || dayCount > daysInMonth) {
          weekDays.push(<td key={`${week}-${day}`} className="p-2 text-gray-300 dark:text-gray-600"></td>);
        } else {
          const cellDate = new Date(displayYear, displayMonth, dayCount);

          const today = new Date();
          const isToday = cellDate.getDate() === today.getDate() &&
                        cellDate.getMonth() === today.getMonth() &&
                        cellDate.getFullYear() === today.getFullYear();

          const isSelected = selectedDate &&
                           cellDate.getDate() === selectedDate.getDate() &&
                           cellDate.getMonth() === selectedDate.getMonth() &&
                           cellDate.getFullYear() === selectedDate.getFullYear();

          const cellClassName = `p-2 text-center text-lg cursor-pointer ${
            isSelected 
              ? 'bg-blue-500 text-white rounded-full font-bold' 
              : isToday 
              ? 'bg-blue-100 dark:bg-blue-900 rounded-full font-bold' 
              : ''
          }`;
          
          const currentDayCount = dayCount;
          weekDays.push(
            <td 
              key={`${week}-${day}`} 
              className={cellClassName}
              onClick={() => handleDateClick(currentDayCount)}
            >
              {currentDayCount}
            </td>
          );
          dayCount++;
        }
      }
      days.push(<tr key={week}>{weekDays}</tr>);
      if (dayCount > daysInMonth) break;
    }
    return days;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const dayToFetch = new Date(selectedDate);
      dayToFetch.setHours(0, 0, 0, 0);

      const dateString = dayToFetch.toISOString().split('T')[0];
      const bookingsQuery = query(collection(db, 'bookings'), where('date', '==', dateString));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      setBookings(bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const startOfDay = Timestamp.fromDate(dayToFetch);
      const endOfDay = Timestamp.fromDate(new Date(dayToFetch.getTime() + 24 * 60 * 60 * 1000 - 1));
      const ticketsQuery = query(collection(db, 'tickets'), where('date', '>=', startOfDay), where('date', '<=', endOfDay));
      const ticketsSnapshot = await getDocs(ticketsQuery);
      setTickets(ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setLoading(false);
    };

    if(selectedDate) fetchEvents();
  }, [selectedDate]);

  return (
    <div className="flex dark:text-gray-100">
      {/* Main Content - Map Section */}
      <main className="flex-1">
        <div className="h-full p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full overflow-hidden">
            <div className="h-[600px]">  {/* Fixed height for map */}
              <MapContainer />
            </div>
          </div>
        </div>
      </main>

      {/* Calendar Section */}
      <aside className="w-96 bg-white dark:bg-gray-800 p-6 shadow-md dark:text-gray-100 ml-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase">{monthName}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{displayYear}</p>
        </div>

        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <th key={day} className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{generateCalendarDays()}</tbody>
        </table>

        <div className="mt-8">
          <h3 className="font-bold mb-3 text-lg">Eventos Diários</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-base">
              {selectedDate.toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            {loading ? (
              <p className="text-base mt-2">A carregar eventos...</p>
            ) : bookings.length === 0 && tickets.length === 0 ? (
              <p className="text-base mt-2">Não há eventos programados para hoje.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {bookings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-2">Reservas:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {bookings.map(booking => (
                        <li key={booking.id}>{booking.title} às {booking.startTime}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tickets.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-md mb-2">Tickets:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {tickets.map(ticket => (
                        <li key={ticket.id}>{ticket.title} - {ticket.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;