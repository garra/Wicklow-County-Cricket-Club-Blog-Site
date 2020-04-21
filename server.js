require ('./config')

const express     = require ('express')
const helmet      = require ('helmet');
const cors        = require ('cors')
const bodyParser  = require ('body-parser')
const mongoose    = require ('mongoose')
const Users       = require('./routes/User')
const Image       = require ('./routes/Image')
const RateLimit   = require('express-rate-limit');
const https       = require('https');
const fs          = require('fs');
const path        = require ('path');
const log4js      = require('log4js');

log4js.configure({
  appenders: { 'file': { type: 'file', filename: 'logs/loggers.log' , maxLogSize: 10485760, backups: 3, compress: true } },
  categories: { default: { appenders: ['file'], level: 'debug' } },
});

const logger = log4js.getLogger('loggers');

const app         = express ()
const port        = process.env.PORT || 5000

app.use (cors ())
app.use (bodyParser.json ())
app.use (
  bodyParser.urlencoded ({
    extended: false
  })
) 

// /* only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)  */
// app.enable('trust proxy'); 

// var limiter = new RateLimit({
//   windowMs: 15*60*1000, // 15 minutes 
//   max: 1000, // Limit each IP to 100 requests per windowMs 
//   delayMs: 0, // Disable delaying - full speed until the max limit is reached 
//   message: 'Too many requests' //Message to send
// });
 
// //  apply to all requests 
// app.use(limiter);


app.use (helmet.xssFilter ()) //  X-XSS-Protection header to prevent reflected XSS attacks
app.use (helmet.frameguard ({ action: 'deny' }))  // Don't allow to be in ANY frames
app.use(helmet.hidePoweredBy()); // Hides X-Prowered by from header

app.use(express.static(path.join(__dirname, 'build')));

// Routes
app.use ('/users', Users)
app.use ('/blogs', Image)
app.get('*', (req, res) => {     res.sendFile(path.join(__dirname, 'build', 'index.html'));})

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

mongoose
  .connect( 
    process.env.MONGO_URI,
    { useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
  .then(() => logger.info ('MongoDB Connected'))
  .catch(err => logger.error (err))


  app.listen(port, () => {
    logger.info ('Server listening at port: '+port)
  })
 
