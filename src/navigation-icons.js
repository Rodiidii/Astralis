import {GAME_UI} from './genshin-content-icons.js';
// One semantic drawing per destination. Shared by the rail, shortcuts and phone navigation.
const DRAWINGS={
 dashboard:'<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2" class="nav-accent"/>',
 atlas:'<path d="m3 5 6-2 6 2 6-2v15l-6 3-6-2-6 2Z"/><path d="M9 3v8m6 4v6"/><path d="M17 8c0 2-3 5-3 5s-3-3-3-5a3 3 0 1 1 6 0Z" class="nav-accent"/><circle cx="14" cy="8" r=".7"/>',
 planner:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-14 4 1.5 1.5L11 13m3 1h3m-10 4h4m3 0h3"/>',
 focus:'<circle cx="12" cy="14" r="8"/><path d="M9 2h6m-3 0v4m6-1 2 2"/><path d="m10 10 5 4-5 3Z" class="nav-accent"/>',
 energy:'<path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3m8-18h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="m13 2-6 12h5l-1 8 7-13h-5Z" class="nav-accent"/>',
 'daily-quiz':'<rect x="5" y="4" width="14" height="14" rx="4"/><path d="M9 2h6M5 10h14m-10 8-3 4m9-4 3 4M8 21h8"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M8 7h8" class="nav-accent"/>',
 collection:'<path d="m4 7-2 1 3 13 4-1M7 4l-2 1 4 15 4-1"/><rect x="10" y="2" width="11" height="17" rx="2"/><path d="m15.5 6 1.1 2.6 2.9.4-2.1 2 .5 2.9-2.4-1.4-2.4 1.4.5-2.9-2.1-2 2.9-.4Z" class="nav-accent"/>',
 boosters:'<path d="M5 8 3 4l5 1 4-3 4 3 5-1-2 4m-14 0h14v13H5Z"/><path d="M8 11h8m-8 7h8"/><path d="m12 10 2 4-2 3-2-3Z" class="nav-accent"/>',
 sheets:'<path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7m2-20 7 7h-7V2ZM7 9h3m-3 4h5m-5 4h3"/><path d="m14 18 6-6 2 2-6 6-3 1Z" class="nav-accent"/>',
 favorites:'<path d="M19 10V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v18l7-4 3 2"/><path d="M13 11c0-3 3-4 4-1 2-3 5-2 5 1 0 2-5 6-5 6s-4-4-4-6Z" class="nav-accent"/>',
 tasks:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m6 8 1.5 1.5L10 7m3 1h5m-12 6 1.5 1.5L10 13m3 1h5m-5 4h5"/>',
 notes:'<path d="M8 3H5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3M8 2v20M3 7h2m-2 5h2m-2 5h2"/><path d="m12 12 7-9 3 2-7 9-4 2Z" class="nav-accent"/>',
 media:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4m1-5 5 3-5 3Z" class="nav-accent"/>',
 assistant:'<path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><circle cx="12" cy="9" r="2" class="nav-accent"/><path d="M8 15c0-3 8-3 8 0"/>',
 arcade:'<path d="M7 6h10c3 0 5 5 5 10 0 5-4 3-6 0H8c-2 3-6 5-6 0 0-5 2-10 5-10Z"/><path d="M6 10v5m-2.5-2.5h5"/><circle cx="17" cy="10" r="1" class="nav-accent"/><circle cx="19" cy="14" r="1"/>',
 journey:'<path d="M5 19c0-6 13-3 13-9M5 19H2m3 0v3"/><path d="M21 6c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 8 0Z"/><circle cx="17" cy="6" r="1" class="nav-accent"/><circle cx="6" cy="6" r="2"/>',
 customize:'<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="9" cy="5" r="3" class="nav-accent"/><circle cx="16" cy="12" r="3"/><circle cx="8" cy="19" r="3"/>',
 characters:'<path d="M7 3H4v4m13-4h3v4M4 17v3h3m13-3v3h-3"/><circle cx="12" cy="8" r="3" class="nav-accent"/><path d="M6 18v-1c0-6 12-6 12 0v1"/>',
 weapons:'<path d="m4 3 8 8-2 2-8-8V2Zm16 0-8 8 2 2 8-8V2ZM8 14l-5 5m13-5 5 5M5 13l6 6m2-1 6-6M2 20l2 2m16-2 2 2"/>',
 sets:'<path d="M12 8c-6-11-14 0-5 4-11 4-1 13 5 5 6 8 16-1 5-5 9-4 1-15-5-4Z"/><circle cx="12" cy="12" r="3" class="nav-accent"/>',
 materials:'<path d="M7 7 5 3h14l-2 4m-10 0C3 10 1 15 4 20c2 3 14 3 16 0 3-5 1-10-3-13ZM7 7h10"/><path d="m12 10 4 4-4 5-4-5Z" class="nav-accent"/>',
 teams:'<circle cx="12" cy="6" r="3" class="nav-accent"/><circle cx="4.5" cy="11" r="2"/><circle cx="19.5" cy="11" r="2"/><path d="M7 21v-4c0-6 10-6 10 0v4M1 21v-4a3 3 0 0 1 4-3m18 7v-4a3 3 0 0 0-4-3"/>',
 builds:'<path d="m8 3-5 3 2 6 3-1v10h8V11l3 1 2-6-5-3c0 4-8 4-8 0Z"/><path d="M9 13h6m-6 4h6" class="nav-accent"/>',
 lab:'<path d="M9 2h6M10 2v7l-7 10a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3L14 9V2M7 15h10"/><circle cx="10" cy="18" r="1" class="nav-accent"/><circle cx="14" cy="12" r=".8"/>',
 calc:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8v4H8Zm0 8h1m6 0h1m-8 4h1m6 0h1m-4-4v4"/><path d="M8 6h8v4H8Z" class="nav-accent"/>',
 farming:'<path d="M12 22V12M4 5c0 8 8 8 8 8S12 5 4 5ZM20 3c0 8-8 8-8 8s0-8 8-8Z"/><path d="M4 21h16m-1-8 3 3-3 3m3-3h-7" class="nav-accent"/>',
 endgame:'<path d="M8 3h8v7a4 4 0 0 1-8 0ZM8 5H3v3a4 4 0 0 0 5 4m8-7h5v3a4 4 0 0 1-5 4m-4 2v5m-5 2h10"/><path d="m12 5 .8 1.5 1.7.2-1.2 1.2.2 1.7-1.5-.8-1.5.8.2-1.7L9.5 6.7l1.7-.2Z" class="nav-accent"/>',
 events:'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4m8-4v4M3 9h18"/><path d="m12 12 1 2 2.5.3-1.8 1.7.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.8-1.7L11 14Z" class="nav-accent"/>',
 lore:'<path d="M12 5c-3-2-7-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Zm0 0v15M5 8h4m-4 4h4m-4 4h4"/><path d="M16 4v8l2-1 2 1V4" class="nav-accent"/>',
 relations:'<circle cx="12" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="12" cy="20" r="2"/><circle cx="12" cy="12" r="2" class="nav-accent"/><path d="M12 6v4m0 4v4m-6-6h4m4 0h4M6 10l4-4m4 0 4 4m0 4-4 4m-4 0-4-4"/>',
 tierlist:'<path d="M2 21V12h6v9m0 0V7h8v14m0 0V15h6v6M1 21h22"/><path d="m12 1 1 2 2 .3-1.5 1.5.3 2.2L12 6l-1.8 1 .3-2.2L9 3.3l2-.3Z" class="nav-accent"/>',
 profile:'<rect x="2" y="4" width="20" height="16" rx="3"/><circle cx="8" cy="10" r="2" class="nav-accent"/><path d="M4 16c0-4 8-4 8 0m3-7h4m-4 4h4m-4 4h2"/>',
 hoyolab:'<path d="M15 18c-7 5-14-1-12-8A9 9 0 0 1 20 7"/><circle cx="10" cy="8" r="2"/><path d="M5 15c0-5 8-5 8-1"/><path d="m17 10 5 2v4c0 3-5 6-5 6s-5-3-5-6v-4Zm-2 6 1.5 1.5L20 14" class="nav-accent"/>',
 wishes:'<path d="m9 2 2.2 6.8L18 11l-6.8 2.2L9 20l-2.2-6.8L0 11l6.8-2.2Z"/><path d="m18 10 1.5 4.5L24 16l-4.5 1.5L18 22l-1.5-4.5L12 16l4.5-1.5Z" class="nav-accent"/><path d="M13 3c8 0 10 7 4 11"/>',
 changelog:'<path d="M8 3h10a2 2 0 0 1 2 2v9M8 3v7m0-7L4 7m4-4 4 4M4 12v7a2 2 0 0 0 2 2h9m-8-8h6m-6 4h4"/><circle cx="18" cy="18" r="4"/><path d="M18 16v2l2 1" class="nav-accent"/>',
 optimizer:'<path d="M3 4h18M3 12h18M3 20h18"/><circle cx="8" cy="4" r="3"/><circle cx="16" cy="12" r="3" class="nav-accent"/><circle cx="10" cy="20" r="3"/>',
 skowt:'<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10v10M3 7l9 5 9-5M8 4l9 5v5"/><path d="m12 2 9 5-9 5-9-5Z" class="nav-accent"/>',
 data:'<ellipse cx="11" cy="5" rx="8" ry="3"/><path d="M3 5v13c0 3 8 4 12 2M3 11c2 3 11 4 16 0V5"/><circle cx="19" cy="18" r="4"/><path d="m17 18 1.5 1.5L21 17" class="nav-accent"/>',
 'release-notes':'<path d="M4 3h15v16a2 2 0 0 0 2 2H5a3 3 0 0 1-3-3V8h2m15 5h3v6a2 2 0 0 1-3 2M7 7h8m-8 8h8m-8 3h5"/><path d="M7 10h4v3H7Z" class="nav-accent"/>',
 progress:'<path d="M3 3v18h18M7 16l4-5 4 2 6-8"/><path d="M17 5h4v4" class="nav-accent"/>',
 'currency-wars':'<ellipse cx="8" cy="6" rx="6" ry="3"/><path d="M2 6v10c0 3 10 4 12 0V6M2 11c2 3 10 3 12 0m3-7 5 3-5 3m5-3h-5m0 7 5 3-5 3m5-3h-5"/>',
 explore:'<circle cx="12" cy="12" r="9"/><path d="m16 7-2 7-6 3 2-7Z" class="nav-accent"/>'
};
const ALIASES={'hsr-builds':'builds','hsr-lab':'lab','hsr-calc':'calc','hsr-farm':'farming','hsr-endgame':'endgame','hsr-wishes':'wishes','hsr-events':'events','hsr-lore':'lore','hsr-currency-wars':'currency-wars','progress-observatory':'progress'};
export const NAVIGATION_ICON_IDS=Object.freeze(Object.keys(DRAWINGS));
export function navigationIcon(id,game='gi'){
  if(game==='gi'&&GAME_UI[id])return `<img class="nav-game-icon" src="${GAME_UI[id]}" alt="" width="24" height="24" aria-hidden="true">`;
  const key=ALIASES[id]||id,body=key==='daily-quiz'&&game!=='gi'?'<path d="M8 8a4 4 0 1 1 7 3c-2 1-3 2-3 4"/><circle cx="12" cy="19" r="1" class="nav-accent"/><circle cx="12" cy="12" r="10"/>':DRAWINGS[key]||DRAWINGS.explore;
  return `<svg class="ic navigation-icon" data-navigation-icon="${DRAWINGS[key]?key:'explore'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}
