const sessionId = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
if (location.protocol === 'http:' && location.port === '8766' && ['127.0.0.1', 'localhost', '::1'].includes(location.hostname)) {
  const payload = () => JSON.stringify({ id: sessionId });
  const heartbeat = () => fetch('/api/app-session/open', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload(),
    cache: 'no-store', keepalive: true,
  }).catch(() => {});
  const closeSession = () => {
    const body = new Blob([payload()], { type: 'application/json' });
    if (!navigator.sendBeacon('/api/app-session/close', body)) {
      fetch('/api/app-session/close', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload(), keepalive: true }).catch(() => {});
    }
  };
  heartbeat();
  const heartbeatTimer = setInterval(heartbeat, 30000);
  addEventListener('pagehide', () => { clearInterval(heartbeatTimer); closeSession(); }, { once: true });
  addEventListener('pageshow', heartbeat);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') heartbeat(); });
}
