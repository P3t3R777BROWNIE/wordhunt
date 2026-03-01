const prisma = require("../config/prisma");

exports.getRoomResults = async (roomId) => {
  return prisma.gameResult.findMany({ where: { roomId } });
};

exports.convertToCSV = (data) => {
  if (!data.length) return "";
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row =>
    Object.values(row)
      .map(val => `"${String(val).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers, ...rows].join("\n");
};
