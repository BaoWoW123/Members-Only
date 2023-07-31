const mongoose = require('mongoose')
const Schema = mongoose.Schema;
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology:true, useNewUrlParser:true})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'))

const User = mongoose.model("User", new Schema({
    username: {type: String, required:true},
    password: {type:String, required:true}
}, {collection: 'Members_Only'}));

module.exports = User;