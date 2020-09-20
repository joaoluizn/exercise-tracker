import express from "express";
import {ExerciseService} from "./exercise/exercises.business";
import { urlencoded, json } from "body-parser";

const MONGO_URI: string = process.env.MONGO_URI;

let port = 3000;
let hostname = "127.0.0.1";
let app = express();

let exerciseService: ExerciseService = new ExerciseService(MONGO_URI);

// // Basic Configuration
app.use(urlencoded({ extended: false }));
app.use(json());

// Serve public folder
app.use(express.static("public"));

// Application EndPoints
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

app.listen(port, hostname, () => {
  console.log(`Your app is running at hostname: ${hostname} on port: ${port}`);
});