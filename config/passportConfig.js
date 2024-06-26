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

// Password hashing middleware
User.schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Password comparison method
User.schema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Configure Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
      // Extract profile image URL from the Google profile
      const profileImageURL = profile.photos[0].value;

      // Find or create user in your database
      let user = await User.findOne({ googleId: profile.id });

      // If user doesn't exist, create a new one
      if (!user) {
          user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              profileImage: profileImageURL 
          });

          // Save the user to the database
          await user.save();
      }

      // Pass the user object to the callback function
      return done(null, user);
  } catch (error) {
      return done(error, false);
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

