const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    shopId: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    name: {type: String, required: true},
    description: {type: String, default: null},
    img: {type: String, required: true},
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}]
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);