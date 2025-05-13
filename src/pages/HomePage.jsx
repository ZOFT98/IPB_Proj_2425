import MapContainer from "../components/MapContainer";

const HomePage = () => {
  // Date logic (unchanged)
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();

  // Generate calendar days (unchanged)
  const generateCalendarDays = () => {
    const days = [];
    let dayCount = 1;

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < firstDayOfMonth) || dayCount > daysInMonth) {
          weekDays.push(<td key={`${week}-${day}`} className="p-2 text-gray-300 dark:text-gray-600"></td>);
        } else {
          const isToday = dayCount === currentDate.getDate();
          weekDays.push(
            <td 
              key={`${week}-${day}`} 
              className={`p-2 text-center text-lg ${isToday ? 'bg-blue-100 dark:bg-blue-900 rounded-full font-bold' : ''}`}
            >
              {dayCount}
            </td>
          );
          dayCount++;
        }
      }
      days.push(<tr key={week}>{weekDays}</tr>);
    }
    return days;
  };

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
          <h2 className="text-2xl font-bold uppercase">{currentMonth}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{currentYear}</p>
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
          <h3 className="font-bold mb-3 text-lg">Eventos Diários</h3>  {/* Fixed apostrophe */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-base">
              {currentDate.toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-base mt-2">Não há eventos programados para hoje.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;