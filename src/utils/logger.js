// Logging shim.
//
// Debug and warning output is development-only: `process.env.NODE_ENV` is
// inlined at build time, so those branches are removed entirely from the
// production bundle rather than merely staying silent.
//
// Errors always report. A user hitting a real failure is something we want
// visible when they send a screenshot of the console.

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    console.error(...args);
  },
};

export default logger;
