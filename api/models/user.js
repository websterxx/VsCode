const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    firstName: {type: String, default: null},
    lastName: {type: String, default: null},
    email: {
        type: String,
            required: true,
            unique: true,
            match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            immutable:true },
    password: {type: String},
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isManager: {
        type: Boolean,
        default: false,
    },
    shopManaged : {type: mongoose.Schema.Types.ObjectId , ref: 'Shop' , default: null}
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);