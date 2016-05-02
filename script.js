CANVAS_WIDTH = 640;
CANVAS_HEIGHT = 480;
PIXEL_SIZE = 10;
FOREGROUND_COLOR = 'black';
BACKGROUND_COLOR = 'white';
ROAD_LEFT = 5;
ROAD_LANES = 5;
DOWN = 1;
LEFT = -1;
LEFT_KEY = 37;
RIGHT = 1;
RIGHT_KEY = 39;
UP_KEY = 38;
ENTER_KEY = 13;

function Display() {
  this.initCanvas_(CANVAS_WIDTH, CANVAS_HEIGHT);
  this.pixels_ = [];
  for (var i = 0; i < this.width(); i++) {
    this.pixels_[i] = [];
    for (var j = 0; j < this.height(); j++) {
      this.pixels_[i][j] = this.constructPixel_(i, j);
      this.canvas.add(this.pixels_[i][j]);
    }
  }
}

Display.prototype.initCanvas_ = function(width, height) {
  this.canvas = new fabric.StaticCanvas('canvas');
  this.canvas.setWidth(width);
  this.canvas.setHeight(height);
  this.canvas.renderOnAddRemove = false;
};

Display.prototype.constructPixel_ = function(x, y) {
  var pixel = new fabric.Group();
  pixel.add(new fabric.Rect({left: x*PIXEL_SIZE, top: y*PIXEL_SIZE, width: PIXEL_SIZE, height: PIXEL_SIZE, stroke: FOREGROUND_COLOR, fill: BACKGROUND_COLOR, strokeWidth: 2, selectable: false, hasControls: false, hasBorders: false}));
  pixel.add(new fabric.Rect({left: x*PIXEL_SIZE+4, top: y*PIXEL_SIZE+4, width: 4, height: 4, fill: FOREGROUND_COLOR, selectable: false, hasControls: false, hasBorder: false}));
  pixel.visible = false;
  return pixel;
};

Display.prototype.height = function() {
  return CANVAS_HEIGHT / PIXEL_SIZE;
};

Display.prototype.width = function() {
  return CANVAS_WIDTH / PIXEL_SIZE;
};

Display.prototype.show_ = function(x, y) {
  if (x < 0 || x >= this.width() || y < 0 || y >= this.height()) return;
  this.pixels_[x][y].visible = true;
};

Display.prototype.showVLine_ = function(x) {
  for (var i = 0; i < this.height(); i++) {
    this.show_(x, i);
  }
};

Display.prototype.showPixels = function(points) {
  for (var i = 0; i < points.length; i++) {
    this.show_(points[i][0], points[i][1]);
  }
};

Display.prototype.hideAll_ = function() {
  for (var i = 0; i < this.width(); i++) {
    for (var j = 0; j < this.height(); j++) {
      this.pixels_[i][j].visible = false;
    }
  }
};

Display.prototype.renderAll = function() {
  this.canvas.renderAll();
};

function Car(x, y) {
  this.x_ = x;
  this.y_ = y;
}

Car.WIDTH = 3;
Car.HEIGHT = 4;

Car.prototype.move = function(dx, dy) {
  this.x_ += dx;
  this.y_ += dy;
};

Car.prototype.x = function() {
  return this.x_;
};

Car.prototype.y = function() {
  return this.y_;
};

Car.prototype.getPixels = function() {
  var points = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [0, 3], [2, 3]];
  for (var i = 0; i < points.length; i++) {
    points[i][0] += this.x_;
    points[i][1] += this.y_;
  }
  return points;
};

function GameController(display) {
  this.display_ = display;

  this.setupInputHandler_();
  this.playerCar_ = new Car(ROAD_LEFT + 1, this.display_.height() - Car.HEIGHT - 1);
  this.otherCars_ = [];
  this.otherCars_.push(this.newCar_());
  this.currentSpeed_ = 2;
  this.resetSpeed_(2);
  this.gameOver_ = false;
  this.score_ = 0;
  this.nitro_ = null;
  var self = this;
  var level = document.getElementById('level');
  var score = document.getElementById('score');
  level.innerText = '1';
  score.innerText = '0';
  this.speedTicker_ = setInterval(function() {
    level.innerText = self.currentSpeed_++;
    self.resetSpeed_(self.currentSpeed_);
  }, 5000);
  this.scoreTicker_ = setInterval(function() {
    score.innerText = self.score_;
  }, 500);
}

GameController.prototype.resetSpeed_ = function(speed) {
  if (this.ticker_) {
    clearInterval(this.ticker_);
  }
  this.ticker_ = setInterval(this.tick_.bind(this), Math.ceil(600 / speed));
};

GameController.prototype.tick_ = function() {
  this.score_++;
  this.otherCars_.forEach(function(car) {
    car.move(0, DOWN);
  });
  if (this.checkPlayerCollision_()) {
    this.endGame_();
  }
  if (this.otherCars_.length > 0 && this.otherCars_[0].y() > this.display_.height()) {
    this.otherCars_.shift();
  }
  if (this.shouldAddAnotherCar_()) {
    var car = this.newCar_();
    if (!this.checkCollision_(car, this.otherCars_)) {
      this.otherCars_.push(car);
    }
  }
  this.render_();
};

GameController.prototype.setupInputHandler_ = function() {
  var self = this;
  document.onkeydown = function(e) {
    var direction = 0;
    if (e.keyCode === LEFT_KEY)
      direction = LEFT;
    else if (e.keyCode === RIGHT_KEY)
      direction = RIGHT;
    if (direction !== 0) {
      self.playerCar_.move(direction, 0);
      if (self.checkPlayerCollision_()) {
        self.endGame_();
      }
      self.render_();
    }
    if (e.keyCode === UP_KEY) {
      self.activateNitro_();
    }
  };
};

GameController.prototype.activateNitro_ = function() {
  if (!this.nitro_) {
    var self = this;
    this.resetSpeed_(this.currentSpeed_ * 3);
    this.nitro_ = setTimeout(function() {
      self.resetSpeed_(self.currentSpeed_);
      self.nitro_ = null;
    }, 1000);
  }
};

GameController.prototype.endGame_ = function() {
  clearInterval(this.ticker_);
  clearInterval(this.speedTicker_);
  clearInterval(this.scoreTicker_);
  if (this.nitro_) {
    clearTimeout(this.nitro_);
  }
  var restart = document.getElementById('restart');
  restart.style.display = '';
  document.onkeydown = function(e) {
    if (e.keyCode === ENTER_KEY) {
      restart.style.display = 'none';
      restartGame();
    }
  };
  this.gameOver_ = true;
};

GameController.prototype.shouldAddAnotherCar_ = function() {
  return Math.random() < 0.1;
};

GameController.prototype.render_ = function() {
  this.display_.hideAll_();
  // Draw road
  this.display_.showVLine_(ROAD_LEFT);
  this.display_.showVLine_(ROAD_LEFT + Car.WIDTH * ROAD_LANES + 1);

  this.display_.showPixels(this.playerCar_.getPixels());

  var self = this;
  this.otherCars_.forEach(function(car) {
    self.display_.showPixels(car.getPixels());
  });

  if (this.gameOver_) {
    this.display_.showPixels(this.getGameOverPixels_());
  }
  this.display_.renderAll();
};

GameController.prototype.checkPlayerCollision_ = function() {
  var playerX = this.playerCar_.x();
  if (playerX === ROAD_LEFT || playerX + Car.WIDTH === ROAD_LEFT + Car.WIDTH * ROAD_LANES + 2) {
    return true;
  }
  return this.checkCollision_(this.playerCar_, this.otherCars_);
};

GameController.prototype.checkCollision_ = function(car, cars) {
  var self = this;
  var occupied = {};
  var encode = function(pixel) {
    return pixel[0] * self.display_.width() + pixel[1];
  };
  car.getPixels().forEach(function(pixel) {
    occupied[encode(pixel)] = true;
  });
  var intersect = function(pixels) {
    return pixels.some(function(pixel) {
      return occupied[encode(pixel)];
    });
  };
  return cars.some(function(car) {
    return intersect(car.getPixels());
  });
};

GameController.prototype.getGameOverPixels_ = function() {
  var G = [[1, 0], [2, 0], [3, 0], [0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 3], [4, 2], [3, 2]];
  var A = [[7, 0], [8, 0], [9, 0], [6, 1], [10, 1], [6, 2], [10, 2], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [6, 4], [10, 4]];
  var M = [[12, 0], [16, 0], [12, 1], [13, 1], [15, 1], [16, 1], [12, 2], [14, 2], [16, 2], [12, 3], [16, 3], [12, 4], [16, 4]];
  var E = [[18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [18, 1], [18, 2], [19, 2], [20, 2], [21, 2], [18, 3], [18, 4], [19, 4], [20, 4], [21, 4], [22, 4]];
  var O = [[1, 6], [2, 6], [3, 6], [0, 7], [4, 7], [0, 8], [4, 8], [0, 9], [4, 9], [1, 10], [2, 10], [3, 10]];
  var V = [[6, 6], [10, 6], [6, 7], [10, 7], [6, 8], [10, 8], [7, 9], [9, 9], [8, 10]];
  var EE = [[12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [12, 7], [12, 8], [13, 8], [14, 8], [15, 8], [12, 9], [12, 10], [13, 10], [14, 10], [15, 10], [16, 10]];
  var R = [[18, 6], [19, 6], [20, 6], [21, 6], [18, 7], [22, 7], [18, 8], [19, 8], [20, 8], [21, 8], [18, 9], [20, 9], [18, 10], [21, 10]];
  return G.concat(A,M,E,O,V,EE,R).map(function(pixel) {
    return [ROAD_LEFT + Car.WIDTH * ROAD_LANES + 3 + pixel[0], 1 + pixel[1]];
  });
};

GameController.prototype.newCar_ = function() {
  var left = ROAD_LEFT + 1 + Car.WIDTH * Math.floor(Math.random() * ROAD_LANES);
  return new Car(left, 1 - Car.HEIGHT);
};

function restartGame() {
  gc = new GameController(new Display());
}
restartGame();
