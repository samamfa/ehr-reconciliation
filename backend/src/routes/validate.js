const express = require("express");
const router = express.Router();

router.post("/data-quality", async (req, res, next) => {
  try {
    res.json({ message: "validate endpoint works" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
