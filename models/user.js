const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // TODO: 9.4 Implement this
    name: {
        type: String,
        minlength: 1,
        maxlength: 50,
        set: (v) => v.trim(),
        required: true,
    },
    email: {
        type: String,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: 10,
        required: true,
        set: function (v) {
            if (v.length >= 10) {
                return bcrypt.hashSync(v, bcrypt.genSaltSync(10));
            } else {
                return v;
            }
        },
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
        set: (r) => r.trim().toLowerCase(),
    },
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password password type
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
    // TODO: 9.4 Implement this
    return bcrypt.compare(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
