import React from "react";
import { Icon } from "./Icon";

export function InsightsPage({ activePath = "/insights" }) {
  // Common Analytics Filter Header
  const FilterHeader = () => (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative inline-block text-left">
        <button className="btn-secondary h-9 rounded-md px-3 border border-subtle bg-default py-2 text-sm font-medium focus:outline-none flex items-center justify-between w-48">
          <span>Entire Org</span>
          <Icon name="chevron-down" className="ml-2 h-4 w-4" />
        </button>
      </div>
      <button className="btn-secondary h-9 flex items-center border border-dashed border-subtle hover:border-emphasis bg-transparent transition-colors px-3 py-1.5 rounded-md">
        <Icon name="plus" className="mr-2 h-3.5 w-3.5 text-subtle" />
        <span className="text-sm font-medium">Filter</span>
      </button>
      <div className="grow"></div>
      <button className="btn-secondary h-9 flex items-center border border-subtle bg-default transition-colors px-3 py-1.5 rounded-md">
         <Icon name="download" className="h-4 w-4 text-emphasis" />
      </button>
      <div className="flex items-center border border-subtle rounded-md bg-default h-9 overflow-hidden">
         <button className="h-full px-3 text-sm font-medium flex items-center hover:bg-subtle transition-colors border-r border-subtle">
           Oct 14, 2026 - Nov 13, 2026
         </button>
         <button className="h-full px-3 text-sm font-medium flex items-center hover:bg-subtle transition-colors">
           <span className="text-subtle mr-2 font-normal">Based on</span> Created At 
         </button>
      </div>
      <span className="text-subtle text-xs bg-muted px-2 py-1.5 rounded-md border border-subtle font-medium ml-2">
        Asia/Calcutta
      </span>
    </div>
  );

  const renderBookings = () => (
    <div className="my-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
         {[
           { title: "Created events", value: "0" },
           { title: "Completed events", value: "0" },
           { title: "Cancelled events", value: "0" },
           { title: "Total Meeting time", value: "0m" }
         ].map((kpi, i) => (
            <div key={i} className="flex flex-col rounded-md border border-subtle bg-default p-4 hover:border-emphasis transition duration-200">
              <dt className="text-subtle text-sm font-medium mb-2">{kpi.title}</dt>
              <dd className="text-emphasis text-2xl font-semibold">{kpi.value}</dd>
            </div>
         ))}
      </div>
      <div className="rounded-md border border-subtle bg-default p-6 h-80 flex flex-col items-center justify-center">
         <h3 className="text-emphasis font-medium mb-6 self-start w-full text-base">Created events over time</h3>
         <div className="flex-1 w-full flex items-center justify-center text-subtle text-sm">
            No data available
         </div>
      </div>
       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-subtle bg-default p-6 h-64 flex flex-col">
             <h3 className="text-emphasis font-medium mb-4 text-base">No show hosts over time</h3>
             <div className="flex-1 w-full flex flex-col items-center justify-center text-subtle text-sm mb-4">
                 <Icon name="chart-bar" className="h-8 w-8 mb-4 opacity-50" />
                 No data available
             </div>
          </div>
          <div className="rounded-md border border-subtle bg-default p-6 h-64 flex flex-col">
             <h3 className="text-emphasis font-medium mb-4 text-base">Average rating over time</h3>
             <div className="flex-1 w-full flex flex-col items-center justify-center text-subtle text-sm mb-4">
                 <Icon name="chart-bar" className="h-8 w-8 mb-4 opacity-50" />
                 No data available
             </div>
          </div>
       </div>
    </div>
  );

  const renderRouting = () => (
    <div className="my-4 flex flex-col gap-4">
      <div className="rounded-md border border-subtle bg-default p-6 h-96 flex flex-col">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-emphasis font-medium text-base">Routing Form Responses</h3>
           <button className="btn-secondary h-8 px-3 text-xs">View all</button>
         </div>
         <div className="flex-1 w-full flex flex-col items-center justify-center text-subtle text-sm bg-muted rounded-md border border-dashed border-subtle">
            <Icon name="split" className="h-8 w-8 mb-4 opacity-50" />
            No responses recorded yet
         </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-subtle bg-default p-6 h-64 flex flex-col">
             <h3 className="text-emphasis font-medium mb-4 text-base">Routed to per period</h3>
             <div className="flex-1 w-full flex items-center justify-center text-subtle text-sm">No data available</div>
          </div>
          <div className="rounded-md border border-subtle bg-default p-6 h-64 flex flex-col">
             <h3 className="text-emphasis font-medium mb-4 text-base">Failed bookings by field</h3>
             <div className="flex-1 w-full flex items-center justify-center text-subtle text-sm">No data available</div>
          </div>
      </div>
    </div>
  );

  const renderCallHistory = () => (
    <div className="my-4 flex flex-col gap-4">
      <div className="rounded-md border border-subtle bg-default p-6 h-96 flex flex-col">
         <h3 className="text-emphasis font-medium mb-6 text-base">Call History</h3>
         <div className="flex-1 w-full flex flex-col items-center justify-center text-subtle text-sm bg-muted rounded-md border border-dashed border-subtle">
            <Icon name="phone" className="h-8 w-8 mb-4 opacity-50" />
            No call history available
         </div>
      </div>
    </div>
  );

  const renderWrongRouting = () => (
    <div className="my-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
         <div className="flex flex-col rounded-md border border-subtle bg-default p-4">
            <dt className="text-subtle text-sm font-medium mb-2">Total misroutes</dt>
            <dd className="text-emphasis text-2xl font-semibold">0</dd>
         </div>
         <div className="flex flex-col rounded-md border border-subtle bg-default p-4">
            <dt className="text-subtle text-sm font-medium mb-2">Misroute rate</dt>
            <dd className="text-emphasis text-2xl font-semibold">0%</dd>
         </div>
      </div>
      <div className="rounded-md border border-subtle bg-default p-6 h-80 flex flex-col">
         <h3 className="text-emphasis font-medium mb-6 text-base">Wrong Assignment Reports Dashboard</h3>
         <div className="flex-1 w-full flex items-center justify-center text-subtle text-sm">No data available</div>
      </div>
    </div>
  );

  const renderRouterPosition = () => (
    <div className="my-4 flex flex-col gap-4">
      <div className="rounded-md border border-subtle bg-default p-6 h-96 flex flex-col">
         <h3 className="text-emphasis font-medium mb-6 text-base">Router Position Data</h3>
         <div className="flex-1 w-full flex items-center justify-center text-subtle text-sm bg-muted rounded-md border border-dashed border-subtle">
            <Icon name="users" className="h-8 w-8 mb-4 opacity-50" />
            No position data recorded yet
         </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activePath) {
      case "/insights":
        return renderBookings();
      case "/insights/routing":
        return renderRouting();
      case "/insights/call-history":
        return renderCallHistory();
      case "/insights/wrong-routing":
        return renderWrongRouting();
      case "/insights/router-position":
        return renderRouterPosition();
      default:
        return renderBookings();
    }
  };

  return (
    <div className="flex-1 w-full max-w-full">
      {/* ── Shell Header ───────────────────────────────────── */}
      <div className="flex items-center md:mb-6 md:mt-0 lg:mb-8">
        <header className="flex w-full max-w-full flex-col md:flex-row md:items-center justify-between">
          <div className="min-w-0 flex-1 ltr:mr-4 rtl:ml-4">
            <h3 className="font-cal text-emphasis inline truncate text-lg font-semibold tracking-wide sm:text-xl xl:max-w-full">
              Insights
            </h3>
            <p className="text-default hidden text-sm md:block mt-1">
              Gain valuable insights into the bookings of your team.
            </p>
          </div>
        </header>
      </div>

      <div className="flex flex-col gap-4">
        <FilterHeader />
        
        {renderTabContent()}

        <small className="text-default block text-center mt-6">
          Looking for more insights?{" "}
          <a className="text-blue-500 hover:underline cursor-pointer">
            Contact us
          </a>
        </small>
      </div>
    </div>
  );
}
