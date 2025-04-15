const HomePage = () => {
  return (
    <div className="flex dark:text-gray-100">
      {/* Main Content - Takes up most space */}
      <main className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Posts</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            "Media",
            "Pages",
            "Comments",
            "Appearance",
            "Plugins",
            "Users",
            "Settings",
            "Tools",
          ].map((item) => (
            <div
              key={item}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer dark:text-gray-100"
            >
              <h3 className="font-medium">{item}</h3>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Dont Made</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:text-gray-100">
            <p>Content for Dont Made section...</p>
          </div>
        </div>
      </main>

      {/* Calendar Section - Right side within HomePage */}
      <aside className="w-80 bg-white dark:bg-gray-800 p-6 shadow-md dark:text-gray-100 ml-8">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">MÊS</h2>
          <p className="text-gray-500 dark:text-gray-400">ANO</p>
        </div>

        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {[
                "SUNDAY",
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
              ].map((day) => (
                <th
                  key={day}
                  className="py-2 text-xs font-medium text-gray-500 dark:text-gray-400"
                >
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
                      className={`py-3 ${dateNum > 31 ? "text-gray-300 dark:text-gray-600" : ""}`}
                    >
                      {dateNum > 31 ? "" : dateNum}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8">
          <h3 className="font-bold mb-2">Get</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-sm">Content for Get section...</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
