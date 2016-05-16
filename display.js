ARENA_WIDTH = 12;
ARENA_HEIGHT = 30;
PIXEL_SIZE = 10;

FOREGROUND_COLOR = 'black';
BACKGROUND_COLOR = 'white';

function Display(el) {
  this.el_ = el;
  this.initArena_();
  this.initOutputs_();
  this.reset();
}

Display.prototype.initArena_ = function() {
  var canvas = document.createElement('canvas');
  canvas.classList.add('arena');
  this.el_.appendChild(canvas);
  this.canvas_ = new fabric.StaticCanvas(canvas);
  this.canvas_.setWidth(this.width() * PIXEL_SIZE + 2);
  this.canvas_.setHeight(this.height() * PIXEL_SIZE + 2);
  this.canvas_.renderOnAddRemove = false;
  this.initPixels_();
};

Display.prototype.initPixels_ = function() {
  this.pixels_ = [];
  for (var i = 0; i < this.width(); i++) {
    this.pixels_[i] = [];
    for (var j = 0; j < this.height(); j++) {
      this.pixels_[i][j] = this.constructPixel_(i, j);
      this.canvas_.add(this.pixels_[i][j]);
    }
  }
};

Display.prototype.initOutputs_ = function() {
  var container = document.createElement('span');
  container.classList.add('output');
  this.el_.appendChild(container);
  this.level_ = Display.createOutput_(container, 'Level: ');
  this.score_ = Display.createOutput_(container, 'Score: ');
  this.message_ = Display.createOutput_(container, '');
};

Display.createOutput_ = function(parentEl, labelText) {
  var container = document.createElement('div');
  var label = document.createElement('span');
  var value = document.createElement('span');
  label.innerText = labelText;
  container.appendChild(label);
  container.appendChild(value);
  parentEl.appendChild(container);
  return value;
};

Display.prototype.constructPixel_ = function(x, y) {
  var pixel = new fabric.Group();
  pixel.add(new fabric.Rect({left: x*PIXEL_SIZE, top: y*PIXEL_SIZE, width: PIXEL_SIZE, height: PIXEL_SIZE, stroke: FOREGROUND_COLOR, fill: BACKGROUND_COLOR, strokeWidth: 2, selectable: false, hasControls: false, hasBorders: false}));
  pixel.add(new fabric.Rect({left: x*PIXEL_SIZE+4, top: y*PIXEL_SIZE+4, width: 4, height: 4, fill: FOREGROUND_COLOR, selectable: false, hasControls: false, hasBorder: false}));
  return pixel;
};

Display.prototype.height = function() {
  return ARENA_HEIGHT;
};

Display.prototype.width = function() {
  return ARENA_WIDTH;
};

Display.prototype.show = function(x, y) {
  this.setVisible(x, y, true);
};

Display.prototype.hide = function(x, y) {
  this.setVisible(x, y, false);
};

Display.prototype.setVisible = function(x, y, visible) {
  if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) return;
  this.pixels_[x][y].visible = visible;
};

Display.prototype.isVisible = function(x, y) {
  if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) return;
  return this.pixels_[x][y].visible;
};

Display.prototype.showPixels = function(points) {
  for (var i = 0; i < points.length; i++) {
    this.show(points[i][0], points[i][1]);
  }
};

Display.prototype.hidePixels = function(points) {
  for (var i = 0; i < points.length; i++) {
    this.hide(points[i][0], points[i][1]);
  }
};

Display.prototype.reset = function() {
  this.setLevel(0);
  this.setScore(0);
  this.setMessage('');
  this.clearArena();
};

Display.prototype.clearArena = function() {
  for (var i = 0; i < this.width(); i++) {
    for (var j = 0; j < this.height(); j++) {
      this.pixels_[i][j].visible = false;
    }
  }
};

Display.prototype.render = function() {
  this.canvas_.renderAll();
};

Display.prototype.setLevel = function(level) {
  this.level_.innerText = level;
};

Display.prototype.setScore = function(score) {
  this.score_.innerText = score;
};

Display.prototype.setMessage = function(message) {
  this.message_.innerText = message;
};
