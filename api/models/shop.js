const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    name: {type: String, required: true},
    img: {type: String},
    products: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product'
        }
    ],
    managedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

module.exports = mongoose.model('Shop', shopSchema);