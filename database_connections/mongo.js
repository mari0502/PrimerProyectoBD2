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

var datasetSchema = new mongoose.Schema({
  user: String,
  name: String,
  desc: String,
  date: Date,
  pic: String,
  archive: String,
  size: Number,
  video: String,
  comments: Array
});

var userModel = mongoose.model('users', userSchema)

var datasetModel = mongoose.model('datasets', datasetSchema);
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

  async newDataset(user, name, desc, date, pic, archive, size, video){
    var datasetData = new datasetModel({
      user: user,
      name: name,
      desc: desc,
      date: date,
      pic: pic,
      archive: archive,
      size: size,
      video: video,
      comments: []
    });
    await datasetData.save();
  }
}

module.exports = MongooseConsultor;