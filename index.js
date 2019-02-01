const express = require('express');
const path = require('path');

const app = express();

app.use("/", express.static(path.join(__dirname, "front_end")));
app.use((req, res, next) => {
	res.sendFile(path.join(__dirname, 'front_end', 'index.html'));
});

module.exports = app;

app.listen(3000, function () {
	   console.log('Example app listening on port 3000!');
});
