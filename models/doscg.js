let mongoose = require('mongoose');
let Schema = mongoose.Schema;

var Doscg = new Schema({
    name: {
        type: String,
        required : [ true, 'name is required'],
        lowercase : true
    },
    email: {
        type: String,
        required : [ true, 'email is required'],
        unique : true,
        lowercase : true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doscg', Doscg);
