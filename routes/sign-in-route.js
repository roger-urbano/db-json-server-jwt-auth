const jwt = require('../security/jwt');
const delay = require('delay');

module.exports = (userStorage) => {
  return function (req, res) {
    let user = req.body;

    // Agregar Id automático
        // user.id = ('cod-' + Math.random().toString(36).substr(2, 5)).toUpperCase();

    delay(1000).then(() => {
      if(userStorage.registerUser(user)) {
        console.log('User signed in');
        res.status(201).json('User signed in successfully');
      } else {
        console.log('User not signed in');
        res.status(401).send('User not signed in');
        res.send();
      }
    })
  }

}
