const rateLimit = require("express-rate-limit");

const createCheckoutSessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    ratelimit:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    ratelimit:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

const emailRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per `windowMs`
  message: { ratelimit: "Too many requests, please try again later." },
});

module.exports = {
  createCheckoutSessionLimiter,
  emailRateLimiter,
  registrationLimiter,
};
