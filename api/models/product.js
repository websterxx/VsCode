const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    shopId: {type: mongoose.Schema.Types.ObjectId, immutable:true, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String, default: null},
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}]
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);