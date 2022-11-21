import React, { useState } from "react";
import { useStore } from "./store";
import { Stage, Layer, Path, Group } from "react-konva";
import { Checkbox, FormControlLabel, Button } from "@material-ui/core";
import { Graph } from "react-d3-graph";
// the graph configuration, you only need to pass down properties
// that you want to override, otherwise default ones will be used
const myConfig = {
  automaticRearrangeAfterDropNode: false,
  collapsible: false,
  directed: true,
  height: 800,
  highlightDegree: 1,
  highlightOpacity: 0.2,
  linkHighlightBehavior: true,
  maxZoom: 8,
  minZoom: 0.1,
  nodeHighlightBehavior: false,
  panAndZoom: false,
  staticGraph: false,
  width: 200,
  node: {
    color: "#d3d3d3",
    fontColor: "black",
    fontSize: 12,
    fontWeight: "normal",
    highlightColor: "red",
    highlightFontSize: 12,
    highlightFontWeight: "bold",
    highlightStrokeColor: "SAME",
    highlightStrokeWidth: 1.5,
    labelProperty: "name",
    mouseCursor: "pointer",
    opacity: 1,
    renderLabel: true,
    size: 1000,
    strokeColor: "none",
    strokeWidth: 1.5,
    svg: "",
    symbolType: "circle"
  },
  link: {
    color: "#d3d3d3",
    fontColor: "red",
    fontSize: 10,
    highlightColor: "blue",
    highlightFontWeight: "bold",
    opacity: 1,
    renderLabel: true,
    semanticStrokeWidth: false,
    strokeWidth: 4
  },
  d3: {
    gravity: -400,
    linkLength: 300
  }
};

export const History = () => {
  const { state, dispatch } = useStore();
  const [graphData, setGraphData] = useState({});

  function commitStep(e, command) {
    dispatch({
      type: "commitStep",
      message: "commitStep",
      commandId: command
    });
  }
  function showHistory() {
    console.log("history", state.history);
    var instructions = [];
    var nodes = [];
    var links = [];
    for (var i = 0; i < Object.keys(state.pieceGroups).length; i++) {
      var pgId = Object.keys(state.pieceGroups)[i];
    }
    for (var i = 0; i < state.history.length; i++) {
      var parents = state.history[i].parents;
      var children = state.history[i].children;
      var action = state.history[i].action;
      var svgImg =
        "http://marvel-force-chart.surge.sh/marvel_force_chart_img/marvel.png";
      if (state.history[i]["stageAfter"]) {
        svgImg = state.history[i].stageAfter;
      }
      var existingNodes = [];
      parents.forEach((parent, j) => {
        if (parent) {
          if (existingNodes.indexOf(parent.toString()) < 0) {
            nodes.push({
              id: parent.toString(),
              name: "PieceGroup" + parent.toString(),
              svg: svgImg
            });
            existingNodes.push(parent.toString());
          }
          children.forEach((child, k) => {
            if (parent.toString() != child.toString()) {
              if (existingNodes.indexOf(child.toString()) < 0) {
                nodes.push({
                  id: child.toString(),
                  name: "PieceGroup" + child.toString(),
                  svg: svgImg
                });
                existingNodes.push(child.toString());
              }
              links.push({
                source: parent.toString(),
                target: child.toString(),
                label: action
              });
            }
          });
        }
      });
    }
    var data = { links: links, nodes: nodes };
    console.log("graph data", data);
    setGraphData(data);
  }

  // graph payload (with minimalist structure)
  const data = {
    links: [
      {
        source: 1,
        target: 2,
        label: "link 1 and 2"
      },
      {
        source: 1,
        target: 3
      },
      {
        source: 1,
        target: 4
      },
      {
        source: 3,
        target: 4
      }
    ],
    nodes: [
      {
        id: 1,
        name: "Node 1"
      },
      {
        id: 2,
        name: "Node 2"
      },
      {
        id: 3,
        name: "Node 3"
      },
      {
        id: 4,
        name: "Node 4"
      }
    ]
  };

  return (
    <div className="HistoryBar">
      <>
        {/* <Button onClick={() => showHistory()}>show history</Button> */}
        <h1> History </h1>
        {Object.keys(state.commandHistory).map((command, i) => {
          const storedPieceGroups =
            state.commandHistory[command].storedPieceGroups;
          console.log(
            "stored state groups",
            storedPieceGroups,
            state.commandHistory[command].command
          );
          return (
            <div key={"frag-" + i}>
              <h2> {state.commandHistory[command].command} </h2>
              <Stage key={"historyStage-" + i} width={200} height={200}>
                <Layer>
                  {Object.keys(storedPieceGroups).map((keyName, i) => {
                    return (
                      <Group
                        name={"storedImprovGroup"}
                        id={"stored-" + keyName + "-" + i}
                        key={"stored-" + keyName + "-" + i}
                        x={storedPieceGroups[keyName].x}
                        y={storedPieceGroups[keyName].y}
                      >
                        {Object.keys(storedPieceGroups[keyName].pieceData).map(
                          (pieceName, j) => (
                            <Path
                              name={"storedimprovShape"}
                              id={"storedpiece-" + keyName + "-" + pieceName}
                              key={"storedpiece-" + keyName + "-" + pieceName}
                              x={
                                storedPieceGroups[keyName].pieceData[pieceName]
                                  .x
                              }
                              y={
                                storedPieceGroups[keyName].pieceData[pieceName]
                                  .y
                              }
                              data={
                                storedPieceGroups[keyName].pieceData[pieceName]
                                  .svg
                              }
                              fill={
                                storedPieceGroups[keyName].pieceData[pieceName]
                                  .color
                              }
                              opacity={
                                storedPieceGroups[keyName].isReal ? 0.9 : 0.5
                              }
                              visible={
                                storedPieceGroups[keyName].onDesignWall
                                  ? true
                                  : false
                              }
                            />
                          )
                        )}
                      </Group>
                    );
                  })}
                </Layer>
              </Stage>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={false}
                    onChange={(e) => commitStep(e, command)}
                    inputProps={{ "aria-label": "primary checkbox" }}
                  />
                }
                label="done"
              />
            </div>
          );
        })}
      </>
      {Object.keys(graphData).length > 0 && (
        <Graph
          id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
          data={graphData}
          config={myConfig}
        />
      )}
    </div>
  );
};
