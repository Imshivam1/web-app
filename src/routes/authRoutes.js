const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const flash = require('connect-flash');

// Ensure flash middleware is used
router.use(flash());

// Local auth routes
router.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error'), isEmployee: req.user ? req.user.isEmployee : false });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/signup', (req, res) => {
    res.render('signup', { message: req.flash('error') });
});

router.post('/signup', async (req, res) => {
    try {
        const { email, username, password, isEmployee } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.render('signup', { message: 'All fields are required.' });
        }

        const employeeStatus = isEmployee === 'true';

        if (!employeeStatus) {
            return res.render('signup', { message: 'Only employees can sign up.' });
        }

        // Register new user
        const newUser = new User({ username, email, isEmployee: employeeStatus });
        User.register(newUser, password, (err, user) => {
            if (err) {
                console.error(err);
                let message = 'An error occurred. Please try again.';
                if (err.name === 'UserExistsError') {
                    message = 'Username or email already exists. Please try logging in.';
                }
                return res.render('signup', { message });
            }
            res.redirect('/login');
        });
    } catch (err) {
        console.error(err); // Log the error to the server console
        res.render('signup', { message: 'An error occurred. Please try again.' });
    }
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// Google auth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// Facebook auth routes
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// Magic Link auth routes
router.get('/auth/magic-link', (req, res) => {
    res.render('magic-link');
});
router.post('/auth/magic-link', passport.authenticate('magiclink', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
router.get('/auth/magic-link/callback', passport.authenticate('magiclink', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// Auth0 auth routes
router.get('/auth/auth0', passport.authenticate('auth0', { scope: 'openid email profile' }));
router.get('/auth/auth0/callback', passport.authenticate('auth0', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = router;
