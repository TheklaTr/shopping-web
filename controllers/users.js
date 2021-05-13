// const users = require('../setup/users.json');
const User = require('../models/user');
const {
    notFound,
    badRequest,
    sendJson,
    createdResource,
} = require('../utils/responseUtils');
/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response getAllUsers
 */
const getAllUsers = async (response) => {
    // TODO: 10.1 Implement this
    const users = await User.find({});
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(users));
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response deleteUser
 * @param {string} userId userId
 * @param {object} currentUser (mongoose document object)
 */
const updateUserRole_ = async (id, role) => {
    const existingUser = await User.findById(id).exec();
    if (['customer', 'admin'].includes(role)) {
        existingUser.role = role;
        existingUser.save();
        return existingUser;
    } else {
        throw new Error('Unknown role');
    }
};

const deleteUser_ = async (id) => {
    const deleteUser = await User.findById(id).exec();
    const test = await deleteUser.deleteOne({ _id: id });
    return deleteUser;
};

const createNewUser_ = async (data) => {
    data.role = 'customer';
    const newUser = new User(data);
    return newUser.save();
};

const emailInUse_ = async (email) => {
    const emailUser = await User.findOne({ email: email }).exec();
    return Boolean(emailUser);
};

const validateUser_ = (user) => {
    const errors = [];

    if (user.email === undefined || user.email === null) {
        errors.push('Missing email');
    }

    if (
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            user.email
        )
    ) {
        errors.push('Invalid email');
    }

    if (!user.password) {
        errors.push('Missing password');
    }

    if (user.password && user.password.length < 10) {
        errors.push('Password is too short');
    }

    if (!user.name) {
        errors.push('Missing name');
    }

    if (user.role && !['customer', 'admin'].includes(user.role)) {
        errors.push('Unknown role');
    }

    return errors;
};

const deleteUser = async (response, userId, currentUser) => {
    // TODO: 10.1 Implement this
    // throw new Error('Not Implemented');
    const deleteUser = await User.findById(userId).exec();
    if (deleteUser === null) {
        return notFound(response);
    } else if (userId === currentUser.id) {
        return badRequest(response, 'Updating own data is not allowed');
    } else {
        try {
            const deleteUser = await deleteUser_(userId);
            return sendJson(response, deleteUser);
        } catch (err) {
            return badRequest(response);
        }
    }
};
/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response updateUser
 * @param {string} userId userId
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {
    // TODO: 10.1 Implement this
    // throw new Error('Not Implemented');
    const existingUser = await User.findById(userId).exec();

    if (!existingUser) {
        return notFound(response);
    }

    if (userId === currentUser.id) {
        return badRequest(response, 'Updating own data is not allowed');
    }

    const updateRole = userData.role;

    if (!updateRole) {
        return badRequest(response);
    }

    try {
        const updatedUser = await updateUserRole_(userId, updateRole);
        return sendJson(response, updatedUser);
    } catch (err) {
        return badRequest(response);
    }
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response viewUser
 * @param {string} userId userId
 * @param {object} currentUser (mongoose document object)
 */
const viewUser = async (response, userId, currentUser) => {
    // TODO: 10.1 Implement this

    const existingUser = await User.findById(userId).exec();

    if (!existingUser) {
        return notFound(response);
    } else {
        return sendJson(response, existingUser);
    }
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response registerUser
 * @param {object} userData JSON data from request body
 */
const registerUser = async (response, userData) => {
    // TODO: 10.1 Implement this
    // throw new Error('Not Implemented');

    const errors = await validateUser_(userData);

    if (errors !== undefined && errors.length > 0) {
        return badRequest(response, errors);
    }
    const inUse = await emailInUse_(userData.email);
    if (inUse) {
        return badRequest(response, 'Email in used');
    }
    const newUser = await createNewUser_(userData);
    return createdResource(response, newUser);
};

module.exports = {
    getAllUsers,
    registerUser,
    deleteUser,
    viewUser,
    updateUser,
};
