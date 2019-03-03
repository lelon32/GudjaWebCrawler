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

    this.crawlerDataSub = this.crawlerService.getCrawlerUpdateListener()
      .subscribe((data: CrawlerData) => {
        this.realData = data;
        renderD3data(this.realData);
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

  var container = d3.select("#crawlerContainer")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Tooltip element
  var tooltip = d3.select("#crawlerContainer").append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltipID");

  // // Test Dataset
  // var dataSize = 20, edgesToNodes = 1.3;
  // var dataset_test = generateData(dataSize, edgesToNodes);
  // var dataset = dataset_test;
}

function renderD3data(dataset) {
  // Get elements from DOM
  var svg = d3.select("svg"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    linkElems = svg.selectAll(".link"),
    nodeElems = svg.selectAll(".node");

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
  nodeElems = svg.selectAll(".node");
  nodeElems = nodeElems.data(dataset.nodes);
  nodeElems.enter().append("circle")
      .style("fill", (d) => randColor())
      .attr("class", "node")
      .attr("r", 7)
      .on("click", (d) => window.open(d.url));

  nodeElems.exit().remove();

}

function onTick() {
  var svg = d3.select("svg"),
    linkElems = svg.selectAll(".link"),
    nodeElems = svg.selectAll(".node");

  linkElems.attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

  nodeElems.attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .on('mousemove', mousemoveHandler)
      .on('mouseover', mouseoverHandler)
      .on('mouseout', mouseoutHandler);
}

function mouseoverHandler(d) {
  var tooltip = d3.select("#tooltipID")
    .html('<p>' + d.title + '</p><p>' + d.url + '</p>')
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
