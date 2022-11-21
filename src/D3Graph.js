import React, { Component } from "react";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { select } from "d3-selection";
// import DagreGraph from "dagre-d3-react";

import DagreD3Component from "./DagreD3.js";
// import DagreD3 from "react-dagre-d3";
import DagreGraph from "dagre-d3-react";
import { useStore } from "./store";

var gl = require("@dagrejs/graphlib");
var dagre = require("dagre");

export const D3Graph = () => {
  const { state, dispatch } = useStore();
  const [localGraph, setLocalGraph] = React.useState(null);
  const [readyToRender, setReadyToRender] = React.useState(false);

  function createGraph() {
    console.log(state.graph);
    var g = state.graph;
    var nodes = {};
    var edges = [];
    var graphNodes = g.nodes();
    graphNodes.forEach((node) => {
      console.log(g.node(node));
      nodes[node] = { label: g.node(node).label };
    });
    var graphEdges = g.edges();
    graphEdges.forEach((edge) => {
      edges.push([edge.v, edge.w, {}]);
    });
    console.log("nodes", nodes);
    console.log("edges", edges);
    setLocalGraph({ nodes: nodes, edges: edges });
    setReadyToRender(true);
  }

  if (readyToRender) {
    return (
      <>
        <button onClick={() => createGraph()}>graph</button>
        <DagreD3Component nodes={localGraph.nodes} edges={localGraph.edges} />
      </>
    );
  } else {
    return <button onClick={() => createGraph()}>graph</button>;
  }
};
