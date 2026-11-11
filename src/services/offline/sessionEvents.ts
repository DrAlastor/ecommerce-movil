const listeners = new Set<() => void>();
export function onSessionInvalid(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function sessionInvalid() { listeners.forEach(listener => listener()); }
