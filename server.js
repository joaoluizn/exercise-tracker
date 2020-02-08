// 'use strict';

// This code is updated to 2020 version.

// Imports
require('dotenv').config({ path: '.env' });
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// db Configuration

// var Schema = mongoose.Schema;

// Serve public folder
app.use(express.static("public"));

// Serve index template
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const endpoints = require("./business/index.js");

// Application EndPoints
app.post("/api/exercise/new-user", (req, res) => {
  return endpoints.createUser(req, res)
});

app.get("/api/exercise/users", (req, res) => {
  return endpoints.getAllUsers(req, res)
});

app.post("/api/exercise/add", (req, res) => {
  return endpoints.createExercise(req, res)
});

app.get("/api/exercise/log", (req, res) => {
  return endpoints.getExercisesByUserId(req, res)
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});


const listener = app.listen(port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
