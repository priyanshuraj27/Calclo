import React, { useState } from 'react';
import { Icon } from './Icon';
import { useAutoAnimate } from "@formkit/auto-animate/react";

/**
 * Pixel-perfect standalone replica of the Cal.com Booker Page.
 * Handles the flow from Date Selection -> Time Selection -> Booking Form.
 */
export function BookerPage({ onNavigate }) {
  const [parent] = useAutoAnimate();
  const [bookerState, setBookerState] = useState("selecting_date"); // selecting_date, selecting_time, booking, success
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Mock data
  const event = {
    title: "15 Min Meeting",
    user: {
      name: "John Doe",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=262626&color=fff"
    },
    duration: 15,
    location: "Cal Video",
    description: "Welcome to my scheduling page. Please select a time that works for you."
  };

  const timeSlots = [
    "9:00am", "9:15am", "9:30am", "9:45am", "10:00am", "10:15am", "10:30am", "10:45am",
    "11:00am", "11:15am", "11:30am", "11:45am", "1:00pm", "1:15pm", "1:30pm", "1:45pm"
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setBookerState("selecting_time");
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setBookerState("booking");
  };

  return (
    <div className="min-h-screen bg-[#101010] text-default flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-emphasis selection:text-default">
      {/* ── Main Booker Container ──────────────────────────── */}
      <div 
        ref={parent}
        className={`bg-[#161616] border border-[#262626] rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 ease-in-out ${
          bookerState === "selecting_date" ? "max-w-[1000px]" : "max-w-[1100px]"
        }`}
      >
        
        {/* ── Left Side: Event Metadata ──────────────────────── */}
        <div className="w-full md:w-[360px] p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#262626] flex flex-col h-full">
           <div className="space-y-8">
              <button 
                onClick={() => {
                  if (bookerState === "booking") setBookerState("selecting_time");
                  else if (bookerState === "selecting_time") setBookerState("selecting_date");
                  else onNavigate("/availability");
                }}
                className="p-2 -ml-2 hover:bg-[#262626] rounded-full text-subtle transition-colors"
              >
                <Icon name="arrow-left" className="h-4 w-4" />
              </button>

              <div className="flex flex-col gap-4">
                 <img src={event.user.avatar} className="h-10 w-10 rounded-full border border-[#262626]" alt="avatar" />
                 <div className="space-y-1">
                    <p className="text-xs font-semibold text-subtle uppercase tracking-wider leading-none">{event.user.name}</p>
                    <h1 className="text-2xl font-cal font-bold text-emphasis tracking-tight">{event.title}</h1>
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-sm font-medium text-subtle">
                    <Icon name="clock" className="h-4 w-4" />
                    <span>{event.duration} mins</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm font-medium text-subtle">
                    <Icon name="video" className="h-4 w-4" />
                    <span>{event.location}</span>
                 </div>
                 {selectedDate && (
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                       <Icon name="calendar" className="h-4 w-4" />
                       <span>{selectedDate}</span>
                    </div>
                 )}
                  {selectedTime && (
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                       <Icon name="clock" className="h-4 w-4" />
                       <span>{selectedTime}</span>
                    </div>
                 )}
              </div>

              <p className="text-sm text-subtle leading-relaxed whitespace-pre-wrap">
                 {event.description}
              </p>
           </div>
        </div>

        {/* ── Right Side: Dynamic Content Area ────────────────── */}
        <div className="md:w-[640px] flex flex-col min-h-[500px]" ref={parent}>
           
           {/* Step 1: Date Picker */}
           {bookerState === "selecting_date" && (
              <div className="p-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-bold text-emphasis">Select a Date</h2>
                    <div className="flex items-center gap-1">
                       <button className="p-2 hover:bg-[#262626] rounded-lg transition text-subtle"><Icon name="chevron-left" className="h-4 w-4" /></button>
                       <button className="p-2 hover:bg-[#262626] rounded-lg transition text-subtle"><Icon name="chevron-right" className="h-4 w-4" /></button>
                    </div>
                 </div>

                 <p className="text-sm font-bold text-emphasis mb-6">April 2026</p>

                 <div className="grid grid-cols-7 gap-2 text-center font-bold text-[11px] text-muted tracking-widest mb-4">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => <div key={day} className="w-full">{day}</div>)}
                 </div>

                 <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = i + 1;
                      const isAvailable = day > 10 && day < 25;
                      return (
                        <button
                          key={day}
                          onClick={() => isAvailable && handleDateSelect(`Monday, April ${day}, 2026`)}
                          disabled={!isAvailable}
                          className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            isAvailable 
                              ? "text-emphasis hover:bg-emphasis hover:text-default bg-[#333]/30" 
                              : "text-[#222] cursor-not-allowed"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                 </div>
              </div>
           )}

           {/* Step 2: Time Slots */}
           {bookerState === "selecting_time" && (
              <div className="p-8 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold text-emphasis">Select a Time</h2>
                    <p className="text-sm text-subtle">{selectedDate}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className="w-full py-3 px-4 border border-[#262626] rounded-lg text-sm font-bold text-emphasis hover:bg-[#262626] hover:border-emphasis transition-all text-left flex items-center justify-between group"
                      >
                        {time}
                        <Icon name="arrow-right" className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emphasis" />
                      </button>
                    ))}
                 </div>
              </div>
           )}

           {/* Step 3: Booking Form */}
           {bookerState === "booking" && (
              <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                 <h2 className="text-lg font-bold text-emphasis mb-8">Enter Details</h2>
                 <form className="space-y-6 max-w-md" onSubmit={(e) => { e.preventDefault(); setBookerState("success"); }}>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-subtle uppercase">Name</label>
                       <input 
                         required
                         type="text" 
                         placeholder="John Doe"
                         className="w-full bg-[#101010] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-emphasis outline-none placeholder:text-muted transition-all"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-subtle uppercase">Email Address</label>
                       <input 
                         required
                         type="email" 
                         placeholder="john@example.com"
                         className="w-full bg-[#101010] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-emphasis outline-none placeholder:text-muted transition-all"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-subtle uppercase">Additional Notes</label>
                       <textarea 
                         rows={4}
                         placeholder="Please share anything that will help prepare for our meeting."
                         className="w-full bg-[#101010] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-emphasis outline-none placeholder:text-muted transition-all resize-none"
                       />
                    </div>
                    <button 
                      type="submit"
                      className="btn-primary w-full py-3 h-auto"
                    >
                      Confirm Booking
                    </button>
                 </form>
              </div>
           )}

           {/* Success State */}
           {bookerState === "success" && (
              <div className="p-8 flex flex-col items-center justify-center flex-1 text-center animate-in zoom-in duration-500">
                 <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                    <Icon name="check" className="h-8 w-8" />
                 </div>
                 <h2 className="text-2xl font-bold text-emphasis mb-2">Booking Confirmed!</h2>
                 <p className="text-subtle text-sm max-w-xs mb-8">
                    An invitation has been sent to your email address. We've also added it to your calendar.
                 </p>
                 <button 
                   onClick={() => onNavigate("/availability")}
                   className="px-6 py-2 border border-[#262626] rounded-lg text-sm font-bold text-emphasis hover:bg-[#262626] transition"
                 >
                    Back to home
                 </button>
              </div>
           )}

        </div>
      </div>

      <div className="mt-8 text-center">
         <p className="text-xs text-[#444] font-medium tracking-tight">POWERED BY <span className="text-[#666]">CAL.COM</span></p>
      </div>
    </div>
  );
}
