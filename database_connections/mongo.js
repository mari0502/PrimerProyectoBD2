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

var userSchema = new mongoose.Schema({
  user: String,
  votes: Array
});

var userModel = mongoose.model('users', userSchema)
class MongooseConsultor{
  constructor(){}

  async insertUser(user){
    var userData = new userModel({
      user: user,
      votes: []
    });
    const res = await userData.save();
  }
}

module.exports = MongooseConsultor;