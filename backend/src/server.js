const { PORT } = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Tadaa server running on port ${PORT}`));
});