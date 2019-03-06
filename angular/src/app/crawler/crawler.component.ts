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

var keywordFoundURL = "";

@Component({
  selector: 'app-crawler',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './crawler.component.html',
  styleUrls: ['./crawler.component.css'],
})

export class CrawlerComponent implements OnInit, OnDestroy {
  realData: CrawlerData = null;
  private crawlerDataSub: Subscription;


  constructor(public crawlerService: CrawlerService) {  }

  ngOnInit() {
    this.realData = this.crawlerService.getCrawlerData();
    console.log('\'realData\' should be empty to start: ', this.realData);
    buildCrawler(this.realData);


    // // TEST DATASET
    // var dataSize = 20, edgesToNodes = 1.3;
    // var dataset_test = generateData(dataSize, edgesToNodes);
    // renderD3data(dataset_test, keywordFoundURL);

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
    console.log('OnDestroy');
    this.crawlerDataSub.unsubscribe();
  }
}

/****************** D3 ********************/
function buildCrawler(realData) {
  // Container and svg params
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
    containerWidth = 1100,
    containerHeight = 500,
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

  var container = d3.select("#crawlerContainer");
    // .attr("width", containerWidth)
    // .attr("height", containerHeight);

  var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr('id', 'crawlerGroup');

  var crawlerGroup = d3.select('#crawlerGroup');

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
    .attr("offset", "60%")
    .attr("stop-color", "#67CEFA");

  rGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#efefef");

  var highlight = svg.append("circle")
    .attr("class", "hidden")
    .attr("id", "highlight")
    .attr("fill","url(#rGradient)")
    .attr("r", "23")
    .attr("cx", "300")
    .attr("cy", "300")
    .node().animate(
      [{r: 18, opacity: 0.8}, {r:23, opacity: 1}, {r: 18, opacity: 0.8}],
      {
        duration: 5000,
        delay: 0,
        iterations: Infinity,
        easing: 'linear'
      }
    );
}

function renderD3data(dataset, keywordFoundURL) {
  // Get elements from DOM
  var svg = d3.select("svg"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    crawlerGroup = d3.select("#crawlerGroup"),
    linkElems = crawlerGroup.selectAll(".link"),
    nodeElems = crawlerGroup.selectAll(".node");

  // Simulation params
  var linkDist = 40, chargeStrength = -170;
  var chargeForce = d3.forceManyBody().strength(chargeStrength);
  var linkForce = d3.forceLink().id((d) => d.index).distance(linkDist);

  // Simulation
  var simulation = d3.forceSimulation()
      .force("x", d3.forceX(width / 2))
      .force("y", d3.forceY(height / 2))
      .force("link", linkForce)
      .force("charge", chargeForce)
      .on("tick", onTick);

  simulation.nodes(dataset.nodes);
  simulation.force("link").links(dataset.edges);

  // Update links elements, append new ones, remove unbound linkElems
  linkElems = linkElems.data(dataset.edges);
  linkElems.enter().append("line")
      .attr("class", "link")
      .style("z-index", 0);
  linkElems.exit().remove();

  // Remove and append all nodeElems to render above new links
  nodeElems.remove();
  nodeElems = crawlerGroup.selectAll(".node");
  nodeElems = nodeElems.data(dataset.nodes);
  nodeElems.enter().append("circle")
      .style("fill", (d) => randColor())
      .attr("class", "node")
      .attr("r", 7)
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
  var crawlerGroup = d3.select("#crawlerGroup"),
    linkElems = crawlerGroup.selectAll(".link"),
    nodeElems = crawlerGroup.selectAll(".node");

  linkElems.attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

  nodeElems.attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .on('mousemove', mousemoveHandler)
      .on('mouseover', mouseoverHandler)
      .on('mouseout', mouseoutHandler);

  // Assign cx and cy of last node element to highlight
  var lastNode = d3.select(".node:last-child");
  var highlightX = lastNode.attr("cx"),
    highlightY = lastNode.attr("cy");

  var highlight = d3.select("#highlight")
    .attr('cx', highlightX)
    .attr('cy', highlightY);
}

function mouseoverHandler(d) {
  var stuff = '<img width="32px" height="32px" src=' + d.favicon + '>'
    + '<p>' + d.title + '</p>'
    + '<p>' + d.url + '</p>';
  if (d.url === keywordFoundURL) {
    stuff = '<p>Keyword Found Here!<p><br>' + stuff;
  }
  var tooltip = d3.select("#tooltipID")
    .html(stuff)
    .style('display', 'block')
    .transition().duration(50).style('opacity', 1);
}

function mouseoutHandler(d) {
  var tooltip = d3.select("#tooltipID")
    .transition().duration(50).style('opacity', 0)
    .style('display', 'none');
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
      color: color
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
