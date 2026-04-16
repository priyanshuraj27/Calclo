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
import { apiData } from "./api/client.js";
import { titleForAppPath } from "./utils/documentTitle.js";

const RESERVED_TOP_LEVEL_ROUTES = new Set([
  "book",
  "event-types",
  "bookings",
  "availability",
  "teams",
  "apps",
  "routing",
  "workflows",
  "insights",
  "refer",
  "settings",
  "api",
]);

function isPublicBookerPath(pathname) {
  const pathParts = pathname.split("/").filter(Boolean);
  const isShortPublicBookingRoute =
    pathParts.length >= 2 && !RESERVED_TOP_LEVEL_ROUTES.has(pathParts[0]);
  return (
    pathname === "/book" ||
    pathname.startsWith("/book/") ||
    isShortPublicBookingRoute
  );
}

function App() {
  // Simple routing simulation
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname === "/" ? "/event-types" : window.location.pathname
  );
  const [navSearch, setNavSearch] = useState(
    () => (typeof window !== "undefined" ? window.location.search || "" : "")
  );

  // Synchronize path state with browser URL
  useEffect(() => {
    // Redirect / to /event-types
    if (window.location.pathname === "/") {
      window.history.replaceState({}, "", "/event-types");
    }

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setNavSearch(window.location.search || "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Warm key caches so Availability opens instantly after navigation.
  useEffect(() => {
    apiData("/api/v1/users/current-user").catch(() => {});
    apiData("/api/v1/schedules").catch(() => {});
  }, []);

  // Browser tab title (public booker sets its own in BookerPage).
  useEffect(() => {
    if (isPublicBookerPath(currentPath)) return;
    document.title = titleForAppPath(currentPath, navSearch);
  }, [currentPath, navSearch]);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    // Keep pathname state without query so dynamic segments (e.g. event type id)
    // are not polluted by `?title=...` when splitting on "/".
    const pathname = path.split("?")[0] || path;
    const search = path.includes("?") ? path.slice(path.indexOf("?")) : "";
    setCurrentPath(pathname);
    setNavSearch(search);
  };

  const renderContent = () => {
    // Handle dynamic routes first
    if (currentPath.startsWith("/event-types/")) {
      const parts = currentPath.split("/").filter(Boolean);
      const eventTypeId = parts[1] || "";
      const urlParams = new URLSearchParams(window.location.search);
      const title = urlParams.get("title");
      const slug = urlParams.get("slug");
      const description = urlParams.get("description");
      const duration = urlParams.get("duration");
      const durationExtras = urlParams.get("durationExtras");
      return (
        <EditEventTypePage
          onNavigate={navigate}
          title={title}
          initialSlug={slug}
          initialDescription={description}
          initialDuration={duration}
          initialDurationOptionsText={durationExtras}
          eventTypeId={eventTypeId}
        />
      );
    }

    if (currentPath.startsWith("/availability/")) {
      const parts = currentPath.split("/").filter(Boolean);
      const scheduleId = parts[1] || "new";
      const urlParams = new URLSearchParams(window.location.search);
      const initialName = urlParams.get("name") || "";
      return (
        <AvailabilityPage
          onNavigate={navigate}
          scheduleId={scheduleId}
          initialName={initialName}
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
        return <BookingsPage onNavigate={navigate} />;
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

  const pathParts = currentPath.split("/").filter(Boolean);
  const isShortPublicBookingRoute =
    pathParts.length >= 2 && !RESERVED_TOP_LEVEL_ROUTES.has(pathParts[0]);

  if (isPublicBookerPath(currentPath)) {
    const parts = currentPath.split("/").filter(Boolean);
    const defaultHost =
      import.meta.env.VITE_DEFAULT_HOST_USERNAME || "priyanshu";
    const hostUsername = isShortPublicBookingRoute
      ? parts[0] || defaultHost
      : parts[1] || defaultHost;
    const eventSlug = isShortPublicBookingRoute
      ? parts[1] || "15min"
      : parts[2] || "15min";
    return (
      <div className="h-dvh min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#0a0a0a] font-sans">
        <IconSprites />
        <BookerPage
          onNavigate={navigate}
          hostUsername={hostUsername}
          eventSlug={eventSlug}
          navSearch={navSearch}
        />
      </div>
    );
  }

  const isWidePage =
    currentPath === "/event-types" ||
    currentPath === "/bookings" ||
    currentPath === "/availability" ||
    currentPath.startsWith("/availability/");

  return (
    <div className="flex h-screen w-full bg-default text-default font-sans overflow-hidden flex-col lg:flex-row">
      <IconSprites />
      
      {/* Mobile Top Bar */}
      <MobileTopBar onNavigate={navigate} />
      
      {/* Sidebar - Desktop (lg+); phone & tablet use bottom nav + More */}
      <Sidebar activePath={currentPath} onNavigate={navigate} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div
            className={`w-full flex-1 flex flex-col ${
              currentPath === "/teams"
                ? "p-0"
                : isWidePage
                  ? "px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6"
                  : "max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8"
            }`}
          >
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
