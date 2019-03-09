const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const request = require('request');
const rp = require('request-promise');
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



function make_call() {
    var options = {
        method: "GET",
        uri: "https://us-central1-crawltest.cloudfunctions.net/DFS",

        json: true
    };

   return rp(options).then( (result) =>{
        console.log(result);
        return result;

    })

}



// Call DFS Python script
async function callDFS(url, depth, keyword) {
	let promise = new Promise((resolve, reject) => {

console.log("in call dfs")
request("https://us-central1-crawltest.cloudfunctions.net/DFS", function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
})
  });

	let message = await promise;
	return body;
}

// Process cookie
function processCookie(cookie, validatedURL, keyword) {
	var url = validatedURL.trim();
	if (keyword === null || keyword.length === 0) {
		keyword = "-";
	} else {
		keyword = keyword.trim();
	}
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
				console.log("req.cookies: ", req.cookies);
				var cookie = processCookie(req.cookies.urlHistory, validatedURL, keyword);
        res.cookie("urlHistory", cookie);
				res.cookie("keywordFoundURL", keywordFoundURL);
        res.status(201).sendFile(path.join(__dirname, 'data.json'));

      }).catch(result => {
        console.log("BFS success: ", result);
        res.status(500).send(null);
      })
    }

    // Call DFS
    else if (algorithm === "dfs") {
        console.log("in algo check")
      make_call().then(result => {
var t1 ={"edges": [{"source": 0, "target": 1}, {"source": 1, "target": 2}, {"source": 2, "target": 3}, {"source": 3, "target": 4}], "nodes": [{"favicon": "www.stackexchange.com/favicon.ico", "title": "\r\n    Hot Questions - Stack Exchange\r\n", "url": "https://www.stackexchange.com", "domainName": "stackexchange"}, {"favicon": "academia.stackexchange.com/favicon.ico", "title": "Academia Stack Exchange", "url": "https://academia.stackexchange.com", "domainName": "stackexchange"}, {"favicon": "writing.stackexchange.com/favicon.ico", "title": "naming - What should the omniscient narrator call a character? - Writing Stack Exchange", "url": "https://writing.stackexchange.com/questions/43056/what-should-the-omniscient-narrator-call-a-character", "domainName": "stackexchange"}, {"favicon": "ethereum.stackexchange.com/favicon.ico", "title": "Ethereum Stack Exchange", "url": "https://ethereum.stackexchange.com", "domainName": "stackexchange"}, {"favicon": "writing.stackexchange.com/favicon.ico", "title": "creative writing - Sometimes a banana is just a banana - Writing Stack Exchange", "url": "https://writing.stackexchange.com/questions/42938/sometimes-a-banana-is-just-a-banana", "domainName": "stackexchange"}]}
var t2 = {"nodes": [{"domainName": "www.thechive.com", "url": "http://www.thechive.com", "title": "theCHIVE - Funny Pictures, Photos, Memes & Videos \u2013 theCHIVE.com", "favicon": "http://www.thechive.com/favicon.ico"}, {"domainName": "play.google.com", "url": "https://play.google.com/store/apps/details?id=com.thechive&hl=e", "title": "theCHIVE - Apps on Google Play", "favicon": "https://play.google.com/store/apps/details?id=com.thechive&hl=e/favicon.ico"}, {"domainName": "www.google.com", "url": "https://www.google.com/webhp?tab=8w", "title": "Google", "favicon": "https://www.google.com/webhp?tab=8w/favicon.ico"}], "edges": [{"source": 0, "target": 1}, {"source": 1, "target": 2}]}
          //console.log (t1)
          //console.log(Object.keys(result))
          //r2 = JSON.stringify(result)


          //console.log("DFS success: ", result);
				console.log("req.cookies: ", req.cookies);
				var cookie = processCookie(req.cookies.urlHistory, validatedURL, keyword);
	      res.cookie("urlHistory", cookie);
				res.cookie("keywordFoundURL", keywordFoundURL);



	      res.status(201).send(result);

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
