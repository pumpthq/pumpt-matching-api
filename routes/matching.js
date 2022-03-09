const express = require('express');
const router = express.Router();
const MatchingHandler = require('../handlers/matchHandler')


module.exports = function() {
  let matchingHandler = new MatchingHandler();
  
  // router.get('/',  matchingHandler.getMatches)
  router.get('/vacancy/:id',  matchingHandler.matchesVacancy)
  // router.get('/company/:id',  matchingHandler.matchesCompany)
  router.get('/candidate/:id',  matchingHandler.matchesVacancy)
  router.get('/bookmark/:id',  matchingHandler.bookmark)
  router.get('/approve/:id',  matchingHandler.approve)
  router.post('/approve/:id',  matchingHandler.connect)
  router.get('/reject/:id',  matchingHandler.reject)
  router.get('/restore/:id',  matchingHandler.restore)
  router.get('/update',  matchingHandler.updateMatches)
  router.post('/update',  matchingHandler.updateMatches)

  return router
}