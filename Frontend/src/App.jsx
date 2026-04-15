import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import IconSprites from "./components/IconSprites";
import { EventTypesPage } from "./components/EventTypesPage";
import { BookingsPage } from "./components/BookingsPage";
import { AvailabilityPage } from "./components/AvailabilityPage";
import { TeamsPage } from "./components/TeamsPage";
import { AppsPage } from "./components/AppsPage";
import { InstalledAppsPage } from "./components/InstalledAppsPage";
import { RoutingFormsPage } from "./components/RoutingFormsPage";
import { WorkflowsPage } from "./components/WorkflowsPage";
import { InsightsPage } from "./components/InsightsPage";
import { SettingsPage } from "./components/SettingsPage";
import { ReferPage } from "./components/ReferPage";

function App() {
  // Simple routing simulation
  const [currentPath, setCurrentPath] = useState(window.location.pathname || "/event-types");

  // Synchronize path state with browser URL
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  const renderContent = () => {
    switch (currentPath) {
      case "/event-types":
        return <EventTypesPage />;
      case "/bookings":
        return <BookingsPage />;
      case "/availability":
        return <AvailabilityPage />;
      case "/teams":
        return <TeamsPage />;
      case "/apps/installed":
        return <InstalledAppsPage />;
      case "/apps":
        return <AppsPage />;
      case "/routing":
        return <RoutingFormsPage />;
      case "/workflows":
        return <WorkflowsPage />;
      case "/insights":
      case "/insights/routing":
      case "/insights/router-position":
      case "/insights/call-history":
      case "/insights/wrong-routing":
        return <InsightsPage activePath={currentPath} />;
      case "/refer":
        return <ReferPage />;
      default:
        if (currentPath.startsWith("/settings")) {
          return <SettingsPage activePath={currentPath} onNavigate={navigate} />;
        }
        return (
          <div className="flex-1 flex items-center justify-center text-subtle italic p-8">
            This is the {currentPath} page. (Demo only)
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-default text-default font-sans overflow-hidden">
      <IconSprites />
      
      {/* Sidebar with navigation prop */}
      <Sidebar activePath={currentPath} onNavigate={navigate} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className={`max-w-full flex-1 flex flex-col ${currentPath === '/teams' ? 'p-0' : 'p-2 sm:p-4 lg:p-6'}`}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
