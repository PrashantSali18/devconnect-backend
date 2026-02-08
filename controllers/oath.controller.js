import { generateToken } from '../utils/jwt.utils.js';

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    // Generate JWT token
    const token = generateToken(req.user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/oauth/success?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
// @access  Public
export const githubCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    // Generate JWT token
    const token = generateToken(req.user._id);

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/oauth/success?token=${token}`);
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// @desc    Get linked accounts
// @route   GET /api/auth/linked-accounts
// @access  Private
export const getLinkedAccounts = async (req, res) => {
  try {
    const user = await req.user.populate('linkedAccounts');
    
    res.json({
      linkedAccounts: user.linkedAccounts,
      authProvider: user.authProvider,
      hasGoogleLinked: !!user.googleId,
      hasGitHubLinked: !!user.githubId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unlink social account
// @route   DELETE /api/auth/unlink/:provider
// @access  Private
export const unlinkAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    const user = req.user;

    // Don't allow unlinking if it's the only auth method and no password
    if (!user.password && user.linkedAccounts.length === 1) {
      return res.status(400).json({
        message: 'Cannot unlink the only authentication method. Please set a password first.'
      });
    }

    if (provider === 'google') {
      user.googleId = undefined;
      user.linkedAccounts = user.linkedAccounts.filter(acc => acc.provider !== 'google');
    } else if (provider === 'github') {
      user.githubId = undefined;
      user.linkedAccounts = user.linkedAccounts.filter(acc => acc.provider !== 'github');
    } else {
      return res.status(400).json({ message: 'Invalid provider' });
    }

    await user.save();

    res.json({
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked successfully`,
      linkedAccounts: user.linkedAccounts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};