const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const request = require('request');

const app = express();

/*********************************************************************
	Middleware
*********************************************************************/
// Allow cross-origin reqs for Angular testing
app.use(cors({credentials: true, origin: true}));

// Use body parser to get POST request parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use to generate cookies
app.use(cookieParser());

var urlHistory = [];
var keywordFoundURL = "";

/*********************************************************************
	Model functions
  https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/
*********************************************************************/
// Call BFS Python script
async function callBFS(url, depth, keyword) {
	let promise = new Promise((resolve, reject) => {

		var crawlSuccess = false;

    var word = "";
    if(keyword == null){
      word = "";
    } else {
      word = keyword;
    }

    var spawn = require('child_process').spawn,
      py    = spawn('python3', ['bfs.py']),
      data = [url, depth, word],
      dataString = '';

    py.stdout.on('data', function(data){
      dataString += data.toString();
    });

    // Prints the confirmation message from stdout.
    py.stdout.on('end', function(){
        // Check the string returned by stdout from bfs.py. If there exists a comma, then
        // the secondary URL is the one which the keyword is found.
        if(dataString.includes(",")) {
          keywordFoundURL = dataString.substring(dataString.lastIndexOf(",") + 1, dataString.length-1);
          dataString = dataString.substring(0, dataString.lastIndexOf(","));
        }

        console.log('rootURL= ', dataString);
        urlHistory.push(dataString);
        console.log("keywordFoundURL= " + keywordFoundURL);
				resolve(true);
    ;});

    //here is where the data is written to std in to actually call the python function
    console.log('data: ', data);

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();

  });

	let message = await promise;
	return message;
}

// Call DFS Python script
async function callDFS(url, depth, keyword) {
	let promise = new Promise((resolve, reject) => {

		var crawlSuccess = false;

    var spawn = require('child_process').spawn,
        py    = spawn('python3', ['dfs.py']),
        data = [url, depth],
        dataString = '';

    py.stdout.on('data', function(data){
        dataString += data.toString();
    });

    // Prints the confirmation message from stdout.
    py.stdout.on('end', function(){
        console.log('result=',dataString);
        urlHistory.push(dataString);
				resolve(true);
    ;});

    //here is where the data is written to std in to actually call the python function
    console.log('data: ', data);

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();

  });

	let message = await promise;
	return message;
}

// Process cookie
function processCookie(cookie, validatedURL, keyword) {
	var url = validatedURL.trim();
	if (keyword === null || keyword.length === 0) {
		keyword = "-";
	} else {
		keyword = keyword.trim();
	}
	console.log("req.cookies.urlHistory: ", cookie);
	cookie = JSON.parse(cookie);
	cookie.push(url);
	cookie.push(keyword);
	cookie = JSON.stringify(cookie);

	console.log("cookie: ", cookie);
	return cookie;
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
		algorithm = req.body.algorithm,
		keyword = req.body.keyword;
	console.log("req.body: ", req.body);

  // Clear out the urlHistory array
  urlHistory.splice(0,urlHistory.length);

  // Clear out the URL
  keywordFoundURL = "";

  var validatedURL = url;

  var validSubstrHttp = validatedURL.substring(0,7);
  var validSubstrHttps = validatedURL.substring(0,8);

  if(!(validSubstrHttp == "http://" || validSubstrHttps == "https://")) {
    validatedURL = "http://" + validatedURL;
  }

  // https://stackoverflow.com/questions/16687618/how-do-i-get-the-redirected-url-from-the-nodejs-request-module
  var r = request.get(validatedURL, function (err, response, body) {
    //console.log(res.request.uri.href); // alternate
    validatedURL = r.uri.href;

    // Call BFS
    if (algorithm === "bfs") {
      //console.log("final validated URL: " + validatedURL); // debugging
      callBFS(validatedURL, depth, keyword).then(result => {

        console.log("BFS success: ", result);
				//var cookie = processCookie(req.cookies.urlHistory, validatedURL, keyword);
        //res.cookie("urlHistory", cookie);
        res.status(201).sendFile(path.join(__dirname, 'data.json'));
      }).catch(result => {
        console.log("BFS success: ", result);
        res.status(500).send(null);
      })
    }

    // Call DFS
    else if (algorithm === "dfs") {
      callDFS(validatedURL, depth, keyword).then(result => {

	      console.log("DFS success: ", result);
				console.log("cookies: ", req.cookies);
				//var cookie = processCookie(req.cookies.urlHistory, validatedURL, keyword);
	      //res.cookie("urlHistory", cookie);
	      res.status(201).sendFile(path.join(__dirname, 'data.json'));

      }).catch(result => {
        console.log("DFS success: ", result);
        res.status(500).send(null);
      });
    }

    else {
      console.log("error");
      res.status(400).end('Error in POST /data');
    }
  });
})

//Iterate users data from cookie
app.get('/gethistory', (req, res)=>{
  //shows all the cookies
  res.send(req.cookies);
});

// Initialize the urlHistory cookie
app.use("/", (req, res, next) => {
	if (req.cookies === undefined || req.cookies.urlHistory === undefined) {
		res.cookie("urlHistory", "[]");
	}
	next();
});

app.use(express.static(path.join(__dirname, "front_end")));

// app.use((req, res, next) => {
// 	res.sendFile(path.join(__dirname, 'front_end', 'index.html'));
// });

// Catch and handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("Error " + err.status + "\n" + err.message);
});

app.listen(process.env.PORT || 3000, function () {
	   console.log('Example app listening on port 3000!');
});

module.exports = app;
