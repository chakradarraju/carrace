CANVAS_WIDTH = 640;
CANVAS_HEIGHT = 480;
PIXEL_SIZE = 10;

FOREGROUND_COLOR = 'black';
BACKGROUND_COLOR = 'white';

function Display() {
  this.initCanvas_(CANVAS_WIDTH, CANVAS_HEIGHT);
  this.level_ = document.getElementById('level');
  this.score_ = document.getElementById('score');
  this.pixels_ = [];
  for (var i = 0; i < this.width(); i++) {
    this.pixels_[i] = [];
    for (var j = 0; j < this.height(); j++) {
      this.pixels_[i][j] = this.constructPixel_(i, j);
      this.canvas_.add(this.pixels_[i][j]);
    }
  }
  this.reset();
}

Display.prototype.initCanvas_ = function(width, height) {
  this.canvas_ = new fabric.StaticCanvas('canvas');
  this.canvas_.setWidth(width);
  this.canvas_.setHeight(height);
  this.canvas_.renderOnAddRemove = false;
};

Display.prototype.constructPixel_ = function(x, y) {
  var pixel = new fabric.Group();
  pixel.add(new fabric.Rect({left: x*PIXEL_SIZE, top: y*PIXEL_SIZE, width: PIXEL_SIZE, height: PIXEL_SIZE, stroke: FOREGROUND_COLOR, fill: BACKGROUND_COLOR, strokeWidth: 2, selectable: false, hasControls: false, hasBorders: false}));
  pixel.add(new fabric.Rect({left: x*PIXEL_SIZE+4, top: y*PIXEL_SIZE+4, width: 4, height: 4, fill: FOREGROUND_COLOR, selectable: false, hasControls: false, hasBorder: false}));
  return pixel;
};

Display.prototype.height = function() {
  return CANVAS_HEIGHT / PIXEL_SIZE;
};

Display.prototype.width = function() {
  return CANVAS_WIDTH / PIXEL_SIZE;
};

Display.prototype.show = function(x, y) {
  if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) return;
  this.pixels_[x][y].visible = true;
};

Display.prototype.hide = function(x, y) {
  if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) return;
  this.pixels_[x][y].visible = false;
};

Display.prototype.showPixels = function(points) {
  for (var i = 0; i < points.length; i++) {
    this.show(points[i][0], points[i][1]);
  }
};

Display.prototype.reset = function() {
  for (var i = 0; i < this.width(); i++) {
    for (var j = 0; j < this.height(); j++) {
      this.pixels_[i][j].visible = false;
    }
  }
};

Display.prototype.render = function() {
  this.canvas_.renderAll();
};

Display.prototype.updateLevel = function(level) {
  this.level_.innerText = level;
};

Display.prototype.updateScore = function(score) {
  this.score_.innerText = score;
};

