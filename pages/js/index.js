var oldx = 0;
var oldy = 0;

var imageDataDst, imageDataSrc;

w = 1024;
h = 512;

var lerp = function(a, b, t) {
  return (b - a) * (1 - Math.exp(-t)) + a;
}

window.onload = function() {
  w = img.width;
  h = img.height;

  canvas = document.querySelector("canvas");
  canvas.width = w;
  canvas.height = h;

  dst = canvas.getContext("2d");

  dst.drawImage(img, 0, 0, w, h);
  i = 0;
  imageDataSrc = dst.getImageData(0, 0, w, h);
  imageDataDst = dst.getImageData(0, 0, w, h);

  canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
    updatecanvas(canvas, mousePos.x, mousePos.y);
  }, false);

};

var smootherstep = function(t) {
  //return 1/(Math.exp(-5*t+Math.E)) - Math.exp(-Math.E);
  return 1 / (Math.exp(-6 * t + 3)) - Math.exp(-3);
};

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function updatecanvas(canvas, px, py) {
  var context = canvas.getContext('2d');

  re = 50;
  r = 100;
  xmin = oldx - r;
  xmax = oldx + r;
  if (xmin < 0) {
    xmin = 0;
  }
  if (xmax > w) {
    xmax = w;
  }
  ymin = oldy - r;
  ymax = oldy + r;

  if (ymin < 0) {
    ymin = 0;
  }
  if (ymax > h) {
    ymax = h;
  }
  for (y = ymin; y < ymax; y++) {
    for (x = xmin; x < xmax; x++) {
      index = (x + y * w) << 2;
      imageDataDst.data[index] = imageDataSrc.data[index++];
      imageDataDst.data[index] = imageDataSrc.data[index++];
      imageDataDst.data[index] = imageDataSrc.data[index++];
      imageDataDst.data[index] = 255;
    }
  }

  var dstdata = imageDataDst.data;
  var srcdata = imageDataSrc.data;

  xmin = px - r;
  xmax = px + r;
  ymin = py - r;
  ymax = py + r;

  if (xmin < 0) {
    xmin = 0;
  }
  if (xmax > w) {
    xmax = w;
  }

  if (ymin < 0) {
    ymin = 0;
  }
  if (ymax > h) {
    ymax = h;
  }

  var tol = -15;
  var maxSize = w * (h - 1) + w - 1;
  index = 0;

  for (y = ymin; y < ymax; y++) {
	index = (xmin + y * w) << 2;
    for (x = xmin; x < xmax; x++) {
      x1 = x - px;
      y1 = y - py;
      d = Math.sqrt(x1 * x1 + y1 * y1);
      if (d <= r) {
        sc = 1 - smootherstep((r - d) / r);

		ax = x1/d*re*re/d;
		ay = y1/d*re*re/d;
        xx = Math.round(x - ax);
        yy = Math.round(y - ay);

        //Antialiasing
        if (sc < tol * 0.9 && sc > tol * 1.1)
          sc = 0.9;
        else if (sc < tol)
          sc = 0.1;
        else
          sc = 1;
        //end of lens math
        index2 = ((xx + yy * w) % maxSize) << 2;
        //dstdata[index++] = sc * srcdata[index2 + 0];
        //dstdata[index++] = sc * srcdata[index2 + 1];
        //dstdata[index++] = sc * srcdata[index2 + 2];
        dstdata[index++] = srcdata[index2 + 0];
        dstdata[index++] = srcdata[index2 + 1];
        dstdata[index++] = srcdata[index2 + 2];
        index++;
      } else {
        index = index + 4;
      }
    }
  }

  imageDataDst.data = dstdata;
  dst.putImageData(imageDataDst, 0, 0);
  oldx = px;
  oldy = py;
}

var img = new Image();
img.crossOrigin="anonymous";
//img.src = "spacehd2.jpg";
img.src = "hudf_1024_576.jpg";


