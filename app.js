const express = require("express");
const path = require("path");
const mountRoutes = require("./routes");
const config = require("./config.json");
const session = require("express-session");
const ladybug = require("ladybug-fetch");
const logger = require("morgan");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// app.use("/assets", express.static(path.join(__dirname, "assets")));
const { MongoClient } = require("mongodb");

MongoClient.connect(config.mongodb)
  .then((client) => client.db("ladybug"))
  .then((db) => (app.db = db));
app.config = config;

app.use(logger("combined"));

app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: config.session.secret
}));

app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

mountRoutes(app);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/commands", async(req, res) => {
  const { body: commands } = await ladybug("https://api.itsladybug.ml/pieces/commands/all");
  return res.render("commands.ejs", { commands });
});

app.get("/invite", (req, res) => {
  res.redirect("https://discordapp.com/oauth2/authorize?client_id=397796982120382464&permissions=1345350758&scope=bot");
});

app.get("/repo/:name", (req, res) => {
  const { name } = req.params;
  return res.redirect(`https://github.com/pollen5/${name}`);
});

app.use((req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(404).render("404.ejs");
});

app.listen(app.get("port"), () => {
  // eslint-disable-next-line no-console
  console.log("Listening to port %s", app.get("port"));
});

