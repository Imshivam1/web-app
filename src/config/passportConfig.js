const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MagicLoginStrategy = require('passport-magic-login').default
const Auth0Strategy = require('passport-auth0');
const nodemailer = require('nodemailer');
const User = require('../models/user');
// Configure local strategy
passport.use(new LocalStrategy(User.authenticate()));

// Configure Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BASE_URL + '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            const email = profile.emails[0].value;
            const username = email.split('@')[0];

            user = new User({
                googleId: profile.id,
                username: username,
                email: email,
            });

            await user.save();
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
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

// Configure Magic Login strategy
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, body }) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: body
  });
};

module.exports = (passport) => {
  const magicLogin = new MagicLoginStrategy({ // Using MagicLoginStrategy from passport-magic-login
    secret: process.env.MAGIC_LINK_SECRET,
    callbackUrl: '/auth/magiclogin/callback',
    sendMagicLink: async (destination, href) => {
      await sendEmail({
        to: destination,
        subject: 'Your Magic Login Link',
        body: `Click this link to finish logging in: ${process.env.BASE_URL}${href}`
      });
    },
    verify: async (payload, callback) => {
      try {
        let user = await User.findOne({ email: payload.destination });
        if (!user) {
          user = new User({ email: payload.destination });
          await user.save();
        }
        return callback(null, user);
      } catch (err) {
        return callback(err);
      }
    },
    jwtOptions: {
      expiresIn: '2 days',
    }
  });

  passport.use(magicLogin);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

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
