const service = require("./downloader.service");

exports.downloadRoomResults = async (req, res) => {
  const { roomId } = req.params;
  const format = req.query.format || "json";

  const data = await service.getRoomResults(roomId);
  if (!data) return res.status(404).json({ error: "Room not found" });

  if (format === "csv") {
    const csv = service.convertToCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=room-${roomId}.csv`);
    return res.send(csv);
  }

  res.setHeader("Content-Disposition", `attachment; filename=room-${roomId}.json`);
  res.json(data);
};
