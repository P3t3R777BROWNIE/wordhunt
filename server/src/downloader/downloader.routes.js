const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { downloadRoomResults } = require("./downloader.controller");

const router = express.Router();
router.get("/room/:roomId", authMiddleware, downloadRoomResults);

module.exports = router;
