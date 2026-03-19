const express = require("express");
const router = express.Router();
const { reconcileMedication } = require("../services/reconcileService");

router.post("/medication", async (req, res, next) => {
  try {
    const { patient_context, sources } = req.body;

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return res
        .status(400)
        .json({ error: "sources must be a non-empty array" });
    }
    for (const source of sources) {
      if (!source.system || !source.medication) {
        return res
          .status(400)
          .json({ error: "each source needs system and medication fields" });
      }
    }

    const result = await reconcileMedication(patient_context || {}, sources);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
