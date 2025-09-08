const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center">
          <button
            className="text-gray-500 focus:outline-none lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <h2 className="ml-2 text-xl font-semibold text-gray-800">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
              <i className="fas fa-user"></i>
            </div>
            <div className="mx-4 hidden md:block">
              <h4 className="text-sm font-semibold text-gray-600">
                Admin User
              </h4>
              <p className="text-xs text-gray-400">admin@greenleafgo.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
