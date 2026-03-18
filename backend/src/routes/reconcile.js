const express = require("express");
const router = express.Router();

router.post("/medication", async (req, res, next) => {
  try {
    res.json({ message: "reconcile endpoint works" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
