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

function buildCrawler(realData) {
  // d3
  // Container and svg params
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
    containerWidth = 960,
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
    .attr("id", "tooltip_id");

  // Dataset
  var dataSize = 20, edgesToNodes = 1.3;
  var dataset_test = generateData(dataSize, edgesToNodes);
  var dataset = dataset_test;
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

  // Set bind link and node elements with data
  linkElems = linkElems
    .data(dataset.edges)
    .enter().append("line")
      .attr("class", "link");

  nodeElems = nodeElems
    .data(dataset.nodes)
    .enter().append("circle")
      .style("fill", (d) => randColor())
      .attr("class", "node")
      .attr("r", 7);
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
  var tooltip = d3.select("#tooltip_id");
  tooltip.html('<p>' + d.url + '</p>');
  tooltip.transition().duration(250).style('opacity', 1);
}

function mouseoutHandler(d) {
  var tooltip = d3.select("#tooltip_id");
  tooltip.style('opacity', 0);
}

function mousemoveHandler(d) {
  var tooltip = d3.select("#tooltip_id");
  tooltip.style("top", (d3.event.pageY - 10) + "px")
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
