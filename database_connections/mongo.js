const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/admin';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: 'root',
  pass: 'root'
};

mongoose.connect(connectionString, options)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));
