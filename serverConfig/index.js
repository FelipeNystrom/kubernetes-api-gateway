const express = require('express');
const helmet = require('helmet');
const passport = require('passport');

module.exports = server => {
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(passport.initialize());
  server.use(helmet());
};
