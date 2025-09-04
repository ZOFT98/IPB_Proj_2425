import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import LeafletMap from "../components/LeafletMap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarPlus,
  FaBuilding,
  FaUserPlus,
  FaTicketAlt,
  FaEuroSign,
  FaFutbol,
  FaClock,
  FaUsers,
  FaTableTennis,
} from "react-icons/fa";
import { FaBasketball } from "react-icons/fa6";

const HomePage = () => {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventDays, setEventDays] = useState(new Set());

  const bookingStatusEmojis = {
    confirmed: "✅",
    pending: "⏳",
  };

  const ticketStatusEmojis = {
    completed: "✅",
    pending: "⏳",
    in_progress: "🔄",
  };

  const displayMonth = displayDate.getMonth();
  const displayYear = displayDate.getFullYear();
  const monthName = displayDate.toLocaleString("pt-PT", { month: "long" });
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();

  const modalityIcons = {
    Futebol: <FaFutbol className="mr-2" />,
    Futsal: <FaFutbol className="mr-2" />,
    Basquetebol: <FaBasketball className="mr-2" />,
    Tenis: <FaTableTennis className="mr-2" />,
  };

  const getModalityIcon = (modality) => {
    return (
      modalityIcons[modality] || <FaFutbol className="mr-2 text-gray-400" />
    );
  };

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
          weekDays.push(
            <td
              key={`${week}-${day}`}
              className="p-2 text-gray-300 dark:text-gray-600"
            ></td>,
          );
        } else {
          const cellDate = new Date(displayYear, displayMonth, dayCount);

          const today = new Date();
          const isToday =
            cellDate.getDate() === today.getDate() &&
            cellDate.getMonth() === today.getMonth() &&
            cellDate.getFullYear() === today.getFullYear();

          const isSelected =
            selectedDate &&
            cellDate.getDate() === selectedDate.getDate() &&
            cellDate.getMonth() === selectedDate.getMonth() &&
            cellDate.getFullYear() === selectedDate.getFullYear();

          const hasEvent = eventDays.has(dayCount);
          const cellClassName = `p-2 text-center text-lg cursor-pointer ${
            isSelected
              ? "bg-blue-500 text-white rounded-full font-bold"
              : isToday
                ? "bg-blue-100 dark:bg-blue-900 rounded-full font-bold"
                : hasEvent
                  ? "bg-green-100 dark:bg-green-900/40 rounded-full"
                  : ""
          }`;

          const currentDayCount = dayCount;
          weekDays.push(
            <td
              key={`${week}-${day}`}
              className={cellClassName}
              onClick={() => handleDateClick(currentDayCount)}
            >
              {currentDayCount}
            </td>,
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
    const fetchSpaces = async () => {
      const spacesCollection = collection(db, "spaces");
      const spacesSnapshot = await getDocs(spacesCollection);
      const spacesList = spacesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSpaces(spacesList);
    };
    fetchSpaces();
  }, []);

  useEffect(() => {
    const fetchMonthEvents = async () => {
      const startOfMonth = new Date(displayYear, displayMonth, 1);
      const endOfMonth = new Date(displayYear, displayMonth + 1, 0);

      const startOfMonthStr = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-01`;
      const endOfMonthStr = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      const monthBookingsQuery = query(
        collection(db, "bookings"),
        where("date", ">=", startOfMonthStr),
        where("date", "<=", endOfMonthStr),
      );

      const monthTicketsQuery = query(
        collection(db, "tickets"),
        where("date", ">=", Timestamp.fromDate(startOfMonth)),
        where("date", "<=", Timestamp.fromDate(endOfMonth)),
      );

      const [bookingsSnapshot, ticketsSnapshot] = await Promise.all([
        getDocs(monthBookingsQuery),
        getDocs(monthTicketsQuery),
      ]);

      const daysWithEvents = new Set();
      bookingsSnapshot.docs.forEach((doc) => {
        const booking = doc.data();
        if (booking.status !== "cancelled") {
          daysWithEvents.add(new Date(booking.date).getUTCDate());
        }
      });
      ticketsSnapshot.docs.forEach((doc) => {
        const ticket = doc.data();
        if (ticket.status !== "cancelled") {
          daysWithEvents.add(ticket.date.toDate().getDate());
        }
      });

      setEventDays(daysWithEvents);
    };

    fetchMonthEvents();
  }, [displayMonth, displayYear, daysInMonth]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isAdmin = currentUser && currentUser.role === "admin";
  const isSuperAdmin = currentUser && currentUser.role === "superadmin";

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const dayToFetch = new Date(selectedDate);
      dayToFetch.setHours(0, 0, 0, 0);

      const year = dayToFetch.getFullYear();
      const month = String(dayToFetch.getMonth() + 1).padStart(2, "0");
      const day = String(dayToFetch.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("date", "==", dateString),
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      setBookings(
        bookingsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((booking) => booking.status !== "cancelled"),
      );

      const startOfDay = Timestamp.fromDate(dayToFetch);
      const endOfDay = Timestamp.fromDate(
        new Date(dayToFetch.getTime() + 24 * 60 * 60 * 1000 - 1),
      );
      const ticketsQuery = query(
        collection(db, "tickets"),
        where("date", ">=", startOfDay),
        where("date", "<=", endOfDay),
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      setTickets(
        ticketsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((ticket) => ticket.status !== "cancelled"),
      );

      setLoading(false);
    };

    if (selectedDate) fetchEvents();
  }, [selectedDate]);

  const spaceMarkers = spaces
    .filter((space) => space.latitude && space.longitude)
    .map((space) => ({
      position: [space.latitude, space.longitude],
      popupContent: (
        <div style={{ lineHeight: "1.4" }}>
          <img
            src={space.image || "src/uploads/field1.jpg"}
            alt={space.name}
            style={{
              width: "150px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
          <h3
            style={{
              fontWeight: "bold",
              marginTop: "10px",
              marginBottom: "5px",
            }}
          >
            {space.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
            {getModalityIcon(space.modality)}
            <span>{space.modality}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
            <FaEuroSign className="mr-2" />
            <span>{space.price}€/h</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
            <FaClock className="mr-2" />
            <span>
              {space.openingTime} - {space.closingTime}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
            <FaUsers className="mr-2" />
            <span>{space.maxCapacity}</span>
          </div>
          <div
            style={{
              color: space.available ? "#28a745" : "#dc3545",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              marginTop: "8px",
            }}
          >
            {space.available ? "Disponível" : "Indisponível"}
          </div>
        </div>
      ),
    }));

  return (
    <div className="flex flex-col h-full dark:text-gray-100">
      {/* Quick Actions */}
      {(isAdmin || isSuperAdmin) && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/add-bookings")}
              className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaCalendarPlus className="mr-2" /> Adicionar Reserva
            </button>
            <button
              onClick={() => navigate("/spaces/add")}
              className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaBuilding className="mr-2" /> Adicionar Instalação
            </button>
            <button
              onClick={() => navigate("/add-user")}
              className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaUserPlus className="mr-2" /> Adicionar Utilizador
            </button>
            <button
              onClick={() => navigate("/add-ticket")}
              className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaTicketAlt className="mr-2" /> Adicionar Ticket
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        <main className="flex-1">
          <div className="h-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full overflow-hidden">
              <div className="h-full">
                <LeafletMap
                  center={[41.79685, -6.76843]}
                  zoom={15}
                  markers={spaceMarkers}
                />
              </div>
            </div>
          </div>
        </main>

        <aside className="w-96 bg-white rounded-lg dark:bg-gray-800 p-6 shadow-md dark:text-gray-100 ml-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold uppercase">{monthName}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {displayYear}
            </p>
          </div>

          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                  (day) => (
                    <th
                      key={day}
                      className="py-3 text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>{generateCalendarDays()}</tbody>
          </table>

          <div className="mt-8">
            <h3 className="font-bold mb-3 text-lg">Eventos Diários</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-base">
                {selectedDate.toLocaleDateString("pt-PT", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {loading ? (
                <p className="text-base mt-2">A carregar eventos...</p>
              ) : bookings.length === 0 && tickets.length === 0 ? (
                <p className="text-base mt-2">
                  Não há eventos programados para hoje.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {bookings.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-md mb-2">Reservas:</h4>
                      <div className="space-y-1">
                        {bookings.map((booking) => (
                          <p key={booking.id}>
                            {bookingStatusEmojis[booking.status]}{" "}
                            {booking.title} às {booking.startTime}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {tickets.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-md mb-2">Tickets:</h4>
                      <div className="space-y-1">
                        {tickets.map((ticket) => (
                          <p key={ticket.id}>
                            {ticketStatusEmojis[ticket.status]} {ticket.title} -{" "}
                            {ticket.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
