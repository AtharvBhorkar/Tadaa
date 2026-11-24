const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { CLIENT_URL } = require("./config/env");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", app: "Tadaa" }));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/mystery", require("./routes/mystery.routes"));
app.use("/api/orders", require("./routes/order.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;