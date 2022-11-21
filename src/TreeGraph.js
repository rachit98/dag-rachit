import React, { useState } from "react";
import Tree from "react-tree-graph";
import { useStore } from "./store";
import {
  IconButton,
  Checkbox,
  FormControlLabel,
  Button
} from "@material-ui/core";

export const TreeGraph = () => {
  const { state, dispatch } = useStore();
  var graphData = {
    name: "Top Level",
    attributes: {
      keyA: "val A",
      keyB: "val B",
      keyC: "val C"
    },
    children: []
  };

  // function showHistory() {
  //   console.log("history", state.history);
  //   var instructions = [];
  //   var nodes = [];
  //   var links = [];
  //   for (var i = 0; i < Object.keys(state.pieceGroups).length; i++) {
  //     var pgId = Object.keys(state.pieceGroups)[i];
  //   }
  //   for (var i = 0; i < state.history.length; i++) {
  //     var parents = state.history[i].parents;
  //     var children = state.history[i].children;
  //     var action = state.history[i].action;
  //     var svgImg =
  //       "http://marvel-force-chart.surge.sh/marvel_force_chart_img/marvel.png";
  //     if (state.history[i]["stageAfter"]) {
  //       svgImg = state.history[i].stageAfter;
  //     }
  //     var existingNodes = [];
  //     parents.forEach((parent, j) => {
  //       if (parent) {
  //         if (existingNodes.indexOf(parent.toString()) < 0) {
  //           nodes.push({
  //             id: parent.toString(),
  //             name: "PieceGroup" + parent.toString(),
  //             svg: svgImg
  //           });
  //           existingNodes.push(parent.toString());
  //         }
  //         children.forEach((child, k) => {
  //           if (parent.toString() != child.toString()) {
  //             if (existingNodes.indexOf(child.toString()) < 0) {
  //               nodes.push({
  //                 id: child.toString(),
  //                 name: "PieceGroup" + child.toString(),
  //                 svg: svgImg
  //               });
  //               existingNodes.push(child.toString());
  //             }
  //             links.push({
  //               source: parent.toString(),
  //               target: child.toString(),
  //               label: action
  //             });
  //           }
  //         });
  //       }
  //     });
  //   }
  //   var data = { links: links, nodes: nodes };
  //   console.log("graph data", data);
  //   setGraphData(data);
  // }

  function generateTreeData() {
    var data = {
      name: "Parent",
      children: []
    };
    var current = data.children;
    for (var i = 0; i < state.history.length; i++) {
      var parents = state.history[i].parents;
      var children = state.history[i].children;
      var action = state.history[i].action;
      parents.forEach((parent) => {
        var x = { name: parent, children: [] };
        children.forEach((child) => {
          x.children.push({ name: child, children: [] });
        });
        current.push(x);
      });
      current = current.children;
    }
    console.log(data);
  }
  let data = {
    name: "Parent",
    children: [
      {
        name: "Child One"
      },
      {
        name: "Child Two"
      }
    ]
  };

  return (
    <div id="treeWrapper" style={{ width: "50em", height: "20em" }}>
      <Button onClick={() => generateTreeData()}>show history</Button>
      <Tree data={data} height={400} width={400} />
      );
    </div>
  );
};
