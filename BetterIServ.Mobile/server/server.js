const fileExists = require('fs').existsSync;
const express = require('express');
const app = express();
const port = process.env.PORT || 80;

app.get('**', (req, res) => {
  let file = req.url;
  if (!fileExists("./www/" + file)) file = "index.html";
  res.sendFile(file, { root: "www" });
});
app.listen(port, () => console.log("Server started on: " + port));
