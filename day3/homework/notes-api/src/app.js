require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware");

const app = express();

app.use(express.json());
app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
