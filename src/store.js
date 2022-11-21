// store.js
import React, { createContext, useContext, useReducer } from "react";
import { Graph } from "@dagrejs/graphlib";
import {
  scaleBoundaryToPiece,
  boundaryToSVG,
  buildSVGNodeLabel
} from "./helpers.js";
var gl = require("@dagrejs/graphlib");
var dagre = require("dagre");
const normalize = require("normalize-svg-coords");

const StoreContext = createContext();
const initialState = {
  message: "",
  pieces: {},
  selectedPieceID: "",
  onDesignWall: {},
  fabrics: {},
  uploadedFile: "",
  pieceGroups: {},
  tool: "selecttool",
  selectedShapes: [],
  errorMessage: "",
  commandHistory: {},
  undoneCommands: [],
  fullHistory: {},
  pieceHistory: {},
  history: [],
  historyTree: {},
  historyMap: {},
  graph: {},
  treeId: 0
};

const reducer = (state, action) => {
  console.log("in reducer", action);
  switch (action.type) {
    case "reset":
      return {
        message: action.message,
        pieces: {},
        pieceGroups: {},
        selectedPieceID: "",
        fabrics: {},
        onDesignWall: {},
        tool: "selecttool",
        selectedShapes: [],
        errorMessage: "",
        commandHistory: {},
        undoneCommands: [],
        fullHistory: {},
        pieceHistory: {},
        history: [],
        historyTree: {},
        historyMap: {},
        graph: {},
        treeId: 0
      };
    case "loadSavedState":
      return action.savedState;
    case "selectTool":
      var newState = Object.assign({}, state);
      newState.tool = action.tool;
      newState.message = action.message;
      return newState;
    case "addCommand":
      var commandId = Object.keys(state.commandHistory).length;
      var fhId = Object.keys(state.fullHistory).length;
      var newCommandHistory = Object.assign({}, state.commandHistory);
      var newFullHistory = Object.assign({}, state.fullHistory);

      if (action.display) {
        newCommandHistory[commandId] = {
          command: action.command,
          storedPieceGroups: JSON.parse(JSON.stringify(state.pieceGroups)),
          affectedPieceGroups: [...state.selectedShapes]
        };
      }
      newFullHistory[fhId] = {
        command: action.command,
        storedPieceGroups: JSON.parse(JSON.stringify(state.pieceGroups)),
        affectedPieceGroups: [...state.selectedShapes]
      };
      state.commandHistory = newCommandHistory;
      state.fullHistory = newFullHistory;
      if (Object.keys(action).indexOf("stageBefore") > -1) {
        state.history[state.history.length - 1].stageBefore =
          action.stageBefore;
      }
      if (Object.keys(action).indexOf("stageAfter") > -1) {
        state.history[state.history.length - 1].stageAfter = action.stageAfter;
      }
      console.log("adding command", state.commandHistory);
      state.selectedShapes = [];
      return state;
    case "commitStep":
      var command = state.commandHistory[action.commandId];
      var pieceGroups = command.affectedPieceGroups;
      console.log(pieceGroups);
      pieceGroups.forEach((pgId, i) => {
        state.pieceGroups[pgId].isReal = true;
      });
      var newCommandHistory = {};
      for (var i = 0; i < Object.keys(state.commandHistory).length; i++) {
        var cid = Object.keys(state.commandHistory)[i];
        if (cid != action.commandId) {
          newCommandHistory[cid] = state.commandHistory[cid];
        }
      }
      state.commandHistory = newCommandHistory;
      console.log("in commit", newCommandHistory, state);
      var newState = JSON.parse(JSON.stringify(state));
      return newState;
    case "displayError":
      state.message = action.message;
      state.errorMessage = action.errorMessage;
      return state;
    case "deletePieceGroups":
      state.message = action.message;
      action.whichPieceGroups.forEach((pgId, i) => {
        state.selectedShapes = state.selectedShapes.filter((e) => e !== pgId);
        delete state.pieceGroups[pgId];
      });
      return state;
    case "selectShapes":
      var newState = Object.assign({}, state);
      newState.selectedShapes = action.selectedShapes;
      newState.message = action.message;
      return newState;
    case "duplicatePieces":
      var newPgs = [];
      var pgIdsToDelete = [];
      var newPgId1 =
        parseInt(
          Object.keys(state.pieceGroups)[
            Object.keys(state.pieceGroups).length - 1
          ]
        ) + 1;
      state.selectedShapes.forEach((pgId, idx) => {
        var newPgId2 = newPgId1 + 1;
        var newPieceGroup = JSON.parse(JSON.stringify(state.pieceGroups[pgId]));
        newPieceGroup.x = newPieceGroup.x + action.offsets[pgId];
        state.pieceGroups[newPgId1.toString()] = newPieceGroup;
        state.pieceGroups[newPgId1.toString()].idx = newPieceGroupId;
        state.onDesignWall[newPgId1.toString()] = true;
        state.pieceGroups[newPgId1.toString()].onDesignWall = true;
        state.pieceGroups[newPgId1.toString()].isReal = false;
        var newPieceGroup2 = JSON.parse(
          JSON.stringify(state.pieceGroups[pgId])
        );
        state.pieceGroups[newPgId2.toString()] = newPieceGroup2;
        newPgs.push(newPgId1.toString());
        newPgs.push(newPgId2.toString());
        pgIdsToDelete.push(pgId);
        state.history.push({
          action: "duplicate",
          parents: [pgId],
          children: [newPgId1.toString(), newPgId2.toString()]
        });
        newPgId1 = newPgId2 + 1;
      });
      var newSelectedShapes = [...state.selectedShapes];
      newPgs.forEach((pg) => {
        newSelectedShapes.push(pg);
      });
      pgIdsToDelete.forEach((pg) => {
        delete state.pieceGroups[pg];
      });
      state.selectedShapes = newSelectedShapes;
      state.message = action.message;
      console.log("IN DUPL", state.selectedShapes);
      console.log(state.history);
      return state;
    case "sewPieces":
      state.message = action.message;
      var newState = JSON.parse(JSON.stringify(state));
      var oldPg = [];
      var history = {
        action: "sew",
        parents: [],
        children: []
      };

      action.changes.forEach((change, idx) => {
        var pieceData = JSON.parse(
          JSON.stringify(state.pieceGroups[change.oldPg].pieceData[change.oldP])
        );
        history.parents.push(change.oldPg);
        history.parents.push(change.newPg);
        history.children.push(change.newPg);

        newState.pieceGroups[change.newPg].pieceData[change.newP] = pieceData;
        newState.pieceGroups[change.newPg].pieceData[change.newP].x =
          change.newPos.x;
        newState.pieceGroups[change.newPg].pieceData[change.newP].y =
          change.newPos.y;
        newState.pieceGroups[change.newPg].isReal = false;
        if (oldPg.indexOf(change.oldPg) < 0) {
          oldPg.push(change.oldPg);
        }
        var parent =
          state.historyMap[change.oldPg][
            state.historyMap[change.oldPg].length - 1
          ];
        graph.setNode("n" + state.treeId.toString(), "sew");
        state.historyMap[change.newPg].push("n" + state.treeId.toString());

        graph.setEdge(parent, "n" + state.treeId.toString());
        state.historyMap[idx].push("n" + state.treeId.toString());
        state.treeId += 1;
      });
      newState.history.push(history);
      oldPg.forEach((pgId) => {
        delete newState.pieceGroups[pgId];
      });
      console.log("in sew pieces STATE", newState);
      return newState;
    case "loadJSON":
      console.log("loading json");
      var idx = 0;
      for (var i = 0; i < Object.keys(action.data.pieceGroups).length; i++) {
        state.pieceGroups[idx] = action.data.pieceGroups[i];
        state.onDesignWall[idx] = false;
        idx += 1;
      }
      state.message = action.message;
      return state;
    case "addFabric":
      console.log("adding fabric", action.newColor);
      var newColor = action.newColor;
      var newFabric = {
        width: 100,
        height: 100,
        color: newColor,
        filename: action.filename
      };
      var newIdx = Object.keys(state.fabrics).length;
      console.log(newFabric);
      state.fabrics[newIdx] = newFabric;
      console.log(state);
      state.message = action.message;
      return state;
    case "changeFabricDims":
      var fabric = state.fabrics[action.whichFabric];
      console.log(action.whichFabric, fabric);
      fabric["width"] = action.width;
      fabric["height"] = action.height;
      fabric["label"] = action.label;
      state.fabrics[action.whichFabric] = fabric;
      state.message = action.message;
      return state;
    case "addPieceGroup":
      var newPieceGroups = action.newPieceGroups;
      var idx = Object.keys(state.pieceGroups).length;
      var graph = new dagre.graphlib.Graph();
      var start = "start";
      graph.setNode(start, {
        label: "start"
      });
      for (var i = 0; i < Object.keys(newPieceGroups).length; i++) {
        state.pieceGroups[idx] = newPieceGroups[i];
        state.pieceGroups[idx].x = 0;
        state.pieceGroups[idx].y = 0;
        state.pieceGroups[idx].isReal = true;
        state.historyMap[idx] = [];
        var pieceData = state.pieceGroups[idx].pieceData;
        var parents = [];
        var compoundSVG = "";
        for (var j = 0; j < Object.keys(pieceData).length; j++) {
          var pd = pieceData[Object.keys(pieceData)[j]];
          var boundary = scaleBoundaryToPiece(
            pd,
            (targetWidth = 50),
            (targetHeight = 50)
          );
          var mysvg = buildSVGNodeLabel(state.pieceGroups[idx], j, "cut");
          console.log(mysvg);
          graph.setNode("n" + state.treeId.toString(), {
            label: mysvg
          });
          graph.setEdge(start, "n" + state.treeId.toString(), "cut");
          parents.push("n" + state.treeId.toString());
          state.historyMap[idx].push("n" + state.treeId.toString());
          state.treeId += 1;
        }
        if (Object.keys(pieceData).length > 1) {
          // graph.setNode("n" + state.treeId.toString(), {
          //   label: "<p>sew</p>"
          // });
          var boundary = scaleBoundaryToPiece(
            pd,
            (targetWidth = 50),
            (targetHeight = 50)
          );
          var mysvg = buildSVGNodeLabel(state.pieceGroups[idx], j, "sew");
          console.log(mysvg);
          graph.setNode("n" + state.treeId.toString(), {
            label: mysvg
          });
          graph.setEdge(parents[0], "n" + state.treeId.toString(), "sew");
          graph.setEdge(parents[1], "n" + state.treeId.toString(), "sew");
          state.historyMap[idx].push("n" + state.treeId.toString());
          state.treeId += 1;
        }
        idx += 1;
      }
      state.graph = gl.json.write(graph);
      // state.graph = graph;
      state.message = action.message;
      console.log("init state", state);
      return state;
    case "loadPieceGroup":
      var keyName = action.whichPiece;
      var currentVis = state.pieceGroups[keyName].onDesignWall;
      var newVis = !currentVis;
      var newODW = state.onDesignWall;
      var newState = { ...state };
      newState.pieceGroups[keyName].onDesignWall = !state.pieceGroups[keyName]
        .onDesignWall;
      newState.onDesignWall[keyName] = !state.pieceGroups[keyName].onDesignWall;
      newState.message = action.message;
      return newState;
    case "updatePositions":
      var newState = JSON.parse(JSON.stringify(state));
      newState.pieceGroups[action.whichPieceGroup].x = action.pos.x;
      newState.pieceGroups[action.whichPieceGroup].y = action.pos.y;
      return newState;
    case "recolorPieceGroup":
      var newState = Object.assign({}, state);
      var newPieceGroupId = (
        parseInt(
          Object.keys(state.pieceGroups)[
            Object.keys(state.pieceGroups).length - 1
          ]
        ) + 1
      ).toString();
      newState.message = action.message;
      newState.pieceGroups[action.whichPieceGroup].pieceData[
        action.whichPiece
      ].color = action.color;
      newState.pieceGroups[action.whichPieceGroup].isReal = false;
      newState.pieceGroups[newPieceGroupId] = JSON.parse(
        JSON.stringify(newState.pieceGroups[action.whichPieceGroup])
      );
      newState.history.push({
        action: "recolor",
        parents: [action.whichPieceGroup],
        children: [newPieceGroupId],
        stageBefore: action.stageBefore,
        stageAfter: action.stageAfter
      });
      delete newState.pieceGroups[action.whichPieceGroup];
      return newState;
    case "cutPiece":
      console.log(action.replacePiece, action.newPiece);
      state.message = action.message;
      //add newPiece
      var newPieceGroupId = Object.keys(state.pieceGroups).length;
      var newPieceGroupId2 = newPieceGroupId + 1;
      state.pieceGroups[newPieceGroupId] = {};
      state.pieceGroups[newPieceGroupId].idx = newPieceGroupId;
      state.pieceGroups[newPieceGroupId].x =
        state.pieceGroups[action.whichPieceGroup].x + 5;
      state.pieceGroups[newPieceGroupId].pieceData = {};
      state.pieceGroups[newPieceGroupId].pieceData[0] = action.newPiece;
      state.pieceGroups[newPieceGroupId].onDesignWall = true;
      state.pieceGroups[newPieceGroupId].isReal = false;
      state.pieceGroups[newPieceGroupId].width =
        state.pieceGroups[action.whichPieceGroup].width;
      state.pieceGroups[newPieceGroupId].height =
        state.pieceGroups[action.whichPieceGroup].height;
      state.onDesignWall[newPieceGroupId] = true;
      //replacePiece with half
      state.pieceGroups[action.whichPieceGroup].pieceData[action.whichPiece] =
        action.replacePiece;
      state.pieceGroups[action.whichPieceGroup].isReal = false;
      state.onDesignWall[action.whichPieceGroup] = true;

      state.pieceGroups[newPieceGroupId2] = JSON.parse(
        JSON.stringify(state.pieceGroups[action.whichPieceGroup])
      );
      // newState.history.push({
      //   action: "cut",
      //   parents: [action.whichPieceGroup],
      //   children: [newPieceGroupId, newPieceGroupId2]
      // });
      console.log("graph before", state.graph);
      var graph = gl.json.read(state.graph);
      var parent =
        state.historyMap[action.whichPieceGroup][
          state.historyMap[action.whichPieceGroup].length - 1
        ];
      console.log("treeId", state.treeId, parent);
      var normalizedPath = normalize({
        viewBox: "0 0 100 100",
        path: state.pieceGroups[newPieceGroupId].pieceData[0].svg,
        min: 0,
        max: 100,
        asList: false
      });
      graph.setNode("n" + state.treeId.toString(), {
        label:
          "<div><p>cut</p>" +
          '<svg width="80" height="80"><path d="' +
          normalizedPath +
          '" style="fill:' +
          state.pieceGroups[newPieceGroupId].pieceData[0].color +
          ';"/></div>'
      });
      normalizedPath = normalize({
        viewBox: "0 0 100 100",
        path: state.pieceGroups[action.whichPieceGroup].pieceData[0].svg,
        min: 0,
        max: 100,
        asList: false
      });
      graph.setNode("n" + (state.treeId + 1).toString(), {
        label:
          "<div><p>cut</p>" +
          '<svg width="80" height="80"><path d="' +
          normalizedPath +
          '" style="fill:' +
          state.pieceGroups[action.whichPieceGroup].pieceData[0].color +
          ';"/></div>'
      });
      graph.setEdge(parent, "n" + state.treeId.toString());
      graph.setEdge(parent, "n" + (state.treeId + 1).toString());
      // state.graph = graph;
      state.graph = gl.json.write(graph);
      state.historyMap[newPieceGroupId] = ["n" + state.treeId.toString()];
      state.historyMap[newPieceGroupId2] = [
        "n" + (state.treeId + 1).toString()
      ];
      state.treeId += 2;
      // state.graph = gl.json.write(graph);

      delete state.pieceGroups[action.whichPieceGroup];

      console.log("in cut state is ", state);
      return state;
    case "finishEdit":
      action.newAttrs.forEach((element) => {
        var pg = element.whichPieceGroup;
        var p = element.whichPiece;
        state.pieceGroups[pg].pieceData[p].x = element.x;
        state.pieceGroups[pg].pieceData[p].y = element.y;
        state.pieceGroups[pg].pieceData[p].rotation = element.rotation;
      });
      console.log("finish state", state);
      return {
        message: action.message,
        pieces: state.pieces,
        pieceGroups: state.pieceGroups,
        selectedPieceID: state.selectedPieceID,
        fabrics: state.fabrics,
        uploadedFile: state.uploadedFile,
        onDesignWall: state.onDesignWall,
        tool: action.tool,
        selectedShapes: state.selectedShapes,
        errorMessage: state.errorMessage
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
