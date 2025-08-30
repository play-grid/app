export function devLog(...args: any[]) {
  if (import.meta.env.NODE_ENV === 'development') {
    console.warn(...args); // or forward to a better logger
  }
}
