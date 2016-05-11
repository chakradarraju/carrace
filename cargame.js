ROAD_LEFT = 5;
ROAD_LANES = 5;

DOWN = 1;
LEFT = -1;
RIGHT = 1;

LEFT_KEY = 37;
RIGHT_KEY = 39;
UP_KEY = 38;
ENTER_KEY = 13;

function CarGame(display, input, endCallback) {
  this.display_ = display;
  this.input_ = input;
  this.endCallback_ = endCallback;

  // Setup cars
  this.playerCar_ = new Car(ROAD_LEFT + 1, this.display_.height() - Car.HEIGHT - 1);
  this.otherCars_ = [];
  this.otherCars_.push(this.newCar_());

  this.setupInputHandler_();

  this.nitro_ = false;
  this.currentSpeed_ = 2;
  this.score_ = 0;
  this.resetSpeed_(2);
  this.display_.updateLevel(1);
  this.display_.updateScore(0);
  var self = this;
  this.speedTicker_ = setInterval(function() {
    level.innerText = self.currentSpeed_++;
    self.resetSpeed_(self.currentSpeed_);
  }, 5000);
  this.scoreTicker_ = setInterval(function() {
    score.innerText = self.getScore();
  }, 500);
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
  this.playerCar_.move(direction, 0);
  this.render_();
  if (this.checkPlayerCollision_()) {
    this.endGame_();
  }
};

CarGame.prototype.activateNitro_ = function() {
  this.nitro_ = true;
};

CarGame.prototype.deactivateNitro_ = function() {
  this.nitro_ = false;
};

CarGame.prototype.resetSpeed_ = function(speed) {
  if (this.ticker_) {
    clearInterval(this.ticker_);
  }
  this.ticker_ = setInterval(this.tick_.bind(this), Math.ceil(600 / speed));
};


CarGame.prototype.newCar_ = function() {
  var left = ROAD_LEFT + 1 + Car.WIDTH * Math.floor(Math.random() * ROAD_LANES);
  return new Car(left, 1 - Car.HEIGHT);
};

CarGame.prototype.shouldAddAnotherCar_ = function() {
  return Math.random() < 0.1;
};

CarGame.prototype.tick_ = function() {
  var displacement = this.nitro_ ? 2 * DOWN : DOWN;
  this.score_ += displacement;
  this.otherCars_.forEach(function(car) {
    car.move(0, displacement);
  });
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

CarGame.prototype.render_ = function() {
  this.display_.reset();
  // Draw road
  for (var i = 0; i < this.display_.height(); i++) {
    this.display_.show(ROAD_LEFT, i);
    this.display_.show(ROAD_LEFT + Car.WIDTH * ROAD_LANES + 1, i);
  }

  this.display_.showPixels(this.playerCar_.getPixels());

  var self = this;
  this.otherCars_.forEach(function(car) {
    self.display_.showPixels(car.getPixels());
  });

  if (this.gameOver_) {
  }
  this.display_.render();
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
