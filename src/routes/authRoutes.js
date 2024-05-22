const express = require('express');
const passport = require('passport');
const router = express.Router();

// Local auth routes
router.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));
router.get('/signup', (req, res) => {
    res.render('signup');
});
router.post('/signup', (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            return res.render('signup', { error: err.message });
        }
        passport.authenticate('local')(req, res, () => {
            res.redirect('/');
        });
    });
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
