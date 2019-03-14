# Graphical Web Crawler

This project allows a user to enter a starting point for the program and visually see a web crawling
program in action. The simulation will give the end user basic insight on how a web crawler, such as a
Googlebot, might visit pages on the Surface Web in a real life scenario. The user will ultimately view a
high level map of all the pages that were visited by the web crawler, in an organized, coherent way. 


## Getting Started
This program was developed using Angular and the D3 Javascript library on the front end, Node.js on the back end and Python for crawling the web. This application has been optimized for use on the Google Cloud Platform. Alternatively, any application that can read from a data.json file can simply use the Python code to crawl the web.

### Requirements
- [Angular.js](https://angular.io/)
 
- [Node.js](https://nodejs.org/)
  - Express
  - Body-Parser
  - CORS
  - D3
  - Path
- [Python 3.5](https://www.python.org/)
  - Beautiful Soup 4
  - lxml
  - numpy

## Usage

### Full Deployment
1. Enter a starting URL for the web crawler to start.
2. Choose the depth of the crawl.
3. Choose either Breadth First Search or Depth First Search.
4. Click Crawl!
5. Look at the visualization, hover over nodes for URL tooltip
6. Repeat steps 1 - 5 (currently showing the static data)

### Crawler Only
**Testing Python**

The crawler.py contains the main driving code that runs the separate search algorithms. To run either
search, you will need to install the Beautiful Soup library and the lxml library such as:
```shell
$pip install beautifulsoup
$pip install python3-lxml
```

**Testing Breadth First Search**

The front end website has not been fully integrated with Python spider bot code.
bfs.py will output the file data.json which represents the nodes and edges in the URL visited graph.
Use the following command on terminal to run the bfs.py code and generate the data.json file.
```shell
$ python3 bfs.py [URL] [Depth of Search] [Optional Keyword]
```
For example:
```shell
$ python3 bfs.py wikipedia.com 4 spider
```
**Testing Depth First Search**

Like the BFS, the depth first search is not integrated into the website but can still be tested from the
command line. With all the aforementioned libraries installed, one can type the following commands to
check its functionality: 
```shell 
$ python3 dfs.py [Full URL] [Depth of Search]
``` 
For example:
```shell
$ python3 dfs.py http://www.gizmodo.com 4
```
Alternatively, one can enter ```$ python3 dfs.py``` and it will randomly select from a list of websites and
attempt to crawl them to a depth of five.

**Sample data.json Output**
```json
{
    "nodes": [{
        "url": "https://www.google.com/",
        "domainName": "google",
        "title": "Google",
        "favicon": "https://www.google.com/s2/favicons?domain=www.google.com"
    }, {
        "url": "https://www.wikipedia.org/",
        "domainName": "wikipedia",
        "title": "wikipedia",
        "favicon": "https://en.wikipedia.org/favicon.ico"
    }, {
        "url": "https://twitter.com/",
        "domainName": "twitter",
        "title": "Twitter",
        "favicon": "https://twitter.com/"
    }],
    "edges": [{
        "source": 0,
        "target": 1
    }, {
        "source": 2,
        "target": 0
    }]
}
```
### Authors ###
**CS 467 Capstone: Team Gudja**

<a href="https://github.com/freeman-bw">
  <img src="https://avatars2.githubusercontent.com/u/29698652?s=96&v=4" alt="Brent Freeman" width="50" height="50">
 Brent Freeman </a>
<br/>
<a href="https://github.com/lelon32">
  <img src="https://avatars1.githubusercontent.com/u/26614507?v=4" alt="Long Le" width="50" height="50">
 Long Le </a>
 <br/>
<a href="https://github.com/cadelx">
  <img src="https://avatars.githubusercontent.com/cadelx" alt="Kerensa Crump" width="50" height="50">
 Kerensa Crump </a>
