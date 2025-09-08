import { MENU_ITEMS } from "../../utils/constants";

const Sidebar = ({
  activeScreen,
  setActiveScreen,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-green-900 transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center mt-4 mb-8">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold">
              GreenLeaf <span className="text-green-400">Go</span>
            </h1>
            <p className="text-xs text-gray-300 mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="mt-6">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center px-6 py-3 mt-2 text-left transition-colors duration-300 transform ${
                activeScreen === item.id
                  ? "bg-green-700 text-white"
                  : "text-gray-300 hover:bg-green-800 hover:text-white"
              }`}
              onClick={() => {
                setActiveScreen(item.id);
                setSidebarOpen(false);
              }}
            >
              <i className={`${item.icon} w-5 h-5`}></i>
              <span className="mx-4 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
