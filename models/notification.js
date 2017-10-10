var mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
    username: String,
    content: String,
    date: {type: Date, default: Date.now},
    seen: {type: Boolean, default: false},
    link: {type: String, default: '/'}
});

module.exports = mongoose.model('notification', NotificationSchema);
