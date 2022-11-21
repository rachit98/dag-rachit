var polyk = require("polyk");
const normalize = require("normalize-svg-coords");

// export function scaleBoundaryToCanvas(pieceData, pieceGroup, targetWidth = 100, targetHeight=100) {
//   var boundaryObj = pieceData.boundary;
//   var width = (pieceGroup.maxX - pieceGroup.minX);
//   var height = (pieceGroup.maxY - pieceGroup.minY);
//   var aspectRatio = (1.0 * width) / height;
//   if (aspectRatio > 1.0) {
//     var targetHeight = targetWidth / aspectRatio;
//   } else {
//     var targetWidth = targetHeight * aspectRatio;
//   }
//   var renderedBoundary = {}
//   for (var i = 0; i < Object.keys(boundaryObj).length; ++i) {
//     var point = boundaryObj[i];
//     var px = point.x - pieceGroup.minX;
//     var py = point.y - pieceGroup.minY;
//     var pointx = (px / width) * targetWidth;
//     var pointy = (py / height) * targetHeight;
//     renderedBoundary[i] = {x:pointx, y:pointy}
//   }
//   return renderedBoundary
// }

export function getBBfromClientRect(node) {
  var clientRect = node.getClientRect();
  var absPos = node.absolutePosition();
  var tlx = absPos.x - clientRect.width / 2;
  var tly = absPos.y - clientRect.height / 2;
  var tl = { x: tlx, y: tly };

  var trx = absPos.x + clientRect.width / 2;
  var tryy = absPos.y - clientRect.height / 2;
  var tr = { x: trx, y: tryy };

  var brx = absPos.x + clientRect.width / 2;
  var bry = absPos.y + clientRect.height / 2;
  var br = { x: brx, y: bry };

  var blx = absPos.x - clientRect.width / 2;
  var bly = absPos.y + clientRect.height / 2;
  var bl = { x: blx, y: bly };

  var left = absPos.x - clientRect.width / 2;
  var top = absPos.y - clientRect.height / 2;
  return { tl: tl, tr: tr, br: br, bl: bl, left: left, top: top };
}

export function scaleBoundaryToCanvas(
  pieceData,
  pieceGroup,
  targetWidth = 100,
  targetHeight = 100
) {
  var boundaryObj = pieceData.boundary;
  var width = pieceData.imageWidth;
  var height = pieceData.imageHeight;
  var aspectRatio = (1.0 * width) / height;
  if (aspectRatio > 1.0) {
    var targetHeight = targetWidth / aspectRatio;
  } else {
    var targetWidth = targetHeight * aspectRatio;
  }
  var renderedBoundary = {};
  for (var i = 0; i < Object.keys(boundaryObj).length; ++i) {
    var point = boundaryObj[i];
    var px = point.x;
    var py = point.y;
    var pointx = (px / width) * targetWidth;
    var pointy = (py / height) * targetHeight;
    renderedBoundary[i] = { x: pointx, y: pointy };
  }
  return {
    boundary: renderedBoundary,
    scaleX: targetWidth / width,
    scaleY: targetHeight / height
  };
}

export function scaleBoundaryToOriginal(
  pieceData,
  pieceGroup,
  targetWidth = 100,
  targetHeight = 100
) {
  var boundaryObj = pieceData.boundary;
  var width = pieceGroup.maxX - pieceGroup.minX;
  var height = pieceGroup.maxY - pieceGroup.minY;
  var aspectRatio = (1.0 * width) / height;
  if (aspectRatio > 1.0) {
    var targetHeight = targetWidth / aspectRatio;
  } else {
    var targetWidth = targetHeight * aspectRatio;
  }
  var renderedBoundary = {};
  for (var i = 0; i < Object.keys(boundaryObj).length; ++i) {
    var point = boundaryObj[i];
    var px = point.x - pieceGroup.minX;
    var py = point.y - pieceGroup.minY;
    var pointx = (px / width) * targetWidth;
    var pointy = (py / height) * targetHeight;
    renderedBoundary[i] = { x: pointx, y: pointy };
  }
  return renderedBoundary;
}

export function getMinMax(boundaryObj) {
  var minX = 100000;
  var minY = 100000;
  var maxX = 0;
  var maxY = 0;
  console.log("bo", boundaryObj);
  for (var i = 0; i < Object.keys(boundaryObj).length; ++i) {
    var point = boundaryObj[i];
    var px = point.x;
    var py = point.y;
    if (px < minX) {
      minX = px;
    }
    if (py < minY) {
      minY = py;
    }
    if (px > maxX) {
      maxX = px;
    }
    if (py > maxY) {
      maxY = py;
    }
  }
  return { minX: minX, minY, minY, maxX: maxX, maxY: maxY };
}

export function scaleBoundaryToPiece(
  pieceData,
  targetWidth = 100,
  targetHeight = 100
) {
  var boundaryObj = pieceData.scaledBoundary;
  console.log("piece data is", pieceData);
  var minmax = getMinMax(boundaryObj);
  var width = minmax.maxX - minmax.minX;
  var height = minmax.maxY - minmax.minY;
  var aspectRatio = (1.0 * width) / height;
  if (aspectRatio > 1.0) {
    var targetHeight = targetWidth / aspectRatio;
  } else {
    var targetWidth = targetHeight * aspectRatio;
  }
  var renderedBoundary = {};
  for (var i = 0; i < Object.keys(boundaryObj).length; ++i) {
    var point = boundaryObj[i];
    var px = point.x - minmax.minX;
    var py = point.y - minmax.minY;
    var pointx = (px / width) * targetWidth;
    var pointy = (py / height) * targetHeight;
    renderedBoundary[i] = { x: pointx, y: pointy };
  }
  return renderedBoundary;
}

export function scaleBoundaryToPieceGroup(
  pieceData,
  pieceGroup,
  targetWidth = 100,
  targetHeight = 100
) {
  var boundaryObj = pieceData.scaledBoundary;
  var minMax = { minX: 100000, minY: 100000, maxX: 0, maxY: 0 };
  for (var i = 0; i < Object.keys(pieceGroup.pieceData).length; i++) {
    var bobj = pieceGroup.pieceData[i].scaledBoundary;
    var pieceMinMax = getMinMax(bobj);
    if (pieceMinMax.minX < minMax.minX) {
      minMax.minX = pieceMinMax.minX;
    }
    if (pieceMinMax.minY < minMax.minY) {
      minMax.minY = pieceMinMax.minY;
    }
    if (pieceMinMax.maxX > minMax.maxX) {
      minMax.maxX = pieceMinMax.maxX;
    }
    if (pieceMinMax.maxY > minMax.maxY) {
      minMax.maxY = pieceMinMax.maxY;
    }
  }
  var width = minMax.maxX - minMax.minX;
  var height = minMax.maxY - minMax.minY;
  var aspectRatio = (1.0 * width) / height;
  if (aspectRatio > 1.0) {
    var targetHeight = targetWidth / aspectRatio;
  } else {
    var targetWidth = targetHeight * aspectRatio;
  }
  var renderedBoundary = {};
  for (var i = 0; i < Object.keys(boundaryObj).length; ++i) {
    var point = boundaryObj[i];
    var px = point.x - minMax.minX;
    var py = point.y - minMax.minY;
    var pointx = (px / width) * targetWidth;
    var pointy = (py / height) * targetHeight;
    renderedBoundary[i] = { x: pointx, y: pointy };
  }
  return renderedBoundary;
}

export function buildSVGNodeLabel(pieceGroup, whichPiece, nodeType) {
  var pieceData = pieceGroup.pieceData;
  console.log("pd", pieceData);
  var label;
  if (nodeType == "cut") {
    var boundary = scaleBoundaryToPiece(
      pieceData[whichPiece],
      (targetWidth = 50),
      (targetHeight = 50)
    );
    var piecesvg = boundaryToSVG(boundary);
    var innerSvg =
      '<svg width="50" height="50"><path d="' +
      piecesvg +
      '" style="fill:' +
      pieceData[whichPiece].color +
      ';"/></svg>';
    label = "<div>" + innerSvg + "</div>";
  } else {
    var innerSvg = '<svg width="50" height="50">';
    for (var i = 0; i < Object.keys(pieceData).length; i++) {
      var pd = pieceData[i];
      var boundary = scaleBoundaryToPieceGroup(
        pd,
        pieceGroup,
        (targetWidth = 50),
        (targetHeight = 50)
      );
      var piecesvg = boundaryToSVG(boundary);
      innerSvg +=
        '<path d="' + piecesvg + '" style="fill:' + pieceData[i].color + ';"/>';
    }
    innerSvg += "</svg>";
    label = "<div>" + innerSvg + "</div>";
  }
  return label;
}

export function boundaryToSVG(boundaryCanvasCoordinates) {
  var svgString = "M";
  for (var i = 0; i < Object.keys(boundaryCanvasCoordinates).length; ++i) {
    var point = boundaryCanvasCoordinates[i];
    svgString += point.x.toString() + " " + point.y.toString() + " ";
  }
  return svgString;
}

export function splitShape(
  boundaryPoints,
  lineStart,
  lineEnd,
  xOffset = 0,
  yOffset = 0
) {
  //put coordinates in expected [x0, y0, x1, y1,...] format
  //need coordinates on the canvas
  var allBoundaryPts = [];
  console.log(boundaryPoints);
  for (var i = 0; i < Object.keys(boundaryPoints).length; i++) {
    var point = boundaryPoints[i];
    allBoundaryPts.push(point.x + xOffset);
    allBoundaryPts.push(point.y + yOffset);
  }
  console.log(allBoundaryPts);
  var slices = polyk.Slice(
    allBoundaryPts,
    lineStart.x,
    lineStart.y,
    lineEnd.x,
    lineEnd.y
  );
  console.log(slices);
  var newBoundaryPoints = {};
  for (var i = 0; i < slices.length; i++) {
    var slice = slices[i];
    var boundary = {};
    for (var j = 0; j < slice.length - 1; j += 2) {
      var x = slice[j];
      var y = slice[j + 1];
      //map back to the original image coordinates
      boundary[Object.keys(boundary).length] = {
        x: x - xOffset,
        y: y - yOffset
      };
    }
    newBoundaryPoints[i] = boundary;
  }
  return newBoundaryPoints;
}

export function closestEdgeToPoint(
  boundaryPoints,
  x,
  y,
  xOffset = 0,
  yOffset = 0
) {
  var allBoundaryPts = [];
  for (var i = 0; i < Object.keys(boundaryPoints).length; i++) {
    var point = boundaryPoints[i];
    allBoundaryPts.push(point.x + xOffset);
    allBoundaryPts.push(point.y + yOffset);
  }
  var dist = polyk.ClosestEdge(allBoundaryPts, x, y);
  return dist;
}
