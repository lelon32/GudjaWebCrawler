import { Component, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-crawler',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './crawler.component.html',
  styleUrls: ['./crawler.component.css']
})

export class CrawlerComponent {

  ngAfterContentInit() {
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

    var tooltip = d3.select("#crawlerContainer").append("div")
      .attr("class", "tooltip");

    var dataSize = 20, edgesToNodes = 1.3;
    var dataset = generateData(dataSize, edgesToNodes);

    // Simulation 
    var linkDist = 40, chargeStrength = -170;
    var chargeForce = d3.forceManyBody().strength(chargeStrength);
    var linkForce = d3.forceLink().id(function(d) { return d.index; }).distance(linkDist);

    var simulation = d3.forceSimulation()
        .force("charge", chargeForce)
        .force("link", linkForce)
        .force("x", d3.forceX(width / 2))
        .force("y", d3.forceY(height / 2))
        .on("tick", ticked);

    var linkElems = svg.selectAll(".link"),
        nodeElems = svg.selectAll(".node");

    // d3.json("./graph.json", function(error, graph) {
    //   if (error) throw error;

      simulation.nodes(dataset.nodes);
      simulation.force("link").links(dataset.edges);

      linkElems = linkElems
        .data(dataset.edges)
        .enter().append("line")
          .attr("class", "link");

      nodeElems = nodeElems
        .data(dataset.nodes)
        .enter().append("circle")
          .attr("class", "node")
          .attr("r", 6)
          .style("fill", function(d) { return d.color; });
    // });


    function ticked() {
      linkElems.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      nodeElems.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
          .on('mouseover', mouseoverHandler)
          .on('mouseout', mouseoutHandler)
          .on('mousemove', mousemoveHandler);
    }

    function mouseoverHandler(d) {
      tooltip.transition().duration(250).style('opacity', 0.9);
      tooltip.html('<p>' + d["color"] + '</p>');
    }

    function mouseoutHandler(d) {
      tooltip.style('opacity', 0);
    }

    function mousemoveHandler(d) {
      tooltip.style("top", (d3.event.pageY-10)+"px")
        .style("left",(d3.event.pageX+10)+"px");
    }

    function generateData(dataSize, edgesToNodes) {
      var numNodes = dataSize;
      var numEdges = dataSize * edgesToNodes;

      var dataset = {
        nodes: [],
        edges: []
      };

      // Generate nodes
      var i;
      for (i = 0; i < numNodes; i++) {
        var color = getRandomColor();
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

    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

  }
}
