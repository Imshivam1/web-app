const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MagicLinkStrategy = require('passport-magic-link').Strategy;
const Auth0Strategy = require('passport-auth0');
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Configure local strategy
passport.use(new LocalStrategy(User.authenticate()));

// Configure Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ googleId: profile.id }, (err, user) => {
        return done(err, user);
    });
}));

// Configure Facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback'
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ facebookId: profile.id }, (err, user) => {
        return done(err, user);
    });
}));

// Configure Magic Link strategy
passport.use(new MagicLinkStrategy({
    secret: process.env.MAGIC_LINK_SECRET,
    userFields: ['email'],
    tokenField: 'token',
    sendToken: async (user, token) => { // Define the sendToken function
        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Or any other email service
            auth: {
                user: process.env.GMAIL_USER, // Your email username
                pass: process.env.GMAIL_PASS // Your email password
            }
        });

        // Define email options
        const mailOptions = {
            from: process.env.GMAIL_USER, // Sender email address
            to: user.email, // Recipient email address
            subject: 'Your Magic Link', // Email subject
            text: `Click this link to sign in: ${process.env.BASE_URL}/auth/magic-link/callback?token=${token}` // Email body with the magic link
        };

        // Send the email
        await transporter.sendMail(mailOptions);
    },
    verifyUser: async (user, token) => {
        const foundUser = await User.findOne({ email: user.email });
        return foundUser || await User.create(user);
    }
}));


// Configure Auth0 strategy
passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: '/auth/auth0/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    User.findOrCreate({ auth0Id: profile.id }, (err, user) => {
        return done(err, user);
    });
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
