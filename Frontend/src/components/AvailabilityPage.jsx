import React, { useState } from 'react';
import { Icon } from './Icon';
import { Switch } from './Switch';
import { useAutoAnimate } from "@formkit/auto-animate/react";

/**
 * Pixel-perfect replica of the Cal.com Schedule Editor page based on the provided screenshot.
 * Implements the 2-column layout, detailed headers, and specific action buttons.
 */
export function AvailabilityPage({ onNavigate }) {
  const [parent] = useAutoAnimate();
  const [title, setTitle] = useState("9-5");
  const [timezone, setTimezone] = useState("Europe/London");
  const [isDefault, setIsDefault] = useState(false);
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [availability, setAvailability] = useState({
    Monday: [{ from: "9:00am", to: "5:00pm" }],
    Tuesday: [{ from: "9:00am", to: "5:00pm" }],
    Wednesday: [{ from: "9:00am", to: "5:00pm" }],
    Thursday: [{ from: "9:00am", to: "5:00pm" }],
    Friday: [{ from: "9:00am", to: "5:00pm" }],
  });

  const toggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day] ? null : [{ from: "9:00am", to: "5:00pm" }]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-default text-default animate-in fade-in duration-500">
      {/* ── Top Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-4 sm:py-6 sticky top-0 bg-default/80 backdrop-blur-md z-50 border-b border-subtle sm:border-none gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <button onClick={() => onNavigate("/availability")} className="p-1 hover:bg-subtle rounded-md text-subtle">
               <Icon name="arrow-left" className="h-4 w-4" />
             </button>
             <div className="flex items-center gap-2 group cursor-pointer">
                <h1 className="font-cal text-xl sm:text-2xl font-bold text-emphasis leading-none">{title}</h1>
                <Icon name="edit-2" className="h-4 w-4 text-subtle opacity-0 group-hover:opacity-100 transition" />
             </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-subtle ml-8">Mon - Fri, 9:00 AM - 5:00 PM</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
           <div className="flex items-center gap-3 pr-4 border-r border-subtle">
              <span className="text-xs sm:text-sm font-semibold text-emphasis hidden xs:inline">Set as default</span>
              <Switch checked={isDefault} onChange={setIsDefault} />
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2.5 bg-[#291415] border border-[#442222] rounded-lg text-[#f87171] hover:bg-[#3d1a1c] transition shadow-sm group">
                <Icon name="trash" className="h-4 w-4" />
              </button>
              <div className="w-[1px] h-6 bg-subtle mx-1" />
              <button 
                className="btn-primary min-h-[36px] px-5 py-2"
              >
                Save
              </button>
           </div>
        </div>
      </div>

      {/* ── Main Content Grid ────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          
          {/* ── Left Column: Weekly Grid & Overrides ────────────── */}
          <div className="space-y-10">
            <div className="bg-default border border-subtle rounded-xl p-4 shadow-sm" ref={parent}>
              {days.map(day => {
                const slots = availability[day];
                const isActive = slots && slots.length > 0;
                return (
                  <div key={day} className="flex items-center py-2.5 px-4 group">
                    <div className="flex items-center gap-4 w-48">
                       <Switch checked={isActive} onChange={() => toggleDay(day)} />
                       <span className={`text-sm font-bold ${isActive ? 'text-emphasis' : 'text-subtle'}`}>{day}</span>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      {isActive ? (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-muted/30 border border-subtle rounded-lg px-3 py-1.5 text-sm gap-2">
                               <input type="text" className="w-16 bg-transparent outline-none font-medium text-emphasis" defaultValue="9:00am" />
                               <span className="text-subtle">–</span>
                               <input type="text" className="w-16 bg-transparent outline-none font-medium text-emphasis" defaultValue="5:00pm" />
                            </div>
                            <button className="p-2 hover:bg-subtle rounded-md text-subtle transition">
                               <Icon name="plus" className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-2 hover:bg-subtle rounded-md text-subtle transition">
                               <Icon name="copy" className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="h-9" /> /* Spacer for alignment */
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Date Overrides Section */}
            <div className="bg-default border border-subtle rounded-xl p-8 space-y-4">
               <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-emphasis">Date overrides</h3>
                  <Icon name="info" className="h-3.5 w-3.5 text-subtle" />
               </div>
               <p className="text-sm text-subtle leading-relaxed">
                 Add dates when your availability changes from your daily hours.
               </p>
               <button className="flex items-center gap-2 px-4 py-2 border border-subtle rounded-lg text-sm font-bold text-emphasis hover:bg-subtle transition">
                  <Icon name="plus" className="h-4 w-4" />
                  Add an override
               </button>
            </div>
          </div>

          {/* ── Right Column: Sidebar ──────────────────────────── */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emphasis">Timezone</h3>
              <div className="relative group">
                <select 
                  className="w-full appearance-none bg-default border border-subtle rounded-lg px-4 py-2.5 text-sm font-medium text-emphasis focus:ring-1 focus:ring-emphasis outline-none cursor-pointer transition"
                  defaultValue="Europe/London"
                >
                  <option>Europe/London</option>
                  <option>Asia/Kolkata</option>
                  <option>America/New_York</option>
                </select>
                <Icon name="chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle pointer-events-none" />
              </div>
            </div>

            <div className="bg-default border border-subtle rounded-xl p-6 space-y-4">
               <h3 className="text-sm font-bold text-emphasis">Something doesn't look right?</h3>
               <button className="w-full px-4 py-2 border border-subtle rounded-lg text-sm font-bold text-emphasis hover:bg-subtle transition">
                  Launch troubleshooter
               </button>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 right-6">
         <button className="p-4 bg-emphasis text-default rounded-full shadow-2xl hover:scale-110 transition active:scale-95">
            <Icon name="message-square" className="h-6 w-6" />
         </button>
      </div>
    </div>
  );
}
