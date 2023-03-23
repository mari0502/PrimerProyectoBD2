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
  foto: String,
  nombre: String,
  apellido1: String,
  apellido2: String,
  votes: Array,
});

var userModel = mongoose.model('users', userSchema)
class MongooseConsultor{
  constructor(){}

  async insertUser(user, foto, nombre, apellido1, apellido2){
    var userData = new userModel({
      user: user,
      foto: foto,
      nombre: nombre,
      apellido1: apellido1,
      apellido2: apellido2,
      votes: []
    });
    await userData.save();
  }

  async getUserProfile(user){
    return new Promise(async function(resolve, reject){
      const res =  await userModel.findOne({user: user});
      resolve(res);
    });
  }

  async updateUserProfile(user ,foto, nombre, apellido1, apellido2){
    var userinfo = {
      foto: foto,
      nombre: nombre,
      apellido1: apellido1,
      apellido2: apellido2,
      votes: []
    }
    await userModel.findOneAndUpdate(user, userinfo);
  }
}

module.exports = MongooseConsultor;