// middleware/auth.js
module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
};

// Middleware function to check if the user is authenticated and is an employee
module.exports.isEmployee = (req, res, next) => {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Please log in to view that resource');
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    // Check if the user is an employee
    if (!req.user.isEmployee) {
        req.flash('error_msg', 'Access denied. Only employees are allowed.');
        return res.status(403).send('Access denied. Only employees are allowed.'); // Return forbidden status if not an employee
    }

    // If authenticated and is an employee, proceed to the next middleware
    next();
};
