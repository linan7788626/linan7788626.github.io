var oldx = 0;
var oldy = 0;

var imageDataDst, imageDataSrc;
var img = new Image();
img.crossOrigin="anonymous";
img.src = "https://raw.githubusercontent.com/linan7788626/linan7788626.github.io/master/pages/hudf_1024_576.jpg";

window.onload = function() {

	if(img.src === "https://raw.githubusercontent.com/linan7788626/linan7788626.github.io/master/pages/hudf_1024_576.jpg") {

		canvas = document.querySelector("canvas");
		dst = canvas.getContext("2d");

		document.getElementById("fileUpload").addEventListener("change", function() {
			var FR = new FileReader();
			FR.onload = function(e) {
				img.onload = function() {
					w = img.width;
					h = img.height;
					canvas.width = w;
					canvas.height = h;
					dst.drawImage(img, 0, 0);

					imageDataSrc = dst.getImageData(0, 0, w, h);
					imageDataDst = dst.getImageData(0, 0, w, h);
				};
				img.src = e.target.result;
			};
			FR.readAsDataURL(this.files[0]);
		}, false);
	}

	canvas = document.querySelector("canvas");
	dst = canvas.getContext("2d");

	w = img.width;
  	h = img.height;

  	canvas.width = w;
  	canvas.height = h;

	dst.drawImage(img, 0, 0, w, h);

	imageDataSrc = dst.getImageData(0, 0, w, h);
	imageDataDst = dst.getImageData(0, 0, w, h);

	canvas.addEventListener('mousemove', function(evt) {
		var mousePos = getMousePos(canvas, evt);
		updatecanvas(canvas, mousePos.x, mousePos.y);
	}, false);

	canvas.addEventListener('mousedown', function(event) {
		lastDownTarget = event.target;
		//downloadCanvas(this, 'dst', 'test.png');
		var c = document.getElementById("dst");
		window.open(c.toDataURL('image/png'));
	}, false);
};

var deflection_point = function(x0, y0, re, x, y) {

	var x1 = x - x0;
	var y1 = y - y0;
	var d = Math.sqrt(x1 * x1 + y1 * y1);

	var ax = x1/d*re*re/d;
	var ay = y1/d*re*re/d;

    return [ax, ay];
};

var deflection_nie = function(x0, y0, theta, ql, re, rc, x, y) {
	var tr = Math.PI * (theta / 180);

	var sx = x - x0;
	var sy = y - y0;

	var cs = Math.cos(tr);
	var sn = Math.sin(tr);

	var sx_r = sx * cs + sy * sn;
	var sy_r = -sx * sn + sy * cs;

	var psi = Math.sqrt(ql*ql * (rc*rc + sx_r*sx_r) + sy_r*sy_r);
	var dx_tmp = (re*Math.sqrt(ql)/Math.sqrt(1.0-ql*ql))*Math.atan(Math.sqrt(1.0-ql*ql)*sx_r/(psi+rc));
	var dy_tmp = (re*Math.sqrt(ql)/Math.sqrt(1.0-ql*ql))*Math.atanh(Math.sqrt(1.0-ql*ql)*sy_r/(psi+rc*ql*ql));
	var dx = dx_tmp * cs - dy_tmp * sn;
	var dy = dx_tmp * sn + dy_tmp * cs;

    return [dx, dy];
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

  re = 80;
  r = 150;
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
  var eq = 0.9;
  var maxSize = w * (h - 1) + w - 1;
  index = 0;

  for (y = ymin; y < ymax; y++) {
	index = (xmin + y * w) << 2;
    for (x = xmin; x < xmax; x++) {
	  x1 = x - px;
	  y1 = y - py;
	  d = Math.sqrt(x1 * x1 + y1 * y1);
      if (d <= r) {

		alphas = deflection_nie(px, py, 45, 0.5, re, 0.0, x, y);
		//alphas = deflection_point(px, py, re, x, y);
		xx = Math.round(x - alphas[0]);
		yy = Math.round(y - alphas[1]);

        index2 = ((xx + yy * w) % maxSize) << 2;
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
