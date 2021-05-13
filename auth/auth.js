const { getCredentials } = require('../utils/requestUtils');
const User = require('../models/user');
/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request getCurrentUser.
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
    // TODO: 8.4 Implement getting current user based on the "Authorization" request header

    // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
    // and getUser(email, password) function from utils/users.js to get the currently
    // logged in user
    const creds = getCredentials(request);
    // 10.1
    if (creds === null) {
        return null;
    }

    const user = await User.findOne({ email: creds[0] }).exec();
    //let user = getUser(creds[0], creds[1]);
    if (!user) {
        return null;
    }
    const auth = await user.checkPassword(creds[1]);
    if (auth) {
        return user;
    } else {
        return null;
    }
};

module.exports = { getCurrentUser };
