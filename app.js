const express = require('express');
const request = require('request');
const { Buffer } = require('buffer');
const path = require('path');
const Fs = require('fs/promises');
const MongooseConsultor = require('./database_connections/mongo');
const Ne4jConsultor = require('./database_connections/neo4j');
const RedisConsultant = require('./database_connections/redis');
const MySqlConsultor = require('./database_connections/mysql');
const mysqlcons = new MySqlConsultor();
const rediscons = new RedisConsultant();
const neo4jcons = new Ne4jConsultor();
const mongoosecons = new MongooseConsultor();

var usercreds = {
    user: undefined,
    pass: undefined
}

var userprofile = {};

async function fileSize (path) {  
    return new Promise(async function(resolve, reject){
        const stats = await Fs.stat(path)  
        resolve(stats.size);
      });
}

const app = express();
app.set('view engine', 'ejs');
//utilizar .ejs para las views en el folder de views
app.set('views', path.join(__dirname, 'views'));

//json parser para las consultas a bd
app.use(express.json({limit: '10000mb', extended: true}));
app.use(express.urlencoded({limit: '10000mb', extended:true, parameterLimit:500000000}));
app.use(express.text({limit:'10000mb'}))

//carpeta public para imgs y demas
app.use(express.static('public'));
app.use(express.static('files'));
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res){
    res.render("index");
});

app.listen('9000', () =>{
    console.log('Server running on port 9000');
});

app.post('/login', async (req, res) => {
    const login = await mysqlcons.login(req.body.user, req.body.pass);
    if(login){
        //To do: add main page 
        usercreds = {
            user: login.user,
            pass: login.pass
        };
        userprofile = await mongoosecons.getUserProfile(usercreds.user);
        res.redirect('mainpage');
    }
    else{
        res.render('index',{
            alert: true,
            alertTitle: "Error",
            alertMessage: "Usuario y/o contraseña incorrectas!",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta: 'index'
        });
    }
});

app.get('/register', (req, res) => {
    res.render("register");
});

app.post('/register', (req, res) => {
    mysqlcons.insertUser(req.body.user, req.body.pass);
    neo4jcons.insertUser(req.body.user);
    mongoosecons.insertUser(req.body.user, 
                            req.body.photourl, 
                            req.body.name, 
                            req.body.lastName1, 
                            req.body.lastName2,
                            req.body.birthdate);
    res.redirect('/');
})

app.get('/mainpage', async (req, res) => {
    const notificacions = await rediscons.getUserNotifications(usercreds.user);
    const keys = Object.keys(notificacions);
    var nots = [];
    keys.forEach(key => {
        var keyvalue = JSON.parse(notificacions[key]).mensaje;
        var msg = {
            message: keyvalue
        }
        nots.push(msg);
    });
    res.render('mainpage', {
        nots: JSON.stringify(nots)
    });
});

app.get('/userprofile', (req, res) => {
    res.render('userprofile', {
        userprofile: JSON.stringify(userprofile)
    });
});

app.post('/modifyprofile', async (req,res) =>{
    await mongoosecons.updateUserProfile(usercreds.user, 
        req.body.photourl, 
        req.body.name, 
        req.body.lastname1, 
        req.body.lastname2);
    userprofile = await mongoosecons.getUserProfile(usercreds.user);
    res.redirect('mainpage');
});


app.get('/newdataset', (req, res) =>{
    res.render('newdataset');
});

app.post('/newdataset', async (req, res) => {
    const dataStartIndex = req.body.archiveurl.indexOf(',') + 1; // find the index of the comma separating the data type from the actual data
    const encodedData = req.body.archiveurl.substring(dataStartIndex);
    const decodedData = Buffer.from(encodedData, 'base64');

    await mongoosecons.newDataset(
        usercreds.user,
        req.body.name,
        req.body.desc,
        Date.now(),
        req.body.photourl,
        req.body.archiveurl,
        decodedData.byteLength,
        req.body.videourl
    );
    await neo4jcons.insertDataSet(req.body.name, usercreds.user);
    const users = await neo4jcons.getUsersFollowingMe(usercreds.user);
    console.log(users);
    users.forEach(user => {
        rediscons.sendNotification(usercreds.user, user);
    });
    res.redirect('mainpage');  
});

app.post('/lookfordataset', async (req,res) =>{
    const look = req.body.lookfor;
    const typeOf = req.body.typeofSearch;
    userprofile = await mongoosecons.getUserProfile(look);
    if (typeOf=="name_description"){
        datasets = await mongoosecons.lookForDatasets(look);
        res.render('datasetsfound',{
            datasetname: look,
            datasets: JSON.stringify(datasets)
        });
    } else if (typeOf=="user") {
        datasets = await mongoosecons.userDatasets(look);
        followed = await neo4jcons.getIfUserFollowed(usercreds.user, look);
        res.render('datasetsUser',{
            username: JSON.stringify(look),
            datasets: JSON.stringify(datasets),
            followed: followed,
            photo: JSON.stringify(userprofile)
        });
    } else{
        res.redirect("mainpage");
    }
});

app.post('/datasetInfo', async(req, res) =>{
    const datasetId = req.body.btn;
    datasetF = await mongoosecons.specificDataset(datasetId);
    dataset = datasetF[0];
    res.render('datasetInfo',{
        datasetname: dataset.name,
        dataset: JSON.stringify(dataset)
    });
});

app.post('/insertDatasetComment', async(req, res) =>{
    console.log(usercreds.user);
    
});

app.post('/followuser', async(req,res) => {
    const userfollow = req.body.followusrname;
    const userfollowing = usercreds.user;
    await neo4jcons.addFollowRelation(userfollow, userfollowing);
    res.render("mainpage", { 
        nots: "Testing",
        alert: true,
        alertTitle: "Success",
        alertMessage: "Ahora sigues al usuario " + req.body.followusrname,
        alertIcon: "success",
        showConfirmButton: true,
        timer: false,
        ruta: 'mainpage'
    });
});

app.get('/mydatasets', async (req, res) => {
    datasets = await mongoosecons.userDatasets(usercreds.user);
    res.render('mydatasets',{
        username: JSON.stringify(usercreds.user),
        datasets: JSON.stringify(datasets),
        followed: true,
        photo: JSON.stringify(userprofile)
    });
});

app.post('/clonepost', async(req, res) => {
    dataset = JSON.parse(req.body.clonedataset);
    dataset.name = req.body.newname;
    await mongoosecons.newDataset(dataset.user, dataset.name, dataset.desc,
                                  Date.now(), dataset.pic, dataset.archive, dataset.size,
                                  dataset.video);
    res.render("mainpage", { 
        nots: "Testing",
        alert: true,
        alertTitle: "Success",
        alertMessage: "Has clonado el dataset con éxito",
        alertIcon: "success",
        showConfirmButton: true,
        timer: false,
        ruta: 'mainpage'
    });
});