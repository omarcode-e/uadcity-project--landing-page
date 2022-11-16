// Require Express to run server and routes
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// Start up an instance of app
const app = express();

// Setup empty JS object to act as endpoint for all routes
const projectData = {
  entries: [],
};

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());
// Initialize the main project folder
app.use(express.static("src"));

// Setup Server
const port = 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
app.get("/all", (req, res) => {
  res.json(projectData);
});

let i = 0;
app.post("/all", (req, res) => {
  req.body.entryId = Math.floor(Math.random() * 1000000);
  /* Stops pushing the same Data-entry if the temperature
    of previous Data-entry is as same as current Data-entry */
  const preEntryTemp =
    projectData.entries.length === 0 || i === 0
      ? null
      : projectData.entries[i - 1].temp;
  const preEntryFeel =
    projectData.entries.length === 0 || i === 0
      ? null
      : projectData.entries[i - 1].feel;
  if (req.body.temp !== preEntryTemp || req.body.feel !== preEntryFeel) {
    projectData.entries.push(req.body);
    i++;
  }
  console.log(projectData);
  console.log("Data recevied");
});
