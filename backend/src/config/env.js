require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET"];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing env variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  // local testing only: lets the test "Pay" button mark an order paid
  DEV_FAKE_PAYMENT: process.env.DEV_FAKE_PAYMENT === "true",
};