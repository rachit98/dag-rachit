import React, { Component, useState, useEffect } from "react";

import {
  Stage,
  Layer,
  Path,
  Transformer,
  Group,
  Line,
  Rect
} from "react-konva";

export default class ImprovTransformer extends React.Component {
  componentDidMount() {
    this.checkNode();
  }
  componentDidUpdate() {
    this.checkNode();
  }

  onTransformStart() {
    console.log("onTransformStart");
  }

  onTransform() {
    console.log("onTransform");
  }

  shapeSnap(activeObject) {
    var edgedetection = 40; //pixels to snap
    console.log("in shape snap");
  }

  checkNode() {
    // here we need to manually attach or detach Transformer node
    const stage = this.transformer.getStage();
    const { selectedShapeName, selectedMode } = this.props;

    if (selectedMode === "design") {
      var selectedNode = stage.findOne("#" + selectedShapeName);
      console.log(selectedNode);
      // do nothing if selected node is already attached
      if (selectedNode === this.transformer.node()) {
        return;
      }
      if (selectedNode && !selectedNode.isVisible()) {
        console.log("detaching");
        this.transformer.detach();
      } else if (selectedNode && selectedShapeName.length > 0) {
        const type = selectedNode.getType();
        console.log(type);
        if (type == "Group") {
          this.shapeSnap(selectedNode);
          selectedNode = selectedNode.children;
          console.log(selectedNode);
          this.transformer.nodes(selectedNode);
        }
      } else {
        // remove transformer
        this.transformer.detach();
      }
      // var boundaryRectangle = stage.findOne(".boundaryRectangle");
      // var shapes = stageEl.current.find(".improvShape");
      // var selectedShapes = shapes.filter(shape => shape.isVisible());
      // var maxX = 0;
      // var maxY = 0;
      // selectedShapes.forEach((element) => {
      //   var x = element.x() + element.width();
      //   var y = element.y() + element.height();
      //   if (x > maxX) {
      //     maxX = x;
      //   }
      //   if (y > maxY) {
      //     maxY = y;
      //   }
      // })
      // boundaryRect.width(maxX)
      // boundaryRect.height(maxY)
      // this.transformer.getLayer().batchDraw();
      // var json = stage.toJSON();
      // console.log(JSON.parse(json));
    }

    // else if (selectedMode === 'seam') {
    //   var selectionRectangle = stage.findOne(".selectionRectangle");
    //   if (!selectionRectangle.visible()) {
    //       return;
    //     }
    //     // update visibility in timeout, so we can check it in click event
    //     setTimeout(() => {
    //       selectionRectangle.visible(false);
    //       this.transformer.getLayer().batchDraw();
    //     });
    //
    //     var shapes = stage.find('.path').toArray();
    //     var box = selectionRectangle.getClientRect();
    //     var selected = shapes.filter((shape) =>
    //       Konva.Util.haveIntersection(box, shape.getClientRect())
    //     );
    //     this.transformer.nodes(selected);
    //     this.transformer.getLayer().batchDraw();
    // }
  }
  render() {
    return (
      <Transformer
        ref={node => {
          this.transformer = node;
        }}
        keepRatio={true}
        transformstart={this.onTransformStart}
        transform={this.onTransform}
        transformend={this.onTransformEnd}
      />
    );
  }
}
