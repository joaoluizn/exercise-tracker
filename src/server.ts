// 'use strict';
// import cors from "cors";
// import "./lib/env";
import express from "express";
import {ExerciseService} from "./exercise/exercises.business";
import { urlencoded, json } from "body-parser";
// import {
//   createUser,
//   getAllUsers,
//   createExercise,
//   getExercisesByUserId
// } from "../business/index.js";

const MONGO_URI: string = process.env.MONGO_URI;

let port = 3000;
let hostname = "127.0.0.1";
let app = express();

let exerciseService: ExerciseService = new ExerciseService(MONGO_URI);

// // Basic Configuration
// app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(json());

// Serve public folder
app.use(express.static("public"));

// // Application EndPoints
app.post("/api/exercise/new-user", (req, res) => {
  exerciseService.tryToCreateUser(req, res);
});

app.get("/api/exercise/users", (_request, response) => {
  exerciseService.getUsers(_request, response);
});

app.post("/api/exercise/add", (req, res) => {
  exerciseService.tryToCreateExercise(req, res);
});

app.get("/api/exercise/log", (req, res) => {
  exerciseService.getExerciseByUserID(req, res);
});

// // Not found middleware
// app.use((req, res, next) => {
//   return next({ status: 404, message: "not found" });
// });

// // Error Handling middleware
// app.use((err, req, res, next) => {
//   let errCode, errMessage;

//   if (err.errors) {
//     // mongoose validation error
//     errCode = 400; // bad request
//     const keys = Object.keys(err.errors);
//     // report the first validation error
//     errMessage = err.errors[keys[0]].message;
//   } else {
//     // generic or custom error
//     errCode = err.status || 500;
//     errMessage = err.message || "Internal Server Error";
//   }
//   res
//     .status(errCode)
//     .type("txt")
//     .send(errMessage);
// });

app.listen(port, hostname, () => {
  console.log(`Your app is running at hostname: ${hostname} on port: ${port}`);
});