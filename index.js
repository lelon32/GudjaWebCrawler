const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

/*********************************************************************
	Middleware
*********************************************************************/
// Allow GET request to /data from external sites
// app.use(cors({credentials: true, origin: true}));

// Use body parser to get POST request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*********************************************************************
	Model functions
  https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/
*********************************************************************/
// Call BFS Python script
async function callBFS(url, depth) {
	let promise = new Promise((resolve, reject) => {

		var crawlSuccess = false;

    var spawn = require('child_process').spawn,
        py    = spawn('python3', ['bfs.py']),
        data = [url, depth]
        dataString = '';

    py.stdout.on('data', function(data){
        dataString += data.toString();
    });

    // Prints the confirmation message from stdout.
    py.stdout.on('end', function(){
      // crawlSuccess = true; 		// temporary
        console.log('result=',dataString)
    ;});

    //here is where the data is written to std in to actually call the python function
    console.log(data);

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();

    crawlSuccess = true; 		// temporary

		if (crawlSuccess) { resolve(crawlSuccess); }
		else { reject(crawlSuccess); }

  });

	let message = await promise;
	return message;
}

// Call DFS Python script
async function callDFS(url, depth) {
	let promise = new Promise((resolve, reject) => {

		var crawlSuccess = false;

    var spawn = require('child_process').spawn,
        py    = spawn('python3', ['dfs.py']),
        data = [url, depth]
        dataString = '';

    py.stdout.on('data', function(data){
        dataString += data.toString();
    });

    // Prints the confirmation message from stdout.
    py.stdout.on('end', function(){
      // crawlSuccess = true; 		// temporary
        console.log('result=',dataString)
    ;});

    //here is where the data is written to std in to actually call the python function
    console.log(data);

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();

		crawlSuccess = true; 		// temporary

		if (crawlSuccess) { resolve(crawlSuccess); }
		else { reject(crawlSuccess); }

  });

	let message = await promise;
	return message;
}

/*********************************************************************
	Controller
*********************************************************************/
// GET request sends data.json
app.get("/data", (req, res, next) => {
	res.sendFile(path.join(__dirname, 'data.json'));
})

// POST request for data calls python script, response back data.json
app.post("/data", (req, res, next) => {
	var url = req.body.url,
		depth = req.body.depth,
		algorithm = req.body.algorithm;
	console.log("req.body: ", req.body);

	// Call BFS
	if (algorithm === "bfs") {
		callBFS(url, depth).then(result => {
			console.log("BSF success: ", result);
			if (result) {
				res.status(201).sendFile(path.join(__dirname, 'data.json'));
			}
			else { res.status(500).send(null); }
		})
	}

	// Call DFS
	else if (algorithm === "dfs") {
		callDFS(url, depth).then(result => {
			console.log("DFS success: ", result);
			if (result) {
				res.status(201).sendFile(path.join(__dirname, 'data.json'));
			}
			else { res.status(500).send(null); }
		})
	}

	else {
		console.log("error");
		res.status(400).end('Error in POST /data');
	}
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
