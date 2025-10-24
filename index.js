const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "dist/Flexy")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/Flexy", "index.html"));
});

// Catch-all handler: send back index.html for any route (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/Flexy", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});