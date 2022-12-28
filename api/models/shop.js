const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    name: {type: String, required: true},
    products: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product'
        }
    ],
    isInHoliday : {type : Boolean, required: true},
    managedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    creationDate : {type: Date , default: null}
}, {timestamps: true});

module.exports = mongoose.model('Shop', shopSchema);