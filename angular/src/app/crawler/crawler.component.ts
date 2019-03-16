import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';

import { CrawlerData } from './crawlerdata.model';
import { CrawlerService } from './crawlerdata.service';
import { PostsService } from '../posts/posts.service';

var keywordFoundURL = "";
var transX = 0, transY = 0;

@Component({
  selector: 'app-crawler',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './crawler.component.html',
  styleUrls: ['./crawler.component.css'],
})

export class CrawlerComponent implements OnInit, OnDestroy {
  realData: CrawlerData = null;
  public error = null;
  private crawlerDataSub: Subscription;
  private postsErrorSub: Subscription;
  private postsUpdateSub: Subscription;


  constructor(public crawlerService: CrawlerService,
    public postsService: PostsService) {  }

  ngOnInit() {
    this.realData = this.crawlerService.getCrawlerData();
    console.log('\'realData\' should be empty to start: ', this.realData);
    buildCrawler(this.realData);

    var errorContainer = d3.select("#errorMsg");
    var svg = d3.select("#svgData");
    var spinner = d3.select("mat-progress-spinner");

    // Start spinner once post submitted
    this.postsUpdateSub = this.postsService.getPostUpdateListener()
      .subscribe(() => {
        svg.attr("class", "hidden");
        errorContainer.attr("class", "hidden");
        spinner.attr("class", "visible mat-progress-spinner mat-primary mat-progress-spinner-indeterminate-animation");
      });

    // Subscribe to error updates
    this.postsErrorSub = this.postsService.getErrorUpdateListener()
      .subscribe((error) => {
        svg.attr("class", "hidden");
        spinner.attr("class", "hidden");

        // Dispaly error message in container
        var stuff = "<p>Error: " + error + "</p>";
        errorContainer.html(stuff)
          .attr("class", "visible");
      });

    // // TEST DATASET
    // var dataSize = 20, edgesToNodes = 1.3;
    // var dataset_test = generateData(dataSize, edgesToNodes);
    // renderD3data(dataset_test, keywordFoundURL);

    // Subscribe to crawler updates
    this.crawlerDataSub = this.crawlerService.getCrawlerUpdateListener()
      .subscribe((data: CrawlerData) => {
        this.realData = data;
        keywordFoundURL = this.crawlerService.getKeywordFoundURL();
        console.log("keywordFoundURL crawler component: ", keywordFoundURL);
        renderD3data(this.realData, keywordFoundURL);
        console.log("\'realData\' updated when form submitted: ", data);
      });
  }

  ngOnDestroy() {
    this.crawlerDataSub.unsubscribe();
    this.postsUpdateSub.unsubscribe();
  }
}

/****************** D3 ********************/
function buildCrawler(realData) {

  // Container and svg params
  var container = d3.select("#crawlerContainer"),
    width = window.innerWidth,
    height = window.innerWidth / 2;

  var svg = d3.select("#svgData")
    .attr("width", width)
    .attr("height", height);

  // Holds simuation nodes, edges, and highlight
  var g = svg.append("g");

  // Append error container
  container.append("div")
    .attr("id", "errorMsg")
    .attr("class", "hidden");

  // Tooltip element
  var tooltip = container.append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltipID");

  // Highlight element for website where keyword was found
  var rGradient = svg.append("radialGradient")
    .attr("id","rGradient");

  rGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "white");

  rGradient.append("stop")
    .attr("offset", "70%")
    .attr("stop-color", "#67CEFA");

  rGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#efefef");

  var highlight = g.append("circle")
    .attr("class", "hidden")
    .attr("id", "highlight")
    .attr("fill","url(#rGradient)")
    .attr("r", "23");

  // Add arrowhead def
  var defs = svg.append('defs');

  var marker = defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('orient', 'auto')
    .attr('refX', 16)
    .attr('refY', 3)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('xoverflow', 'visible');

  var arrow = marker.append('svg:path')
    .attr('d', 'M 0,0  L 10,3  L 0,6  L 2,3')
    .attr('fill', 'black');
}

function renderD3data(dataset, keywordFoundURL) {
  // Set relative node size array using total links per node
  var nodeSize = new Array(dataset.nodes.length);
  nodeSize.fill(0, 0, dataset.nodes.length);

  var i;
  for (i = 0; i < dataset.edges.length; i++) {
    nodeSize[dataset.edges[i].source]++;
    nodeSize[dataset.edges[i].target]++;
  }
  // console.log("nodeSize(): ", nodeSize);

  // Get elements from DOM
  var svg = d3.select("#svgData"),
    g = d3.select("g"),
    spinner = d3.select("mat-progress-spinner"),
    linkElems = g.selectAll(".link"),
    nodeElems = g.selectAll(".node");

  // Hide spinner and show #svgData
  spinner.attr("class", "hidden");
  svg.attr("class", "visible");

  // Simulation params
  var linkDist = 50, chargeStrength = -170;
  var chargeForce = d3.forceManyBody().strength((d) => chargeStrength * ( 1 + nodeSize[d.index] / 4));
  var linkForce = d3.forceLink().id((d) => d.index).distance(linkDist);

  // Simulation
  // console.log("crawler width: ", parseInt(d3.select("#crawlerContainer").style("width")));
  var width = parseInt(svg.attr("width")) / 2;
  var height = parseInt(svg.attr("height")) / 2;
  var simulation = d3.forceSimulation()
      .force("x", d3.forceX().strength(0.12))
      .force("y", d3.forceY().strength(0.12))
      .force("link", linkForce)
      .force("charge", chargeForce)
      .on("tick", onTick);

  simulation.nodes(dataset.nodes);
  simulation.force("link").links(dataset.edges);

  // Update links elements, append new ones, remove unbound linkElems
  linkElems = linkElems.data(dataset.edges);
  linkElems.enter().append("line")
      .attr("class", "link")
      .attr('marker-end','url(#arrow)');
  linkElems.exit().remove();

  // Remove and append all nodeElems to render above new links
  nodeElems.remove();
  nodeElems = g.selectAll(".node");
  nodeElems = nodeElems.data(dataset.nodes);
  nodeElems.enter().append("circle")
      .style("fill", (d) => hashColor(d.domainName))
      .attr("class", "node")
      .attr("r", (d) => 6.5 + nodeSize[d.index] / 3)
      .on("click", (d) => window.open(d.url));
  nodeElems.exit().remove();

  // Show the highlight if keywordFoundURL
  if (keywordFoundURL.length > 0) {
    d3.select("#highlight")
      .attr('class', 'visible');
  } else {
    d3.select("#highlight")
      .attr('class', 'hidden');
  }
}

function onTick() {
  var svg = d3.select("#svgData"),
    g = d3.select("g"),
    linkElems = svg.selectAll(".link"),
    nodeElems = svg.selectAll(".node");

  // Update link positions
  linkElems.attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

  // Update node positions
  nodeElems.attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .on('mousemove', mousemoveHandler)
      .on('mouseover', mouseoverHandler)
      .on('mouseout', mouseoutHandler);

  // Assign r, cx and cy of last node element to highlight
  var lastNode = d3.select(".node:last-child");
  var radius = parseInt(lastNode.attr("r")) + 16;
  var highlightX = lastNode.attr("cx"),
    highlightY = lastNode.attr("cy");

  // Update highlight position and radius
  var highlight = d3.select("#highlight")
    .attr('cx', highlightX)
    .attr('cy', highlightY)
    .attr('r', radius)
    .node().animate(
      [{r: radius, opacity: 0.65}, {r: radius + 2, opacity: 1}, {r: radius, opacity: 0.65}],
      {
        duration: 4500,
        delay: 0,
        iterations: Infinity,
        easing: 'linear'
      }
    );

  // Adjust the g element translation and svg size to fit g element
  adjustSize();
}

function adjustSize() {
  var svg = d3.select("#svgData"),
    g = d3.select("g"),
    svgBBox = svg.node().getBBox(),
    gBBox = g.node().getBBox();

  // console.log("gBBox: ", gBBox);
  // console.log("g getBoundingClientRect(): ", g.node().getBoundingClientRect());
  // console.log("svg BBox: ", svgBBox);
  // console.log("svg etBoundingClientRect(): ", svg.node().getBoundingClientRect());

  /* Adjust svg width and height to match gBBox (or BCR works too)
    Translate g the amount of svgBBox which represents how much the local
    elements (g) are outside the boundary of the svg. */
  var margin = 100;
  svg.attr("width", gBBox.width + margin);
  svg.attr("height", gBBox.height + margin);
  transX += -svgBBox.x + margin / 2;
  transY += -svgBBox.y + margin / 2;

  g.attr("transform", "translate(" + transX + "," + transY + ")");
}

function mouseoverHandler(d) {

  // var stuff = '<img id="extFavicon" onload="this.width=\'32px\'; this.height=\'32px\';" onerror="this.style.display=\'none\';" src=' + d.favicon + '>'
  //   + '<p>' + d.title + '</p>'
  //   + '<p>' + d.url + '</p>';
  var stuff = '<p>' + d.title + '</p>'
    + '<p>' + d.url + '</p>';

  if (d.url === keywordFoundURL) {
    stuff = '<strong>Keyword Found Here!</strong><br>' + stuff;
  }

  var tooltip = d3.select("#tooltipID")
    .html(stuff)
    .style("padding", "15px")
    .style("border-radius", "4px")
    .style('display', 'block')
    .transition().duration(50).style('opacity', 1);

    // if (d3.select("#extFavicon").style("display") !== "none") {
    //   d3.select("#extFavicon")
    //     .attr("width", "32px")
    //     .attr("height", "32px");
    // } else {
    //   d3.select("#extFavicon")
    //     .attr("width", "0px")
    //     .attr("height", "0px");
    // }
}

function mouseoutHandler(d) {
  var tooltip = d3.select("#tooltipID")
    .transition().duration(50).style('opacity', 0)
    .style("padding", "0px")
    .style('display', 'none');

  // d3.select("#extFavicon")
  //   .attr("width", "0px")
  //   .attr("height", "0px");
}

function mousemoveHandler(d) {
  var tooltip = d3.select("#tooltipID")
    .style("top", (d3.event.pageY - 10) + "px")
    .style("left",(d3.event.pageX + 10) + "px");
}

function generateData(dataSize, edgesToNodes) {
  var numNodes = dataSize;
  var numEdges = dataSize * edgesToNodes;
  var i;
  var dataset = {
    nodes: [],
    edges: []
  };

  // Generate nodes
  for (i = 0; i < numNodes; i++) {
    var color = randColor();
    var node = {
      color: color,
      domainName: 'cnn'
    };
    dataset.nodes.push(node);
  }

  // Generate edges
  for (i = 0; i < numEdges; i++) {
    var edge = {
      source: Math.floor(Math.random() * numNodes),
      target: Math.floor(Math.random() * numNodes)
    };
    dataset.edges.push(edge);
  }

  return dataset;
}

function randColor() {
  var color = '#', values = '0123456789ABCDEF';
  for (var i = 0; i < 6; i++) {
    var index = Math.floor(Math.random() * 16);
    color += values[index];
  }
  return color;
}

function hashColor(domainName) {
  var sum = 0;
  for (var i=0; i < domainName.length; i++) {
    var char = domainName.charAt(i);
    var num = char.charCodeAt(0) - 97;
    sum += num;
  }
  var red = rgbToHex(255 - (sum % 3) * 85);
  var green = rgbToHex(255 - (sum % 5) * 51);
  var blue = rgbToHex(255 - (sum % 7) * 36);

  var color = "#" + red + green + blue;

  return (color);
}

function rgbToHex(num) {
  var hex = num.toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};
