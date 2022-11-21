import React, { useState } from "react";
import CropIcon from "@material-ui/icons/Crop";
import PaletteIcon from "@material-ui/icons/Palette";
import { GiResize, GiArrowCursor, GiSewingNeedle } from "react-icons/gi";
import { GrUndo, GrRedo } from "react-icons/gr";
// import { AiOutlineRotateLeft } from "react-icons/ai";
import { MdDelete, MdAddToPhotos } from "react-icons/md";
import { RiSliceLine } from "react-icons/ri";
import { Toolbar, Typography } from "@material-ui/core";
import { IconButton } from "@material-ui/core";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import { useStore } from "./store";
import { pink100 } from "material-ui/styles/colors";
import { CirclePicker } from "react-color";
import { Stage, Layer, Path, Group, Line, Rect, Circle } from "react-konva";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    display: "flex",
    flexDirection: "row"
  }
}));

export const SewToolBar = () => {
  const { state, dispatch } = useStore();
  const [localTool, setLocalTool] = useState("");
  const [helperText, setHelperText] = useState("");
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showColors, setShowColors] = useState([]);
  const classes = useStyles();

  function fillHelperText(tool) {
    if (tool === "selecttool") {
      setHelperText("click and drag objects on canvas");
    } else if (tool === "slicetool") {
      setHelperText("click to drag a line over the shapes to place a cut");
    } else if (tool === "sewtool") {
      setHelperText("group pieces");
    } else if (tool === "duplicatetool") {
      setHelperText("copies selected piece");
    } else if (tool === "colortool") {
      setHelperText("select new color scheme");
    } else if (tool === "resizetool") {
      setHelperText("drag corners to resize pieces");
    } else if (tool === "croptool") {
      setHelperText("drag crop corners to crop piece");
    } else if (tool === "redotool") {
      setHelperText("redo last action");
    } else if (tool === "undotool") {
      setHelperText("undo last action");
    } else if (tool === "deletetool") {
      setHelperText("delete selected element");
    } else {
      setHelperText("");
    }
  }

  function handleHover(ev) {
    var tool = ev.currentTarget.value;
    fillHelperText(tool);
  }

  function handleClick(ev) {
    var tool = ev.currentTarget.value;
    setLocalTool(tool);

    if (tool == "duplicatetool") {
      handleDuplicate();
    }
    if (tool == "colortool") {
      showColorChoices();
    }
    dispatch({
      type: "selectTool",
      message: "selectTool",
      tool: tool
    });
  }

  function handleDuplicate() {
    dispatch({
      type: "duplicatePieces",
      message: "duplicatePieces"
    });
    dispatch({
      type: "addCommand",
      message: "addCommand",
      command: "duplicate",
      stage: stageEl.current.toJSON()
    });
  }

  function handleRecolor() {
    setShowColorPalette(true);
  }

  function getColorsFromFabrics() {
    var colors = [];
    Object.keys(state.fabrics).map((keyName, i) => {
      var fabric = state.fabrics[keyName];
      colors.push(fabric.color);
    });
    if (colors.length < 1) {
      return ["#f44336", "#e91e63", "#9c27b0", "#673ab7"];
    }
    return colors;
  }

  function selectNewColor(color, pgId, pieceId) {
    console.log("colorpg", state.selectedShapes);
    setShowColors([]);
    dispatch({
      type: "recolorPieceGroup",
      message: "recolorPieceGroup",
      whichPieceGroup: pgId,
      whichPiece: pieceId,
      color: color.hex
    });
    dispatch({
      type: "addCommand",
      message: "addCommand",
      command: "recolor"
    });
  }

  function showColorChoices() {
    var newShowColors = JSON.parse(JSON.stringify(showColors));
    for (var i = 0; i < state.selectedShapes.length; i++) {
      var pgId = state.selectedShapes[i];
      if (newShowColors.includes(pgId)) {
        newShowColors = newShowColors.filter((item) => item !== pgId);
        setShowColors(newShowColors);
      } else {
        newShowColors.push(pgId);
        setShowColors(newShowColors);
      }
    }
  }

  function createButton(tool) {
    var symbol;
    var buttonText;
    var disabledOne = false;
    var disabledTwo = false;
    if (tool == "selecttool") {
      buttonText = "select";
      symbol = <GiArrowCursor />;
    } else if (tool == "slicetool") {
      buttonText = "cut";
      symbol = <RiSliceLine />;
      disabledOne = true;
    } else if (tool == "sewtool") {
      buttonText = "sew";
      symbol = <GiSewingNeedle />;
      disabledTwo = true;
    } else if (tool == "duplicatetool") {
      buttonText = "duplicate";
      symbol = <MdAddToPhotos />;
      disabledOne = true;
    } else if (tool == "colortool") {
      buttonText = "recolor";
      symbol = <PaletteIcon />;
      disabledOne = true;
    } else if (tool == "resizeTool") {
      buttonText = "resize";
      symbol = <GiResize />;
      disabledOne = true;
    } else if (tool == "croptool") {
      buttonText = "crop";
      symbol = <CropIcon />;
      disabledOne = true;
    } else if (tool == "redotool") {
      buttonText = "redo";
      symbol = <GrRedo />;
    } else if (tool == "undotool") {
      buttonText = "undo";
      symbol = <GrUndo />;
    } else if (tool == "deletetool") {
      buttonText = "delete";
      symbol = <MdDelete />;
      disabledOne = true;
    }
    if (disabledOne) {
      return (
        <IconButton
          classes={{ label: classes.iconButton }}
          className={state.tool === tool ? "icbutton" : "IconButton"}
          value={tool}
          onClick={(e) => handleClick(e)}
          onMouseEnter={(e) => handleHover(e)}
          onMouseExit={(e) => fillHelperText("")}
          selected={state.tool === tool}
          disabled={state.selectedShapes.length < 1}
        >
          {symbol}
          <div>{buttonText}</div>
        </IconButton>
      );
    } else if (disabledTwo) {
      return (
        <IconButton
          classes={{ label: classes.iconButton }}
          className={state.tool === tool ? "icbutton" : "IconButton"}
          value={tool}
          onClick={(e) => handleClick(e)}
          onMouseEnter={(e) => handleHover(e)}
          onMouseExit={(e) => fillHelperText("")}
          selected={state.tool === tool}
          disabled={state.selectedShapes.length < 2}
        >
          {symbol}
          <div>{buttonText}</div>
        </IconButton>
      );
    } else {
      return (
        <IconButton
          classes={{ label: classes.iconButton }}
          className={state.tool === tool ? "icbutton" : "IconButton"}
          value={tool}
          onClick={(e) => handleClick(e)}
          onMouseEnter={(e) => handleHover(e)}
          onMouseExit={(e) => fillHelperText("")}
          selected={state.tool === tool}
        >
          {symbol}
          <div>{buttonText}</div>
        </IconButton>
      );
    }
  }
  return (
    <div className="ToolBar">
      <Toolbar position="static">
        <Typography
          style={{ borderRight: "0.1em solid black", padding: "0.5em" }}
        >
          {createButton("selecttool")}
          {createButton("slicetool")}
          {createButton("sewtool")}
          {createButton("duplicatetool")}
          {createButton("colortool")}
          {createButton("resizetool")}
          {createButton("croptool")}
        </Typography>
        <Typography
          style={{
            padding: "0.5em",
            textAlign: "right"
          }}
        >
          {createButton("redotool")}
          {createButton("undotool")}
          {createButton("deletetool")}
        </Typography>
      </Toolbar>
      <p className="helperText">{helperText}</p>
      <p className="errorMessage">{state.errorMessage}</p>
      {Object.keys(state.pieceGroups).map((keyName, i) => (
        <>
          {Object.keys(state.pieceGroups[keyName].pieceData).map(
            (pieceName, j) => (
              <>
                {showColors.includes(keyName) && (
                  <>
                    <Stage width={30} height={30}>
                      <Layer>
                        <Rect
                          width={28}
                          height={28}
                          x={0}
                          y={0}
                          fill={
                            state.pieceGroups[keyName].pieceData[pieceName]
                              .color
                          }
                        />
                      </Layer>
                    </Stage>

                    <CirclePicker
                      colors={getColorsFromFabrics(keyName, pieceName)}
                      onChange={(e) => selectNewColor(e, keyName, pieceName)}
                    />
                  </>
                )}
              </>
            )
          )}
        </>
      ))}
    </div>
  );
};
