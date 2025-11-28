import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
const authMaxRequests = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5');
const submissionMaxRequests = parseInt(process.env.SUBMISSION_RATE_LIMIT_MAX || '10');

export const generalRateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs,
  max: authMaxRequests,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const submissionRateLimiter = rateLimit({
  windowMs,
  max: submissionMaxRequests,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many submission attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
