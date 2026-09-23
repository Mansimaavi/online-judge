/**
 * Role-based access control.
 *
 * Must run after `auth` (backend/middleware/auth.js), which already loads
 * the full user document — including `role` — onto req.user. This just
 * checks that field; it does not hit the database again.
 *
 * Usage: router.post('/', auth, requireRole('admin'), handler)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Should never happen if `auth` ran first, but fail closed if it does.
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
