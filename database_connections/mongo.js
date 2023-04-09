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
  user: {
    type: String,
    unique: true
  },
  foto: String,
  nombre: String,
  apellido1: String,
  apellido2: String,
  fechaNacimiento: String,
  votes: Array,
});

var datasetSchema = new mongoose.Schema({
  user: String,
  name: {
    type: String,
    unique: true 
  },
  desc: String,
  date: Date,
  pic: String,
  archive: String,
  size: Number,
  video: String,
  comments: Array
});

var msgSchema = new mongoose.Schema({
  user1: String,
  user2: String,
  messages: Array
});

var userModel = mongoose.model('users', userSchema)
var datasetModel = mongoose.model('datasets', datasetSchema);
var msgModel = mongoose.model('msgs', msgSchema);
class MongooseConsultor{
  constructor(){}

  async insertUser(user, foto, nombre, apellido1, apellido2, fechaNacimiento){
    var userData = new userModel({
      user: user,
      foto: foto,
      nombre: nombre,
      apellido1: apellido1,
      apellido2: apellido2,
      fechaNacimiento: fechaNacimiento,
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

  async updateUserProfile(user ,foto, nombre, apellido1, apellido2, fechaNacimiento){
    var userinfo = {
      foto: foto,
      nombre: nombre,
      apellido1: apellido1,
      apellido2: apellido2,
      fechaNacimiento: fechaNacimiento,
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
  async lookForDatasets(keyword){
    return new Promise(async function(resolve, reject){
      var reply = await datasetModel.find({$or:[{desc: {"$regex": keyword, "$options": "i"}},{name: {"$regex": keyword, "$options": "i"}}]});
      resolve(reply);
    });
  }
  async userDatasets(keyword){
    return new Promise(async function(resolve, reject){
      var reply = await datasetModel.find({user: keyword});
      resolve(reply);
    });
  }
  async specificDataset(keyword){
    return new Promise(async function(resolve, reject){
      var reply = await datasetModel.find({_id: keyword});
      resolve(reply);
    });
  }
  async newComment (username, datasetID, commentArray, userVote){
    await datasetModel.updateOne({_id: datasetID}, {$push: {comments:commentArray}});
    await userModel.updateOne ({user:username}, {$push: {votes: userVote}});
  }

  async newCommentOfComment (datasetID, numArray, commentArray){
    await datasetModel.updateOne({_id: datasetID}, {$push: {'comments.0.answer' : commentArray}});
  }

  async newMessage(user1, user2, msg){
    var msgData = new msgModel({
      user1: user1,
      user2: user2,
      messages: [msg]
    });
    await msgData.save();
  }

  async replyMessage(user1, user2, msg){
    const res1 =  await msgModel.findOne({user1: user1, user2:user2});
    const res2 = await msgModel.findOne({user1: user2, user2:user1});
    if(res1){
      res1.messages.push(msg);
      await msgModel.findOneAndUpdate({user1: user1, user2:user2}, res1);
    }
    else{
      res2.messages.push(msg);
      await msgModel.findOneAndUpdate({user1: user2, user2:user1}, res2);
    }
  }

  async getUserMessages(user){
    return new Promise(async function(resolve, reject){
      const res =  await msgModel.find({$or :[{user1: user}, {user2:user}]});
      resolve(res);
    });
  }

  async getSpecificUsersMessages(user1, user2){
    return new Promise(async function(resolve, reject){
      const res1 =  await msgModel.findOne({user1: user1, user2:user2});
      const res2 = await msgModel.findOne({user1: user2, user2:user1});
      if(res1){
        resolve(res1);
      }
      else{
        resolve(res2); 
      }
    });
  }
}

module.exports = MongooseConsultor;