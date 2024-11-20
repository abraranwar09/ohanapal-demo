const { google } = require('googleapis');
const User = require('../models/userModel');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  '/auth/google/callback'
);

async function refreshAccessToken(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Configure oauth2Client with user's refresh token
    oauth2Client.setCredentials({
      refresh_token: user.refreshToken
    });

    // Get new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update user with new access token
    user.accessToken = credentials.access_token;
    await user.save();

    return credentials.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

// Middleware to check and refresh token if needed
const checkAndRefreshToken = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  try {
    // Verify token by making a small request to Google
    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    await calendar.calendarList.list();
    
    next();
  } catch (error) {
    if (error.code === 401) { // Token expired
      try {
        const newAccessToken = await refreshAccessToken(req.user._id);
        req.user.accessToken = newAccessToken;
        next();
      } catch (refreshError) {
        next(refreshError);
      }
    } else {
      next(error);
    }
  }
};

module.exports = { refreshAccessToken, checkAndRefreshToken };
