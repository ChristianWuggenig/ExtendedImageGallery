let cfg = require('./config.json')
let express = require('express');
let cors = require('cors')
const app = express();
app.use(express.static('public')); // host public folder
app.options('*', cors()); // Enable preflight HTTP options
let corsOptions = {
    allowedHeaders: ['ContentType', 'Authorization']
}
app.use(cors(corsOptions)); // allow all origins -> Access-Control-Allow-Origin: *
const db = require("./db");

let morgan = require('morgan');
app.use(morgan('common'));//morgan('dev'));

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json({ limit: '20mb' })); // support json encoded bodies, max size 20MB

// set routes
const loginRoutes = require('./routes/login');
const galleryRoutes = require('./routes/gallery');
const imageRoutes = require('./routes/image');

app.use("/login", loginRoutes);
app.use("/gallery", galleryRoutes);
app.use("/image", imageRoutes);
// default route
/*
* EX02
* 
* die default-route (war '/') wird so geändert, dass ein Paramter übergeben werden kann.
* Dies wird gemacht, indem nach '/' mit ':<parameter-name>' festgelegt wird 'hier kommt jetzt ein paramter, der <paramter-name> heißt.
* Das halten wir hier für's erste recht einfach, indem wir unseren Übergabeparamter einfach 'param' nennen.
*/
app.use("/:param", (req, res) => {
    if(!req.params){
        // Hier setzen wir den response-status auf '400'
        res.status(400);
        res.send("Welcome to gallery server 1.0");
    } else {
        res.status(200);
        res.send("Welcome to gallery server 1.0 - you passed the parameter " + req.params.param);
    }
});

db.initDb.then(() => {
    app.listen(cfg.server.port, () => {
        console.log("Listening on port " + cfg.server.port + "...");
    });
}, (error) => {console.log("Failed to connect to DB, message is: " + error);});
