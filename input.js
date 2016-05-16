ENTER_KEY = 13;
LEFT_KEY = 37;
RIGHT_KEY = 39;
DOWN_KEY = 40;
UP_KEY = 38;

function Input() {
  this.reset();
}

Input.prototype.setupInputHandler_ = function() {
  var setupHandler = function(listenerCollection) {
    return function(e) {
      this.notifyListeners_(listenerCollection[e.keyCode]);
    }.bind(this);
  }.bind(this);
  document.onkeydown = setupHandler(this.pressListeners_);
  document.onkeyup = setupHandler(this.releaseListeners_);
};

Input.prototype.notifyListeners_ = function(listeners) {
  if (listeners) {
    for (var i in listeners) {
      listeners[i]();
    }
  }
};

Input.prototype.listen_ = function(listenerCollection, key, fn) {
  if (!listenerCollection[key]) {
    listenerCollection[key] = [];
  }
  listenerCollection[key].push(fn);
};

Input.prototype.listenPress = function(key, fn) {
  this.listen_(this.pressListeners_, key, fn);
};

Input.prototype.listenRelease = function(key, fn) {
  this.listen_(this.releaseListeners_, key, fn);
};

Input.prototype.showControls = function(el) {
  var enter = document.createElement('span');
  enter.classList.add('enter');
  this.makeButton_(enter, ENTER_KEY);
  var directions = document.createElement('span');
  this.createDirectionButtons_(directions);
  el.appendChild(directions);
  el.appendChild(enter);
};

Input.prototype.createDirectionButtons_ = function(container) {
  var cells = [];
  for (var i = 0; i < 3; i++) {
    var row = document.createElement('div');
    container.appendChild(row);
    cells.push([]);
    for (var j = 0; j < 3; j++) {
      cells[i][j] = document.createElement('span');
      cells[i][j].classList.add('cell');
      row.appendChild(cells[i][j]);
    }
  }
  this.makeButton_(cells[0][1], UP_KEY);
  this.makeButton_(cells[1][0], LEFT_KEY);
  this.makeButton_(cells[1][2], RIGHT_KEY);
  this.makeButton_(cells[2][1], DOWN_KEY);
};

Input.prototype.makeButton_ = function(el, keyCode) {
  el.classList.add('button');
  el.onmousedown = function() {
    this.notifyListeners_(this.pressListeners_[keyCode]);
  }.bind(this);
  el.onmouseup = function() {
    this.notifyListeners_(this.releaseListeners_[keyCode]);
  }.bind(this);
};

Input.prototype.reset = function() {
  this.pressListeners_ = {};
  this.releaseListeners_ = {};
  this.setupInputHandler_();
};
