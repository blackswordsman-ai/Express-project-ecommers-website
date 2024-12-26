const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/my_db');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () =>{
  console.log('connected to mongoDB');
});

module.exports =db;
