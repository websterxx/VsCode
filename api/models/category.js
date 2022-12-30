const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
        // Name must not contain numbers or special characters and must have at least a length of 5.
        match : /^[_A-z]*((-|\s)*[_A-z])*.{5,}$/}
}, {timestamps: true});

module.exports = mongoose.model('Category', categorySchema);