// GET JSON file in args 
const yargs = require('yargs');
yargs.options({
  port: {
    alias: 'p',
    description: 'Set port',
    default: 3000
  },
  file: {
    alias: 'f',
    description: 'Set JSON File',
    default: './json-samples/default.json',
    // default: './json-samples/marcadores.json'
  },
  authentication: {
    alias: 'a',
    description: 'Enable authenticaded routes',
    default: 'true'
  },
  delay: {
    alias: 'd',
    description: 'Miliseconds delay before response',
    default: '2000'
  }
});



const express = require('express');
const path = require('path');
const multer  = require('multer');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(yargs.argv.file);
const middlewares = jsonServer.defaults();
const serveIndex = require('serve-index');

/* ============== Upload Imagen ============== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));  // Almacenar archivo en esta dirección
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now());  // Almacenar archivo con fecha actualizada
    var fieldName = 'file';
    req.body[fieldName] ? cb(null, req.body[fieldName]) : cb(null, file.originalname);  // Obtener nombre de archivo
  }
})

const upload = multer({ storage })

server.use('/', upload.any());
// server.use('/', upload.any(), function(req, res) {
//   console.log('[' + new Date().toISOString() + '] - File uploaded:', req.files[0].path);
//   res.end();
// });

/* ========================================== */

// bodyParser, load json-server instance to use in this module
server.use(jsonServer.bodyParser)

// Use json-server middlewares 
server.use(middlewares);

// configure user storage in memory
const userStorage = require('./security/users-storage')(
  {
  email: 'user@example.com',
  password: '1234'
  }
);
userStorage.logUsers();

// Route for login
const login = require('./routes/login-route')(userStorage);
server.post('/login', login);

// Route for sign-in
const register = require('./routes/sign-in-route')(userStorage);
server.post('/sign-in', register);

// Auth middleware 
if (yargs.argv.authentication === 'true') {
  const authMiddleware = require('./middleware/auth-middleware');
  server.use(authMiddleware);
}

// delay middleware
const delayMiddleware = require('./middleware/delay-middleware')(yargs.argv.delay);
server.use(delayMiddleware);

// Token verify route
const verify = require('./routes/verify-route');
server.get('/verify', verify);

/*============= CONFIGURACION IMAGEN STATIC =============*/
/* Use static images */
// server.use('/static', express.static(path.join(__dirname, 'public')))

/* Avoid CORS issue */
// server.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


server.use(jsonServer.rewriter({
  '/image/:id': '/static/images/photo.jpg'
}))

server.use(jsonServer.defaults(['./public'])) 

 /*=================================*/

// Start JSON Server
server.use(router);
server.listen(yargs.argv.port, () => {
  console.log(`
JSON Server is running on port ${yargs.argv.port}
http://localhost:${yargs.argv.port}
`)
});