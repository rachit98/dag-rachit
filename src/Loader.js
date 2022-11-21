import React, { useEffect } from "react";
import { useStore } from "./store";
import { Button } from "@material-ui/core/";
import { boundaryToSVG, scaleBoundaryToCanvas } from "./helpers";

export const Loader = (props) => {
  const { state, dispatch } = useStore();

  function addPieceGroupFromImage(pieceGroups) {
    var newPieceGroups = {};
    for (var i = 0; i < Object.keys(pieceGroups).length; i++) {
      newPieceGroups[i] = pieceGroups[i];
      newPieceGroups[i].onDesignWall = false;
      newPieceGroups[i].pieceData = {};
      for (var j = 0; j < pieceGroups[i].pieces.length; j++) {
        var newPiece = {};
        var pieceData = pieceGroups[i].pieces[j];
        var boundaryInfo = scaleBoundaryToCanvas(pieceData, pieceGroups[i]);
        var scaledBoundary = boundaryInfo.boundary;
        var svgBoundary = boundaryToSVG(scaledBoundary);
        var color = pieceData.color;
        var red = color.red.toString();
        var blue = color.blue.toString();
        var green = color.green.toString();
        newPiece["scaledBoundary"] = scaledBoundary;
        newPiece["svg"] = svgBoundary;
        newPiece["color"] = "rgb(" + red + "," + green + "," + blue + ")";
        newPiece["imageOffsetX"] = pieceData.imageOffsetX;
        newPiece["imageOffsetY"] = pieceData.imageOffsetY;
        newPiece["scaleX"] = boundaryInfo.scaleX;
        newPiece["scaleY"] = boundaryInfo.scaleY;
        newPiece["rotation"] = 0;
        // newPiece["x"] = pieceData.imageOffsetX * boundaryInfo.scaleX;
        // newPiece["y"] = pieceData.imageOffsetY * boundaryInfo.scaleY;
        newPiece["x"] = 0;
        newPiece["y"] = 0;
        newPieceGroups[i].pieceData[j] = newPiece;
      }
    }
    dispatch({
      type: "addPieceGroup",
      message: "addPieceGroup",
      newPieceGroups: newPieceGroups
    });
  }

  return (
    <Button onClick={() => addPieceGroupFromImage(props.data.pieceGroups)}>
      load data
    </Button>
  );
};

// import React from "react";
// import Button from "@material-ui/core/Button";
// import { useStore } from "./store";

// import * as JSONdata from "./data.json";

// export const Loader = () => {
//   const { state, dispatch } = useStore();

//   function loadData() {
//     console.log("here");
//     dispatch({
//       type: "loadJSON",
//       message: "loadJSON",
//       data: JSONdata
//     });
//     // setReady(true);
//     console.log(state);
//   }
//   return (
//     <Button value="load" onClick={e => loadData(e)}>
//       Load
//     </Button>
//   );
// };
