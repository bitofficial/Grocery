const { initializeDatabase } = require("./db");
const { initializeSessions } = require("./sessions");

const connectDB = async () => {
  try {
    initializeDatabase();
    initializeSessions();
    console.log("JSON Database & Sessions Initialized Successfully...!!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
