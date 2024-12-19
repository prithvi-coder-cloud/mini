const mongoose = require("mongoose");

const deletedUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure email is unique
    },
    role: {
        type: String,
        enum: ['user', 'company', 'course provider'], // Updated roles
        default: 'user' // Default role
    },
    deletedAt: {
        type: Date,
        default: Date.now // Timestamp for when the user was deleted
    }
});

const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema);

module.exports = DeletedUser;
