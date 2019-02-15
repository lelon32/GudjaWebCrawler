const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs')
const bodyParser = require('body-parser');

const app = express();

// Allow GET request to /data from external sites
app.use(cors({credentials: true, origin: true}));

// Use body parser to get POST request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// GET request sends data.json
app.get("/data", (req, res, next) => {
	res.sendFile(path.join(__dirname, 'data.json'));
})

// POST request for data calls python script
app.post("/data", (req, res, next) => {
	var url = req.body.url,
		depth = req.body.depth,
		algorithm = req.body.algorithm;
	console.log("req.body: ", req.body);

	// Call BFS
	if (algorithm === "bfs") {

	}

	// Call DFS 
	else if (algorithm === "dfs") {

	}

	else {
		console.log("error");
		res.status(400).end();
	}
	res.status(201).send();
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
