ROAD_LEFT = 1;
ROAD_LANES = 3;

DOWN = 1;
LEFT = -1;
RIGHT = 1;

LEFT_KEY = 37;
RIGHT_KEY = 39;
UP_KEY = 38;

function CarGame(display, input, endCallback) {
  this.display_ = display;
  this.input_ = input;
  this.endCallback_ = endCallback;

  this.setupInputHandler_();
  this.setupCars_();
  this.setupSpeed_();
  this.setupScore_();
}

CarGame.prototype.setupInputHandler_ = function() {
  this.input_.listenPress(LEFT_KEY, this.movePlayerLeft_.bind(this));
  this.input_.listenPress(RIGHT_KEY, this.movePlayerRight_.bind(this));
  this.input_.listenPress(UP_KEY, this.activateNitro_.bind(this));
  this.input_.listenRelease(UP_KEY, this.deactivateNitro_.bind(this));
};

CarGame.prototype.movePlayerLeft_ = function() {
  this.movePlayer_(LEFT);
};

CarGame.prototype.movePlayerRight_ = function() {
  this.movePlayer_(RIGHT);
};

CarGame.prototype.movePlayer_ = function(direction) {
  this.moveCar_(this.playerCar_, direction, 0);
  this.display_.render();
  if (this.checkPlayerCollision_()) {
    this.endGame_();
  }
};

CarGame.prototype.moveCar_ = function(car, x, y) {
  this.display_.hidePixels(car.getPixels(), x, y);
  car.move(x, y);
  this.display_.showPixels(car.getPixels(), x, y);
};

CarGame.prototype.setupCars_ = function() {
  CarGame.drawRoads(this.display_);
  this.playerCar_ = new Car(ROAD_LEFT + 1, this.display_.height() - Car.HEIGHT - 1);
  this.display_.showPixels(this.playerCar_.getPixels());
  this.otherCars_ = [];
  this.otherCars_.push(CarGame.newCar());
};

CarGame.prototype.setupSpeed_ = function() {
  this.nitro_ = false;
  this.setLevel_(1);
  this.speedTicker_ = setInterval(function() {
    this.setLevel_(this.getLevel() + 1);
  }.bind(this), 5000);
};

CarGame.prototype.getLevel = function() {
  return this.level_;
};

CarGame.prototype.setLevel_ = function(level) {
  this.level_ = level;
  this.display_.setLevel(level);
  if (this.ticker_) {
    clearInterval(this.ticker_);
  }
  this.ticker_ = setInterval(this.tick_.bind(this), Math.ceil(600 / (level + 1)));
};

CarGame.prototype.setupScore_ = function() {
  this.score_ = 0;
  this.display_.setScore(0);
  this.scoreTicker_ = setInterval(function() {
    this.display_.setScore(this.getScore());
  }.bind(this), 500);
};

CarGame.prototype.activateNitro_ = function() {
  this.nitro_ = true;
};

CarGame.prototype.deactivateNitro_ = function() {
  this.nitro_ = false;
};

CarGame.prototype.shouldAddAnotherCar_ = function() {
  return Math.random() < 0.1;
};

CarGame.prototype.tick_ = function() {
  var displacement = this.nitro_ ? 2 * DOWN : DOWN;
  this.score_ += displacement;
  this.otherCars_.forEach(function(car) {
    this.moveCar_(car, 0, displacement);
  }.bind(this));
  if (this.otherCars_.length > 0 && this.otherCars_[0].y() > this.display_.height()) {
    this.otherCars_.shift();
  }
  if (this.shouldAddAnotherCar_()) {
    var car = CarGame.newCar();
    if (!this.checkCollision_(car, this.otherCars_)) {
      this.otherCars_.push(car);
    }
  }
  this.display_.render();
  if (this.checkPlayerCollision_()) {
    this.endGame_();
  }
};

CarGame.prototype.checkPlayerCollision_ = function() {
  var playerX = this.playerCar_.x();
  if (playerX === ROAD_LEFT || playerX + Car.WIDTH === ROAD_LEFT + Car.WIDTH * ROAD_LANES + 2) {
    return true;
  }
  return this.checkCollision_(this.playerCar_, this.otherCars_);
};

CarGame.prototype.checkCollision_ = function(car, cars) {
  var occupied = {};
  var encode = function(pixel) {
    return pixel[1] * this.display_.width() + pixel[0];
  }.bind(this);
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

CarGame.prototype.getScore = function() {
  return this.score_;
};

CarGame.prototype.endGame_ = function() {
  clearInterval(this.ticker_);
  clearInterval(this.speedTicker_);
  clearInterval(this.scoreTicker_);
  this.input_.reset();
  this.endCallback_();
};

CarGame.drawRoads = function(display) {
  for (var i = 0; i < display.height(); i++) {
    display.show(ROAD_LEFT, i);
    display.show(ROAD_LEFT + Car.WIDTH * ROAD_LANES + 1, i);
  }
};

CarGame.newCar = function() {
  var left = ROAD_LEFT + 1 + Car.WIDTH * Math.floor(Math.random() * ROAD_LANES);
  return new Car(left, 1 - Car.HEIGHT);
};

CarGame.showPreview = function(display) {
  display.clearArena();
  CarGame.drawRoads(display);
  for (var i = 0; i < display.height() / 10; i++) {
    var car = CarGame.newCar();
    car.move(0, DOWN * 10 * i);
    display.showPixels(car.getPixels());
  }
  display.render();
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
