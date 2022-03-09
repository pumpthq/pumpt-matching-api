const matchesRouter = require('./matching')();

const attachTo = (app) => {
  app.use('/matches', matchesRouter)
  return app
}

module.exports = {attachTo}