var mongoose = require('mongoose');

// Document schema for polls
exports.UserSchema = new mongoose.Schema({
		EMP_NAME: { type: String, required: true },
        EMP_ID: { type: String, required: true },
        CUID: { type: String, required: true },
        Level: { type: String, required: true },
        Division: { type: String, required: true }
});