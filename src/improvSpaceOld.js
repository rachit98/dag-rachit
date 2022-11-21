import React, { useState } from "react";
import Konva from "konva";
import { Stage, Layer, Path, Group, Line, Rect } from "react-konva";
import { splitShape, boundaryToSVG, closestEdgeToPoint } from "./helpers";
import ImprovTransformer from "./ImprovTransformer";
import { useStore } from "./store";

export const ImprovSpace = () => {
  const { state, dispatch } = useStore();
  const stageEl = React.createRef();
  const layerEl = React.createRef();
  const selectionRectangle = React.createRef();
  const tr = React.createRef();

  var startCut = [];
  var startedCut = false;
  const [cutPoints, setCutPoints] = useState([]);
  const [transforms, setTransforms] = useState({});
  var x1, y1, x2, y2;

  function handleSelection(e) {}

  // cutting a shape
  function startDrawCut(e) {
    if (state.tool === "slicetool") {
      // var pos = e.target.getStage().getPointerPosition();
      var pos = getRelativePointerPosition(layerEl.current);
      startCut = [pos.x, pos.y];
      startedCut = true;
    }
  }

  function finishDrawCut(e) {
    if (state.tool === "slicetool" && startedCut) {
      var layer = layerEl.current;
      const pos = getRelativePointerPosition(layer);
      var linePoints = startCut.concat([pos.x, pos.y]);
      setCutPoints(linePoints);
      startedCut = false;
    }
  }

  function cutPieceFn(lineStart, lineEnd) {
    console.log("in cut piece", lineStart, lineEnd);
    finishEdit();
    var shapes = stageEl.current.find(".improvShape");
    var selectedShapes = shapes.filter((shape) => shape.isVisible());
    var splitPiece = false;
    // console.log(activeObject.getType())
    // console.log(activeObject.)
    selectedShapes.forEach((element) => {
      var t = element.getAbsoluteTransform().getTranslation();
      console.log(t);
      var xOffset = t.x;
      var yOffset = t.y;
      var name = element.id();
      var i = name.split("-")[0];
      var j = name.split("-")[1];
      // var boundary = state.pieceGroups[i].pieceData[j].scaledBoundary;
      var data = element.data();
      var path = { type: "path", d: data };
      data = toPoints(path);
      console.log(data, lineStart, lineEnd, xOffset, yOffset);
      var absoluteTransform = element.getAbsoluteTransform().decompose();
      console.log(absoluteTransform);
      console.log(element.x() + xOffset, element.y() + yOffset);
      var newBoundaries = splitShape(
        data,
        lineStart,
        lineEnd,
        xOffset,
        yOffset
      );
      console.log(newBoundaries);
      if (Object.keys(newBoundaries).length === 2) {
        var replacePiece = state.pieceGroups[i].pieceData[j];
        replacePiece.scaledBoundary = newBoundaries[0];
        replacePiece.svg = boundaryToSVG(newBoundaries[0]);
        replacePiece.x = element.x();
        replacePiece.y = element.y();

        var newPiece = Object.assign({}, replacePiece);
        newPiece.scaledBoundary = newBoundaries[1];
        newPiece.svg = boundaryToSVG(newBoundaries[1]);
        newPiece.x = absoluteTransform.x;
        newPiece.y = absoluteTransform.y; //need to get transformation

        splitPiece = true;

        var json = stageEl.current.toJSON();
        var newData = {};
        var dataURL = stageEl.current.toDataURL();

        var shapes = stageEl.current.find(".improvShape");
        var selectedShapes = shapes.filter((shape) => shape.isVisible());
        var maxX = 0;
        var maxY = 0;
        selectedShapes.forEach((element) => {
          var rect = element.getClientRect();
          var x = rect.x + rect.width;
          var y = rect.y + rect.height;
          console.log(x, y);
          if (x > maxX) {
            maxX = x;
          }
          if (y > maxY) {
            maxY = y;
          }
        });
        console.log(selectedShapes);

        newData.transformType = "cut";
        newData.pieces = replacePiece;
        newData.stage = json;
        newData.dataURL = dataURL;
        newData.crop = { width: maxX, height: maxY };
        transforms[Object.keys(transforms).length] = newData;
        setTransforms(transforms);

        dispatch({
          type: "cutPiece",
          message: "cutPiece",
          replacePiece: replacePiece,
          whichPieceGroup: i,
          whichPiece: j,
          newPiece: newPiece
        });
      }
    });
    if (!splitPiece) {
      console.log("didn't split piece");
    }
    setCutPoints([]);
  }

  function getRelativePointerPosition(node) {
    //this function will return pointer position relative to the passed node
    var transform = node.getAbsoluteTransform().copy();
    // to detect relative position we need to invert transform
    transform.invert();

    // get pointer (say mouse or touch) position
    var pos = node.getStage().getPointerPosition();

    // now we can find relative point
    return transform.point(pos);
  }

  function seamPieceFn(lineStart, lineEnd) {
    console.log("sew");
    var seamDistances = [];
    //get the two closest edges to the line you drew
    for (var i = 0; i < Object.keys(state.pieceGroups).length; i++) {
      var pg = state.pieceGroups[i];
      if (state.pieceGroups[i].onDesignWall) {
        for (var j = 0; j < Object.keys(pg.pieceData).length; j++) {
          var selectedShapeName = i + "-" + j;
          var selectedNode = stageEl.current.findOne("." + selectedShapeName);
          console.log(selectedNode);
          if (selectedNode) {
            var boundary = pg.pieceData[j].scaledBoundary;
            var midPointX = (lineEnd.x - lineStart.x) / 2;
            var midPointY = (lineEnd.y - lineStart.y) / 2;
            //compute distance
            var dist = closestEdgeToPoint(boundary, midPointX, midPointY);
            var closestEdge = dist.edge;
            var distance = dist.dist;
            seamDistances.push({
              distance: distance,
              closestEdge: closestEdge,
              pieceGroup: i,
              piece: j
            });
          }
        }
      }
    }
    var sortedDists = seamDistances.sort(function (x) {
      return x.distance;
    });
    console.log(sortedDists);
    // dispatch({
    //   type: "cutPiece",
    //   message: "cutPiece",
    //   replacePiece: replacePiece,
    //   whichPieceGroup: i,
    //   whichPiece: j,
    //   newPiece: newPiece
    // });
    return 0;
  }

  function startDrawSeam(e) {
    // do nothing if we mousedown on eny shape
    if (e.target !== e.target.getStage()) {
      return;
    }
    tr.current.transformer.detach();
    var stage = e.target.getStage();
    x1 = stage.getPointerPosition().x;
    y1 = stage.getPointerPosition().y;
    x2 = stage.getPointerPosition().x;
    y2 = stage.getPointerPosition().y;

    selectionRectangle.current.visible(true);
    selectionRectangle.current.width(0);
    selectionRectangle.current.height(0);
  }

  function drawingSeam(e) {
    // var sr = stageEl.current.findOne("#selectionRectangle");
    // console.log("before", selectionRectangle.current);
    // console.log(sr);
    // sr.setAttrs({
    //   x: 10,
    //   y: 20,
    //   width: 10,
    //   height: 10
    // });
    // console.log("after", selectionRectangle.current);
    // if (!selectionRectangle.current.visible()) {
    //   return;
    // }
    // var stage = e.target.getStage();
    // x2 = stage.getPointerPosition().x;
    // y2 = stage.getPointerPosition().y;
    // selectionRectangle.current.setAttrs({
    //   x: Math.min(x1, x2),
    //   y: Math.min(y1, y2),
    //   width: Math.abs(x2 - x1),
    //   height: Math.abs(y2 - y1)
    // });
    // selectionRectangle.current.getLayer().batchDraw();
  }

  function finishDrawSeam(e) {
    console.log("finish drawing seam");
    if (!selectionRectangle.current.visible()) {
      return;
    }
    console.log("here");
    // update visibility in timeout, so we can check it in click event
    setTimeout(() => {
      selectionRectangle.current.visible(false);
    });
    console.log(selectionRectangle.current);
    var stage = e.target.getStage();
    var shapes = stage.find("Path").toArray();
    console.log(shapes);
    var box = selectionRectangle.current.getClientRect();
    var selected = shapes.filter(
      (shape) =>
        shape.isVisible() &&
        Konva.Util.haveIntersection(box, shape.getClientRect())
    );
    console.log(selected);
    tr.current.transformer.nodes(selected);
    tr.current.transformer.getLayer().batchDraw();
    setReadyToGroup(true);
    setGroupMembers(selected);
  }

  function handleStageMouseDown(e) {
    if (state.tool === "slicetool") {
      startDrawCut(e);
    } else if (state.tool === "sewtool") {
      startDrawSeam(e);
    } else {
      // clicked on stage - cler selection
      if (e.target === e.target.getStage()) {
        dispatch({
          type: "selectPiece",
          message: "selectPiece",
          selectedPieceID: ""
        });
        return;
      }
      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.id().split("-")[0];
      // const rect = this.state.rectangles.find(r => r.name === name);
      if (name) {
        dispatch({
          type: "selectPiece",
          message: "selectPiece",
          selectedPieceID: name
        });
      } else {
        dispatch({
          type: "selectPiece",
          message: "selectPiece",
          selectedPieceID: ""
        });
      }
    }
  }

  function handleStageMouseUp(e) {
    if (state.tool === "slicetool") {
      finishDrawCut(e);
    } else if (state.tool === "sewtool") {
      finishDrawSeam(e);
    }
  }

  // function from https://stackoverflow.com/a/15832662/512042
  function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove();
    // delete link;
  }

  function createSewnGroup(newMembers) {
    finishEdit();
    var piecesToMove = [];
    newMembers.forEach((element) => {
      var name = element.id();
      var whichPieceGroup = name.split("-")[0];
      var whichPiece = name.split("-")[1];
      var transform = element.getAbsoluteTransform();
      var offsetX = element.offsetX();
      var offsetY = element.offsetY();
      piecesToMove.push({
        pieceGroup: whichPieceGroup,
        piece: whichPiece,
        offsetX: offsetX,
        offsetY: offsetY
      });
    });
    tr.current.transformer.detach();
    var json = stageEl.current.toJSON();
    var newData = {};
    var dataURL = stageEl.current.toDataURL();
    newData.transformType = "sew";
    newData.pieces = piecesToMove;
    newData.stage = json;
    newData.dataURL = dataURL;
    transforms[Object.keys(transforms).length] = newData;
    setTransforms(transforms);
    console.log(transforms);
    // downloadURI(dataURL, transforms.length.toString()+'.png');
    dispatch({
      type: "addSeam",
      message: "addSeam",
      piecesToMove: piecesToMove
    });
  }

  const handleModes = (event, newMode) => {
    setMode(newMode);
  };

  function draggingGroup(e) {
    console.log("dragging group");
    console.log(e.target);
  }
  return (
    <div className="improvStage">
      <Stage
        key="improvStage"
        width={1000}
        height={800}
        onMouseDown={(e) => handleStageMouseDown(e)}
        onMouseMove={(e) => drawingSeam(e)}
        onMouseUp={(e) => handleStageMouseUp(e)}
        ref={stageEl}
      >
        <Layer ref={layerEl}>
          {Object.keys(state.pieceGroups).map((keyName, i) => {
            return (
              <Group
                name={"improvGroup"}
                id={keyName}
                key={"group-" + keyName}
                draggable
                onDrag={(e) => draggingGroup(e)}
              >
                {Object.keys(state.pieceGroups[keyName].pieceData).map(
                  (pieceName, j) => (
                    <Rect
                      key={"piece-" + keyName + "-" + pieceName}
                      width={28}
                      height={28}
                      x={0}
                      y={0}
                      fill={
                        state.pieceGroups[keyName].pieceData[pieceName].color
                      }
                      visible={
                        state.pieceGroups[keyName].onDesignWall ? true : false
                      }
                    />
                  )
                )}
              </Group>
            );
          })}
          {state.tool == "slicetool" && (
            <Line
              name={"cutLine"}
              points={cutPoints}
              stroke={"green"}
              strokeWidth={5}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
