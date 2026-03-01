const express = require("express");
const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/create", async (req, res) => {
  const { hostId } = req.body;

  const room = await prisma.room.create({
    data: {
      code: uuidv4().slice(0, 6),
      hostId,
      status: "waiting"
    }
  });

  res.json(room);
});

module.exports = router;
