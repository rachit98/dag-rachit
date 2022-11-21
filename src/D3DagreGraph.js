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

export const D3DagreGraph = () => {
  const { state, dispatch } = useStore();
  const [localGraph, setLocalGraph] = React.useState(null);
  const [readyToRender, setReadyToRender] = React.useState(false);

  function createGraph() {
    console.log(state.graph);
    var g = gl.json.read(state.graph);
    var nodes = [];
    var edges = [];
    var graphNodes = g.nodes();
    graphNodes.forEach((node, i) => {
      console.log(g.node(node));
      nodes.push({ id: node, label: g.node(node).label, labelType: "html" });
    });
    var graphEdges = g.edges();
    graphEdges.forEach((edge) => {
      console.log(g.edge(edge));
      edges.push({ source: edge.v, target: edge.w, label: g.edge(edge) });
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
        <DagreGraph
          nodes={localGraph.nodes}
          links={localGraph.edges}
          config={{
            rankdir: "LR",
            align: "UL",
            ranker: "tight-tree"
          }}
          width="500"
          height="500"
          animate={1000}
          shape="circle"
          fitBoundaries
          zoomable
          onNodeClick={(e) => console.log(e)}
          onRelationshipClick={(e) => console.log(e)}
        />{" "}
      </>
    );
  } else {
    return <button onClick={() => createGraph()}>graph</button>;
  }
};
