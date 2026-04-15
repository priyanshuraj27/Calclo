import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import IconSprites from "./components/IconSprites";
import { EventTypesPage } from "./components/EventTypesPage";
import { BookingsPage } from "./components/BookingsPage";
import { AvailabilityPage } from "./components/AvailabilityPage";
import { BookerPage } from "./components/BookerPage";
import { SchedulesListingPage } from "./components/SchedulesListingPage";
import { TeamsPage } from "./components/TeamsPage";
import { AppsPage } from "./components/AppsPage";
import { InstalledAppsPage } from "./components/InstalledAppsPage";
import { RoutingFormsPage } from "./components/RoutingFormsPage";
import { WorkflowsPage } from "./components/WorkflowsPage";
import { InsightsPage } from "./components/InsightsPage";
import { SettingsPage } from "./components/SettingsPage";
import { ReferPage } from "./components/ReferPage";
import { EditEventTypePage } from "./components/EditEventTypePage";
import { MobileTopBar, MobileBottomNav } from "./components/MobileNav";

function App() {
  // Simple routing simulation
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname === "/" ? "/event-types" : window.location.pathname
  );

  // Synchronize path state with browser URL
  useEffect(() => {
    // Redirect / to /event-types
    if (window.location.pathname === "/") {
      window.history.replaceState({}, "", "/event-types");
    }

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
    // Handle dynamic routes first
    if (currentPath.startsWith("/event-types/")) {
      const parts = currentPath.split("/").filter(Boolean);
      const eventTypeId = parts[1] || "";
      const urlParams = new URLSearchParams(window.location.search);
      const title = urlParams.get("title");
      return (
        <EditEventTypePage
          onNavigate={navigate}
          title={title}
          eventTypeId={eventTypeId}
        />
      );
    }

    if (currentPath.startsWith("/availability/")) {
      const parts = currentPath.split("/").filter(Boolean);
      const scheduleId = parts[1] || "new";
      return (
        <AvailabilityPage onNavigate={navigate} scheduleId={scheduleId} />
      );
    }

    if (currentPath.startsWith("/book")) {
      const parts = currentPath.split("/").filter(Boolean);
      const defaultHost =
        import.meta.env.VITE_DEFAULT_HOST_USERNAME || "priyanshu";
      const hostUsername = parts[1] || defaultHost;
      const eventSlug = parts[2] || "15min";
      return (
        <BookerPage
          onNavigate={navigate}
          hostUsername={hostUsername}
          eventSlug={eventSlug}
        />
      );
    }

    if (currentPath.startsWith("/settings")) {
      return <SettingsPage activePath={currentPath} onNavigate={navigate} />;
    }

    switch (currentPath) {
      case "/event-types":
        return <EventTypesPage onNavigate={navigate} />;
      case "/bookings":
        return <BookingsPage />;
      case "/availability":
        return <SchedulesListingPage onNavigate={navigate} />;
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
        return (
          <div className="flex-1 flex items-center justify-center text-subtle italic p-8">
            This is the {currentPath} page. (Demo only)
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-default text-default font-sans overflow-hidden flex-col md:flex-row">
      <IconSprites />
      
      {/* Mobile Top Bar */}
      <MobileTopBar onNavigate={navigate} />
      
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      <Sidebar activePath={currentPath} onNavigate={navigate} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className={`w-full max-w-[1200px] mx-auto flex-1 flex flex-col ${currentPath === '/teams' ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activePath={currentPath} onNavigate={navigate} />
    </div>
  );
}

export default App;
