import React from "react";
import { GrDrawer } from "react-icons/gr";
import { IconButton, Checkbox, FormControlLabel } from "@material-ui/core";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useStore } from "./store";

export const PieceBin = () => {
  const { state, dispatch } = useStore();
  const [openPieceBin, setPieceBin] = React.useState(false);
  const imaginaryStage = React.createRef();

  function handleClick(e) {
    e.preventDefault();
    openPieceBin ? setPieceBin(false) : setPieceBin(true);
  }

  const loadPieceGroup = (event, keyName) => {
    dispatch({
      type: "loadPieceGroup",
      message: "loadPieceGroup",
      whichPiece: keyName
    });
  };
  function getPBPosition(pgId) {
    var piecePositions = [];
    for (
      var i = 0;
      i < Object.keys(state.pieceGroups[pgId].pieceData).length;
      i++
    ) {
      var piece = state.pieceGroups[pgId].pieceData[i];
      piecePositions.push([piece.x, piece.y]);
    }
    piecePositions.sort(function (a, b) {
      return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
    });
    var minX, minY;
    minX, (minY = piecePositions[0]);
    var updatedPositions = [];
    for (
      var i = 0;
      i < Object.keys(state.pieceGroups[pgId].pieceData).length;
      i++
    ) {
      var piece = state.pieceGroups[pgId].pieceData[i];
      updatedPositions.push([piece.x - minX, piece.y - minY]);
    }
    console.log("piece bin locations", piecePositions, updatedPositions);
    return updatedPositions;
  }

  if (openPieceBin) {
    console.log(state.pieceGroups);
    return (
      <div className="PieceBin">
        <IconButton value="openpiecebin" onClick={(e) => handleClick(e)}>
          <GrDrawer />
        </IconButton>
        <div className="scrolling-wrapper">
          {Object.keys(state.pieceGroups).map((keyName, i) => (
            <div key={"wrapper" + keyName}>
              <svg height="100" width="100" className="card">
                {Object.keys(state.pieceGroups[keyName].pieceData).map(
                  (pieceName, j) => (
                    <path
                      id={"svg-" + keyName + "-" + pieceName}
                      key={"svg-" + keyName + "-" + pieceName}
                      d={state.pieceGroups[keyName].pieceData[pieceName].svg}
                      x={state.pieceGroups[keyName].pieceData[pieceName].x}
                      y={state.pieceGroups[keyName].pieceData[pieceName].y}
                      fill={
                        state.pieceGroups[keyName].pieceData[pieceName].color
                      }
                      opacity={state.pieceGroups[keyName].isReal ? 0.9 : 0.5}
                    />
                  )
                )}
              </svg>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.pieceGroups[keyName].onDesignWall}
                    onChange={(e) => loadPieceGroup(e, keyName)}
                    inputProps={{ "aria-label": "primary checkbox" }}
                  />
                }
                label="on design wall"
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    return (
      <IconButton value="openpiecebin" onClick={(e) => handleClick(e)}>
        <GrDrawer />
      </IconButton>
    );
  }
};
