import { Link } from "react-router-dom";
import { FaUsers, FaCalendarAlt, FaTicketAlt, FaSignOutAlt } from "react-icons/fa";

const HomePage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Left */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Espacos Desportivos</h2>
        
        <div className="mb-8">
          <p className="text-gray-600 mb-6">
            Body text for whatever youd like to say. Add main takeaway points, quote, 
            anecdotes, or even a very very short story.
          </p>
        </div>

        {/* Navigation Buttons */}
        <nav className="flex flex-col gap-6">
          <Link 
            to="/users" 
            className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <FaUsers className="mr-3" />
            <div>
              <h3 className="font-semibold">Utilizadores</h3>
              <p className="text-xs text-gray-500">
                Body text about users section...
              </p>
            </div>
          </Link>

          <Link 
            to="/bookings" 
            className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <FaCalendarAlt className="mr-3" />
            <div>
              <h3 className="font-semibold">Reservas</h3>
              <p className="text-xs text-gray-500">
                Body text about bookings...
              </p>
            </div>
          </Link>

          <Link 
            to="/tickets" 
            className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <FaTicketAlt className="mr-3" />
            <div>
              <h3 className="font-semibold">Tickets</h3>
              <p className="text-xs text-gray-500">
                Body text about tickets...
              </p>
            </div>
          </Link>
        </nav>

        {/* Logout Section at bottom */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link 
            to="/logout" 
            className="flex items-center text-gray-700 hover:text-red-500"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content - Center */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Posts</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {["Media", "Pages", "Comments", "Appearance", "Plugins", "Users", "Settings", "Tools"].map((item) => (
            <div 
              key={item} 
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <h3 className="font-medium">{item}</h3>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Dont Made</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p>Content for Dont Made section...</p>
          </div>
        </div>
      </main>

      {/* Calendar Section - Right */}
      <aside className="w-80 bg-white p-6 shadow-md">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">MÊS</h2>
          <p className="text-gray-500">ANO</p>
        </div>

        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].map((day) => (
                <th key={day} className="py-2 text-xs font-medium text-gray-500">
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((week) => (
              <tr key={week}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const dateNum = (week - 1) * 7 + day;
                  return (
                    <td 
                      key={day} 
                      className={`py-3 ${dateNum > 31 ? 'text-gray-300' : ''}`}
                    >
                      {dateNum > 31 ? '' : dateNum}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8">
          <h3 className="font-bold mb-2">Get</h3>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-sm">Content for Get section...</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;