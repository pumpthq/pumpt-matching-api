var mongoose = require('mongoose');
require('dotenv').config()

const uri = process.env.MONGO_URI

const init = () => {
  if (uri) {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }).then(() => {
      console.log('DB Connection Succeeded');
      // console.log('URI:', uriObject)
    },
      err => {
        console.log('DB Connection Failed');
        console.log(err
        )
      });
  } else {
    console.log("NO URI")
  }

  mongoose.Promise = global.Promise

}
module.exports = { init };