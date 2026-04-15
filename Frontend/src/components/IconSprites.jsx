import React from "react";

export function IconSprites() {
  return (
    <div
      style={{ display: "none" }}
      dangerouslySetInnerHTML={{
        __html: `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0">
<defs>
<symbol class="lucide lucide-activity" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="activity">
  <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" ></path>
</symbol>
<symbol class="lucide lucide-calendar" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="calendar">
  <path d="M8 2v4" ></path>
  <path d="M16 2v4" ></path>
  <rect width="18" height="18" x="3" y="4" rx="2" ></rect>
  <path d="M3 10h18" ></path>
</symbol>
<symbol class="lucide lucide-clock" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="clock">
  <circle cx="12" cy="12" r="10" ></circle>
  <polyline points="12 6 12 12 16 14" ></polyline>
</symbol>
<symbol class="lucide lucide-users" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="users">
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" ></path>
  <circle cx="9" cy="7" r="4" ></circle>
  <path d="M22 21v-2a4 4 0 0 0-3-3.87" ></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75" ></path>
</symbol>
<symbol class="lucide lucide-user" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="user">
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" ></path>
  <circle cx="12" cy="7" r="4" ></circle>
</symbol>
<symbol class="lucide lucide-grid-3x3" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="grid-3x3">
  <rect width="18" height="18" x="3" y="3" rx="2" ></rect>
  <path d="M3 9h18" ></path>
  <path d="M3 15h18" ></path>
  <path d="M9 3v18" ></path>
  <path d="M15 3v18" ></path>
</symbol>
<symbol class="lucide lucide-split" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="split">
  <path d="M16 3h5v5" ></path>
  <path d="M8 3H3v5" ></path>
  <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" ></path>
  <path d="m15 9 6-6" ></path>
</symbol>
<symbol class="lucide lucide-zap" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="zap">
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" ></path>
</symbol>
<symbol class="lucide lucide-chart-bar" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="chart-bar">
  <path d="M3 3v16a2 2 0 0 0 2 2h16" ></path>
  <path d="M7 16h8" ></path>
  <path d="M7 11h12" ></path>
  <path d="M7 6h3" ></path>
</symbol>
<symbol class="lucide lucide-link" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="link">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" ></path>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" ></path>
</symbol>
<symbol class="lucide lucide-external-link" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="external-link">
  <path d="M15 3h6v6" ></path>
  <path d="M10 14 21 3" ></path>
  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" ></path>
</symbol>
<symbol class="lucide lucide-copy" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="copy">
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" ></rect>
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" ></path>
</symbol>
<symbol class="lucide lucide-gift" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="gift">
  <rect x="3" y="8" width="18" height="4" rx="1" ></rect>
  <path d="M12 8v13" ></path>
  <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" ></path>
  <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" ></path>
</symbol>
<symbol class="lucide lucide-settings" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="settings">
  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" ></path>
  <circle cx="12" cy="12" r="3" ></circle>
</symbol>
<symbol class="lucide lucide-search" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="search">
  <circle cx="11" cy="11" r="8" ></circle>
  <path d="m21 21-4.3-4.3" ></path>
</symbol>
<symbol class="lucide lucide-chevron-down" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="chevron-down">
  <path d="m6 9 6 6 6-6" ></path>
</symbol>
<symbol class="lucide lucide-chevron-up" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="chevron-up">
  <path d="m18 15-6-6-6 6" ></path>
</symbol>
<symbol class="lucide lucide-ellipsis" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="ellipsis">
  <circle cx="12" cy="12" r="1" ></circle>
  <circle cx="19" cy="12" r="1" ></circle>
  <circle cx="5" cy="12" r="1" ></circle>
</symbol>
<symbol class="lucide lucide-plus" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="plus">
  <path d="M5 12h14" ></path>
  <path d="M12 5v14" ></path>
</symbol>
<symbol class="lucide lucide-arrow-up" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="arrow-up">
  <path d="m5 12 7-7 7 7" ></path>
  <path d="M12 19V5" ></path>
</symbol>
<symbol class="lucide lucide-arrow-down" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="arrow-down">
  <path d="m19 12-7 7-7-7" ></path>
  <path d="M12 5v14" ></path>
</symbol>
<symbol class="lucide lucide-refresh-cw" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="refresh-cw">
  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
  <path d="M21 3v5h-5"></path>
  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
  <path d="M3 21v-5h5"></path>
</symbol>
<symbol class="lucide lucide-clipboard" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="clipboard">
  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
</symbol>
<symbol class="lucide lucide-sun" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="sun">
  <circle cx="12" cy="12" r="4"></circle>
  <path d="M12 2v2"></path>
  <path d="M12 20v2"></path>
  <path d="m4.93 4.93 1.41 1.41"></path>
  <path d="m17.66 17.66 1.41 1.41"></path>
  <path d="M2 12h2"></path>
  <path d="M20 12h2"></path>
  <path d="m6.34 17.66-1.41 1.41"></path>
  <path d="m19.07 4.93-1.41 1.41"></path>
</symbol>
<symbol class="lucide lucide-moon" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="moon">
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
</symbol>
<symbol class="lucide lucide-list-filter" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="list-filter">
  <path d="M3 6h18"></path>
  <path d="M7 12h10"></path>
  <path d="M10 18h4"></path>
</symbol>
<symbol class="lucide lucide-globe" viewBox="0 0 24 24" fill="inherit" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="globe">
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
  <path d="M2 12h20"></path>
</symbol>
<symbol class="lucide lucide-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="arrow-right">
  <path d="M5 12h14"></path>
  <path d="m12 5 7 7-7 7"></path>
</symbol>
<symbol class="lucide lucide-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="search">
  <circle cx="11" cy="11" r="8"></circle>
  <path d="m21 21-4.3-4.3"></path>
</symbol>
<symbol class="lucide lucide-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="plus">
  <path d="M5 12h14"></path>
  <path d="M12 5v14"></path>
</symbol>
<symbol class="lucide lucide-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="chevron-right">
  <path d="m9 18 6-6-6-6"></path>
</symbol>
<symbol class="lucide lucide-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="download">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" x2="12" y1="15" y2="3"></line>
</symbol>
<symbol class="lucide lucide-chevron-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="chevron-left">
  <path d="m15 18-6-6 6-6"></path>
</symbol>
<symbol class="lucide lucide-git-merge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="git-merge">
  <circle cx="18" cy="18" r="3"></circle>
  <circle cx="6" cy="6" r="3"></circle>
  <path d="M6 21V9a9 9 0 0 0 9 9"></path>
</symbol>
<symbol class="lucide lucide-pencil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="pencil">
  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
  <path d="m15 5 4 4"></path>
</symbol>
<symbol class="lucide lucide-smartphone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="smartphone">
  <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
  <path d="M12 18h.01"></path>
</symbol>
<symbol class="lucide lucide-code" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="code">
  <polyline points="16 18 22 12 16 6"></polyline>
  <polyline points="8 6 2 12 8 18"></polyline>
</symbol>
<symbol class="lucide lucide-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="mail">
  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
</symbol>
<symbol class="lucide lucide-message-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="message-circle">
  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
</symbol>
<symbol class="lucide lucide-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="phone">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
</symbol>
<symbol class="lucide lucide-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="shield">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
</symbol>
<symbol class="lucide lucide-video" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="video">
  <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path>
  <rect x="2" y="6" width="14" height="12" rx="2"></rect>
</symbol>
<symbol class="lucide lucide-calendar-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="calendar-off">
  <path d="M4 8h8M16 8h4M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1M8 2v4M16 2v4M2 2l20 20"></path>
</symbol>
<symbol class="lucide lucide-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="layers">
  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
  <polyline points="2 12 12 17 22 12"></polyline>
  <polyline points="2 17 12 22 22 17"></polyline>
</symbol>
<symbol class="lucide lucide-sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="sparkles">
  <path d="M9.9 5.5 12 2l2.1 3.5a5.5 5.5 0 0 0 3.4 3.4L21 11l-3.5 2.1a5.5 5.5 0 0 0-3.4 3.4L12 20l-2.1-3.5a5.5 5.5 0 0 0-3.4-3.4L3 11l3.5-2.1a5.5 5.5 0 0 0 3.4-3.4Z"></path>
  <path d="M2 2l3 3"></path>
</symbol>
<symbol class="lucide lucide-shield-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="shield-check">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
  <path d="m9 12 2 2 4-4"></path>
</symbol>
<symbol class="lucide lucide-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="globe">
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="2" x2="22" y1="12" y2="12"></line>
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
</symbol>
<symbol class="lucide lucide-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="arrow-left">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</symbol>
<symbol class="lucide lucide-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="trash">
  <path d="M3 6h18"></path>
  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
</symbol>
<symbol class="lucide lucide-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="info">
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M12 16v-4"></path>
  <path d="M12 8h.01"></path>
</symbol>
<symbol class="lucide lucide-edit-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="edit-2">
  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
</symbol>
<symbol class="lucide lucide-message-square" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="message-square">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</symbol>
<symbol class="lucide lucide-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="check">
  <polyline points="20 6 9 17 4 12"></polyline>
</symbol>
<symbol class="lucide lucide-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="clock">
  <circle cx="12" cy="12" r="10"></circle>
  <polyline points="12 6 12 12 16 14"></polyline>
</symbol>
<symbol class="lucide lucide-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="calendar">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
</symbol>
<symbol class="lucide lucide-video" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="video">
  <path d="m22 8-6 4 6 4V8Z"></path>
  <rect x="2" y="6" width="14" height="12" rx="2" ry="2"></rect>
</symbol>
</defs>
</svg>
`,
      }}
    />
  );
}

export default IconSprites;
