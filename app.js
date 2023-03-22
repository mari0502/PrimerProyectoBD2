const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const MongooseConsultor = require('./database_connections/mongo');
const Ne4jConsultor = require('./database_connections/neo4j');
const RedisConsultant = require('./database_connections/redis');
const MySqlConsultor = require('./database_connections/mysql');
const mysqlcons = new MySqlConsultor();
const rediscons = new RedisConsultant();
const neo4jcons = new Ne4jConsultor();
const mongoosecons = new MongooseConsultor();

const usercreds = {
    user: undefined,
    pass: undefined
}

const app = express();
app.set('view engine', 'ejs');
//utilizar .ejs para las views en el folder de views
app.set('views', path.join(__dirname, 'views'));

//json parser para las consultas a bd
app.use(express.json());
app.use(express.urlencoded({extended:true}));

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
        res.send("Loggeado!");
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
    rediscons.insertUser(req.body.user, 
                         req.body.photourl, 
                         req.body.name, 
                         req.body.lastName1, 
                         req.body.lastName2);
    neo4jcons.insertUser(req.body.user);
    mongoosecons.insertUser(req.body.user);
    res.redirect('/');
})


