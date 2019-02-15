const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const bodyParser = require('body-parser');

app.use(bodyParser.json());


//original iteration, only prints to console, this needs to be turned into a callback or promise
function crawl_web(url) {
    console.log(url)

    var spawn = require('child_process').spawn,
        py    = spawn('python3', ['dfs.py']),
        data = url,
        dataString = '';
    // this build up the variable as it comes in to stdout    
    py.stdout.on('data', function(data){
        dataString += data.toString();
    });

    //this piece give instruction on what to do after it is complete
    // instead of console .log this should return the value
    py.stdout.on('end', function(){
        
        //make this do something else
        console.log('result=',dataString)
    
    
    ;});

    //here is where the data is written to std in to actually call the python function
    py.stdin.write(data);
    py.stdin.end();
}

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});



app.post('/',function(req, res){
    console.log("beginning web crawl")
    crawl_web(req.body.url)

     res.sendFile(path.join(__dirname+'/index.html'));

});


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
// [END app]

module.exports = app;

console.log('Running at Port 3000');
