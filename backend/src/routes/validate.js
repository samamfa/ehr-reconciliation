const express = require("express");
const router = express.Router();
const { validateRecord } = require("../services/validateService");

router.post("/data-quality", async (req, res, next) => {
  try {
    const record = req.body;
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      return res
        .status(400)
        .json({ error: "request body must be a JSON object" });
    }

    const result = await validateRecord(record);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
