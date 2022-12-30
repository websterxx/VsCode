const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    shopId: {type: mongoose.Schema.Types.ObjectId, immutable:true, required: true},
    name: {
        type: String,
        required: true,
        // Name must not contain numbers or special characters and must have at least a length of 4.
        match : /^[_A-z]*((-|\s)*[_A-z])*.{4,}$/},
    price: {type: Number, required: true, min: 0},
    description: {type: String, default: null},
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}]
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);