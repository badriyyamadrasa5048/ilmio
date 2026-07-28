function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  // Redirect to login if not authenticated
  res.redirect('/auth/login');
}

function hasRole(roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.userRole) {
      return res.redirect('/auth/login');
    }
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (allowedRoles.includes(req.session.userRole)) {
      return next();
    }
    
    // Redirect if user doesn't have the appropriate role
    req.session.errorMessage = 'Access denied. You do not have permission to view that page.';
    res.status(403).render('auth/login', { 
      error: 'Access denied: Insufficient permissions.',
      success: null 
    });
  };
}

module.exports = {
  isAuthenticated,
  hasRole
};
