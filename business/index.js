import { connect, connection, Schema, model } from "mongoose";
import { config } from "dotenv";
config({ path: ".env" });

connect(process.env.MONGO_URI);
console.log("MongoDBConnectionState: " + connection.readyState);

// Create URL Schema
var userSchema = new Schema({
  name: { type: String, required: true }
});

var exerciseSchema = new Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: false }
});

var User = model("User", userSchema);
var Exercise = model("Exercise", exerciseSchema);

function createUser(req, res) {
  User.findOne({ name: req.body.username }, (err, data) => {
    if (err) {
      return res.json({ error: "error" });
    }
    if (data) {
      return res.json({ error: `Username already taken` });
    } else {
      User.create({ name: req.body.username }, (err, data) => {
        if (err) {
          return err;
        }
        return res.json({ name: data.name, _id: data._id });
      });
    }
  });
}

function getAllUsers(req, res) {
  User.find({}, (err, data) => {
    if (err) {
      return res.json({ error: "Internal server error" });
    }
    if (data) {
      return res.json(data);
    } else {
      return res.json({ msg: "Nothing on database" });
    }
  });
}

function createExercise(req, res) {
  User.findById(req.body.userId, (err, data) => {
    if (err) {
      return res.json({ error: "No user found with given id." });
    }
    if (data) {
      let currentDate;
      if (new Date(req.body.date) == "Invalid Date") {
        currentDate = new Date();
      } else {
        currentDate = new Date(req.body.date);
      }

      let newExercise = {
        userId: req.body.userId,
        description: req.body.description,
        duration: req.body.duration,
        date: currentDate.toLocaleDateString()
      };

      Exercise.create(newExercise, (err, data) => {
        if (err) {
          return err;
        }
        return res.json(newExercise);
      });
    }
  });
}

function getExercisesByUserId(req, res) {
  let from = new Date(req.query.from);
  let to = new Date(req.query.to);

  let query = { userId: req.query.userId };

  if (isValidDate(from) && isValidDate(to)) {
    query = { userId: req.query.userId, date: { $gte: from, $lt: to } };
  } else if (isValidDate(from) && !isValidDate(to)) {
    query = { userId: req.query.userId, date: { $gte: from } };
  } else if (!isValidDate(from) && isValidDate(to)) {
    query = { userId: req.query.userId, date: { $lt: to } };
  }

  Exercise.find(query, (err, data) => {
    if (err) {
      return res.json({ error: "Internal server error" });
    }
    if (data) {
      let limit = req.query.limit > 0 ? req.query.limit : data.length;

      if (req.query.from) {
        console.log("Tem from");
      }

      return res.json(data.slice(0, limit));
    } else {
      return res.json({ msg: "Nothing on database" });
    }
  });
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

module.exports = {
  createUser: createUser,
  getAllUsers: getAllUsers,
  createExercise: createExercise,
  getExercisesByUserId: getExercisesByUserId
};
