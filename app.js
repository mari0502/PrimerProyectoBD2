const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('./database_connections/mongo');

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


app.get('/', function(req, res){
    res.render("index");
})

app.listen('9000', () =>{
    console.log('Server running on port 9000');
});
