require("dotenv").config();
const express = require("express");
const routes = require("./routes/index");
const app = express();
const port = process.env.PORT;
// const Company = require("./models/company");
// const User = require("./models/user");
const Match = require("./models/matching");
const cron = require("node-cron");
const cors = require('cors')
const bodyParser = require('body-parser');
const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Status: Server currently running");
});

// app.post("/companies/normalize", async (req, res) => {
//   try {
//     let companies = await Company.find({});
//     companies.map((comp) => {
//       comp.recruiters = [];
//       comp.save();
//     });
//     let compRecs = await User.find({ model: "Recruiter" });
//     compRecs.map((e) => {
//       e._recruiter = null;
//       e.model = "Company";
//       e.save();
//     });
//     return res.status(200).end();
//   } catch (error) {
//     res.send(error);
//   }
// });

routes.attachTo(app);

require("./db/index").init();

cron.schedule("0 0 * * *", async function () {
  try {
    console.log(`Starting Match Cleanup`);
    let start = new Date();
    await Match.deleteMany({ score: { $lt: 50 }, pdfScore: { $lt: 30 } });
    let end = new Date();
    console.log(
      `Match Cleanup Complete. Operation completet in ${
        end - start / 1000
      } seconds`
    );
  } catch {
    console.log('Error cleaning up matches.')
  }
});

app.listen(port, () => {
  console.log(`Server listening on port: http://localhost:${port}`);
});
