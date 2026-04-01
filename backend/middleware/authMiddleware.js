const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Middleware to protect routes, making sure only authenticated requests go through
// It relies on CLERK_SECRET_KEY in the environment
const requireAuth = ClerkExpressRequireAuth();

module.exports = { requireAuth };
