import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./components/screens/Dashboard";
import Accommodations from "./components/screens/Accommodations";
import Restaurants from "./components/screens/Restaurants";
import Events from "./components/screens/Events";
import Users from "./components/screens/Users";
import Rsvps from "./components/screens/Rsvps";
import Itineraries from "./components/screens/Itineraries";
import Badges from "./components/screens/Badges";
import Reviews from "./components/screens/Reviews";

function App() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <Dashboard />;
      case "accommodations":
        return <Accommodations />;
      case "restaurants":
        return <Restaurants />;
      case "events":
        return <Events />;
      case "users":
        return <Users />;
      case "rsvps":
        return <Rsvps />;
      case "itineraries":
        return <Itineraries />;
      case "badges":
        return <Badges />;
      case "reviews":
        return <Reviews />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}

export default App;
