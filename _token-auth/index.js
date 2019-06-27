const jwtStrategy = require('./jwtStrategy');

module.exports = passport => {
  passport.use('jwt', jwtStrategy);
};
