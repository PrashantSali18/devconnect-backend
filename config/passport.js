import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/Users.model.js";
import dotenv from "dotenv";

dotenv.config();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists with email, link Google account
          user.googleId = profile.id;
          user.linkedAccounts.push({
            provider: "google",
            providerId: profile.id,
            email: profile.emails[0].value,
          });

          // Update profile picture if not set
          if (user.profilePicture === '/avtar.png' && profile.photos && profile.photos[0]) {
            user.profilePicture = profile.photos[0].value;
          }

          // Mark email as verified if from Google
          user.isEmailVerified = true;

          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          profilePicture:
            profile.photos && profile.photos[0] ? profile.photos[0].value : "",
          authProvider: "google",
          isEmailVerified: true, // Google emails are already verified
          linkedAccounts: [
            {
              provider: "google",
              providerId: profile.id,
              email: profile.emails[0].value,
            },
          ],
        });

        done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        done(error, null);
      }
    },
  ),
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Get primary email from GitHub
        const email =
          profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : `${profile.username}@github.user`;

        // Check if user exists with this email
        user = await User.findOne({ email });

        if (user) {
          // User exists with email, link GitHub account
          user.githubId = profile.id;
          user.linkedAccounts.push({
            provider: "github",
            providerId: profile.id,
            email,
          });

          // Update profile picture if not set
          if (user.profilePicture === '/avtar.png' && profile.photos && profile.photos[0]) {
            user.profilePicture = profile.photos[0].value;
          }

          // Set GitHub URL if not set
          if (!user.githubUrl && profile.profileUrl) {
            user.githubUrl = profile.profileUrl;
          }

          // Mark email as verified
          user.isEmailVerified = true;

          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName || profile.username,
          email,
          githubId: profile.id,
          profilePicture:
            profile.photos && profile.photos[0] ? profile.photos[0].value : "",
          githubUrl: profile.profileUrl,
          authProvider: "github",
          isEmailVerified: true,
          linkedAccounts: [
            {
              provider: "github",
              providerId: profile.id,
              email,
            },
          ],
        });

        done(null, user);
      } catch (error) {
        console.error("GitHub OAuth error:", error);
        done(error, null);
      }
    },
  ),
);

export default passport;
