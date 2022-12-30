const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, immutable:true},
    name: {
        type: String,
         required: true,
         // Name must not contain numbers or special characters and must have at least a length of 6.
         match : /^[_A-z]*((-|\s)*[_A-z])*.{6,}$/
        },
    products: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product'
        }
    ],
    isInHoliday : {type : Boolean, required: true},
    managedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    openningHours: [{
        day: {type: String},
        periods: [{
            start: {type: Date},
            end: {type: Date}
        }]
    }],
    creationDate : {type: Date , default: null}
}, {timestamps: true});

module.exports = mongoose.model('Shop', shopSchema);