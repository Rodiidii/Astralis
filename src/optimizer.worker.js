import { optimizeArtifacts } from './optimizer.js';
let activeJob = null;
self.onmessage = async event => {
  const message = event.data || {};
  if (message.type === 'cancel') { if (activeJob === message.id) activeJob = null; return; }
  if (message.type !== 'optimize') return;
  const { id, options } = message; activeJob = id;
  try {
    const result = await optimizeArtifacts({ ...options, onProgress: progress => { if (activeJob === id) self.postMessage({ type: 'progress', id, progress }); }, cancelled: () => activeJob !== id });
    if (activeJob === id) self.postMessage({ type: 'result', id, result });
  } catch (error) { if (activeJob === id) self.postMessage({ type: 'error', id, error: String(error?.message || error) }); }
  if (activeJob === id) activeJob = null;
};
