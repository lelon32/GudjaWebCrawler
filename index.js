const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs')

const app = express();
app.use(cors({credentials: true, origin: true}));

app.get("/data", (req, res, next) => {
	res.sendFile(path.join(__dirname, 'data.json'));
})

app.use("/", express.static(path.join(__dirname, "front_end")));
app.use((req, res, next) => {
	res.sendFile(path.join(__dirname, 'front_end', 'index.html'));
});

// Catch and handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("Error " + err.status + "\n" + err.message);
});

app.listen(process.env.PORT || 3000, function () {
	   console.log('Example app listening on port 3000!');
});

module.exports = app;
