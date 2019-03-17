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
call_bfs
Asynchronous function to pass in crawl specifications to the
Cloud Based BFS function, wait for the response and send the return object
back to the app.post route.
*********************************************************************/
async function call_bfs(url, depth, keyword) {
	let promise = new Promise((resolve, reject) => {

    var searchword = keyword;

    if (keyword !== null) {
        if (keyword.length == 0) {
            searchword = null;
        }
    }

    var JSONData = {"url":url,"depth": depth, "keyword": keyword}

    var options = {
        method: "POST",
        uri: "https://us-central1-angelic-coder-229401.cloudfunctions.net/BFS",
    	json: JSONData
    };

		rp(options).then( (results) => {
      console.log("BFS cloud results: ", results);
			resolve(results);
    }).catch(results => {
			console.log("BFS cloud error: ", results);
			reject(results);
		});

	});

		let results = await promise;
		return results;
}

/*********************************************************************
call_dfs
Asynchronous function to pass in crawl specifications to the
Cloud Based DFS function, wait for the response and send the return object
back to the app.post route.
*********************************************************************/
async function call_dfs(url, depth, keyword) {
	let promise = new Promise((resolve, reject) => {

    var searchword = keyword;

    if (keyword !== null) {
        if (keyword.length == 0) {
            searchword = null;
        }
    }

    var JSONData = {"url":url,"depth": depth, "keyword": searchword}
    var options = {
        method: "POST",
        uri: "https://us-central1-crawltest.cloudfunctions.net/DFS ",
    		json: JSONData
    };

		rp(options).then(results => {
			console.log("DFS cloud results: ", results);
			resolve(results);
    }).catch(results => {
			console.log("DFS cloud error: ", results);
			reject(results);
		});

	});

		let results = await promise;
		return results;
}

/*********************************************************************
	ProcessCookie
	adds data to be stored by the cookie
*********************************************************************/
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

	//console.log("cookie: ", cookie);
	return cookie;
}

/*********************************************************************
	Controller
*********************************************************************/
// GET request sends data.json
app.get("/data", (req, res, next) => {
	res.sendFile(path.join(__dirname, 'data.json'));
})

/*********************************************************************
Post Route to handle information submitted by the front end, to send
requests to the appropriate algorithm, parses the return values for the cookies,
and the history, and then passes the returned nodes and edges to the front end
for display
*********************************************************************/
// POST request for data calls python script, response back data.json
app.post("/data", (req, res, next) => {
	req.setTimeout(0);

	var url = req.body.url,
		depth = req.body.depth,
		algorithm = req.body.algorithm,
		keyword = req.body.keyword;

  console.log("keyword data:")
  if(keyword === null) {console.log("its null")}
  if(keyword){console.log(keyword.length)}

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
      call_bfs(validatedURL, depth, keyword).then(result => {

				var cookie = req.cookies.urlHistory;
        console.log("req.cookies: ", req.cookies);
				if (result != null && result.nodes != null && result.nodes.length > 0) {
					cookie = processCookie(req.cookies.urlHistory, validatedURL, keyword);
				}

        if (result.search != null) {
          keywordFoundURL = result.search
				} else {
					keywordFoundURL = ""
				}

        res.cookie("urlHistory", cookie);
				res.cookie("keywordFoundURL", keywordFoundURL);
        res.status(201).send(result);

      }).catch(result => {
        console.log("BFS success: ", result);
        res.status(500).send(null);
      })
    }

    // Call DFS
    else if (algorithm === "dfs") {
      call_dfs(validatedURL, depth, keyword).then(result => {

				var cookie = req.cookies.urlHistory;
        console.log("req.cookies: ", req.cookies);
				if (result != null && result.nodes != null && result.nodes.length > 0) {
					cookie = processCookie(req.cookies.urlHistory, validatedURL, keyword);
				}
        //console.log("here is the search url: ", Object.keys(result))

        if(result.search != null) {
		    keywordFoundURL = result.search
				}

	    res.cookie("urlHistory", cookie);
		res.cookie("keywordFoundURL", keywordFoundURL);
	    res.status(201).send(result);

      }).catch(result => {
        //console.log("DFS success: ", result);
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
