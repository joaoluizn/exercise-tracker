// 'use strict';
import cors from "cors";
import express from "express";
import { urlencoded, json } from "body-parser";
import {
  createUser,
  getAllUsers,
  createExercise,
  getExercisesByUserId
} from "./business/index.js";

var app = express();

// Basic Configuration
app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());

// Serve public folder
app.use(express.static("public"));

// Serve index template
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Application EndPoints
app.post("/api/exercise/new-user", (req, res) => {
  return createUser(req, res);
});

app.get("/api/exercise/users", (req, res) => {
  return getAllUsers(req, res);
});

app.post("/api/exercise/add", (req, res) => {
  return createExercise(req, res);
});

app.get("/api/exercise/log", (req, res) => {
  return getExercisesByUserId(req, res);
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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
