const jwt = require('../security/jwt');
const delay = require('delay');

module.exports = (userStorage) => {
  return function (req, res) {
    let session = req.body;
    if (session.email === "admin@example.com") {
      session.role = "admin"
    } else {
      session.role = "user"
    }
    console.log("session: ", session);
    
    delay(1000).then(() => {
      if (userStorage.userExists(session)) {
        console.log('Login Data Valid');
        const token = jwt.tokenGeneration(session);
        res.status(201).json({
          "access_token": token
        });
        // res.status(201).json(token)
      } else {
        console.log('Login attempt failed');
        res.status(401).send('login attempt failed');
        res.send();
      }
    });
  }
}
