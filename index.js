let express = require('express');
let https= require('https');
let cors = require('cors')
let fs = require('fs');
let path = require('path');

let app = express();

app.use(cors());

app.use('/', (req, res, next)=>{
    console.log(req.originalUrl.slice(-1));
    if(req.originalUrl.slice(-1) !== '/'){     
     	// res.header("Access-Control-Allow-Origin", "*");
     	// res.header('Access-Control-Allow-Methods', "OPTIONS, GET, PUT, PATCH, POST, DELETE");
    	// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    } else {
    	// res.header("Access-Control-Allow-Origin", "*");
    	// res.header('Access-Control-Allow-Methods', "OPTIONS, GET, PUT, PATCH, POST, DELETE");
    	// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.redirect('/index.html');
    }    
});

app.use(express.static(path.join(__dirname, '/web-content')));

app.get('/', function(req, res, next) {
  // Handle the get for this route
});

app.post('/', function(req, res, next) {
 // Handle the post for this route
});

let options = {
    key: fs.readFileSync(process.env['SERVER_KEY']),
    cert: fs.readFileSync(process.env['SERVER_CERT']),
    passphrase: process.env['SERVER_PASS'],
}

// app.listen(9090, ()=>{
//    console.log('Started on 9090 no cert');    
// })

https.createServer(options,app).listen(9090, ()=>{
    console.log('App Started on 9090');    
});

