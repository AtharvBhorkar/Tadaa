const router = require("express").Router();
const { getLevels } = require("../controllers/mystery.controller");

router.get("/levels", getLevels);

module.exports = router;