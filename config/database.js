const mongoose = require("mongoose");
require("dotenv").config();

class database {
  constructor() {
    this.connection = null;
  }

  connect() {
    console.log("Connecting to database...");

    mongoose
      .connect(process.env.ORACLESDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
      })
      .then(() => {
        console.log("Connected to database");
        this.connection = mongoose.connection;
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

module.exports = database;
