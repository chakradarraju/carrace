LEFT = -1;
RIGHT = 1;

LEFT_WALL = 5;
RIGHT_WALL = 20;

LEFT_KEY = 37;
RIGHT_KEY = 39;
DOWN_KEY = 40;
UP_KEY = 38;

function Tetris(display, input, endCallback) {
  this.display_ = display;
  this.input_ = input;
  this.endCallback_ = endCallback;

  this.setupInputHandlers_();
  this.setupSpeed_();
  this.setupScore_();
  this.setupBlocks_();
}

Tetris.prototype.setupInputHandlers_ = function() {
  this.input_.listenPress(LEFT_KEY, this.moveLeft_.bind(this));
  this.input_.listenPress(RIGHT_KEY, this.moveRight_.bind(this));
  this.input_.listenPress(DOWN_KEY, this.putDown_.bind(this));
  this.input_.listenPress(UP_KEY, this.rotate_.bind(this));
};

Tetris.prototype.moveLeft_ = function() {
  if (!this.canMoveLeft_(this.currentBlock_)) return;
  this.moveBlock_(this.currentBlock_, LEFT, 0);
  this.display_.render();
};

Tetris.prototype.moveRight_ = function() {
  if (!this.canMoveRight_(this.currentBlock_)) return;
  this.moveBlock_(this.currentBlock_, RIGHT, 0);
  this.display_.render();
};

Tetris.prototype.putDown_ = function() {
  while (this.canMoveDown_(this.currentBlock_)) {
    this.moveBlock_(this.currentBlock_, 0, DOWN);
  }
  this.display_.render();
};

Tetris.prototype.rotate_ = function() {
  if (!this.canRotate_(this.currentBlock_)) return;
  this.rotateBlock_(this.currentBlock_);
  this.display_.render();
};

Tetris.prototype.setupSpeed_ = function() {
  this.setLevel_(1);
  this.speedTicker_ = setInterval(function() {
    this.setLevel_(this.getLevel() + 1);
  }.bind(this), 30000);
};

Tetris.prototype.getLevel = function() {
  return this.level_;
};

Tetris.prototype.setLevel_ = function(level) {
  this.level_ = level;
  this.display_.updateLevel(level);
  if (this.ticker_) {
    clearInterval(this.ticker_);
  }
  this.ticker_ = setInterval(this.tick_.bind(this), Math.ceil(600 / (level + 3)));
};

Tetris.prototype.setupScore_ = function() {
  this.score_ = 0;
  this.display_.updateScore(0);
};

Tetris.prototype.getScore = function() {
  return this.score_;
};

Tetris.prototype.setupBlocks_ = function() {
  Tetris.drawWalls(this.display_);
  this.currentBlock_ = Tetris.generateNewBlock();
  this.nextBlock_ = Tetris.generateNewBlock();
};

Tetris.prototype.tick_ = function() {
  if (!this.canMoveDown_(this.currentBlock_)) {
    if (this.reachedTop_(this.currentBlock_)) {
      this.endGame_();
    }
    this.cleanupFullLines_();
    this.currentBlock_ = this.nextBlock_;
    this.nextBlock_ = Tetris.generateNewBlock();
  }
  this.moveBlock_(this.currentBlock_, 0, DOWN);
  this.display_.render();
};

Tetris.prototype.cleanupFullLines_ = function() {
  var cur = this.display_.height() - 2;
  for (var i = this.display_.height() - 2; i >= 0; i--) {
    if (i != cur) {
      this.copyLine_(i, cur);
    }
    if (!this.isLineFull_(i)) {
      cur--;
    } else {
      this.score_ += 10;
    }
  }
  for (var y = cur; y >= 0; y--) {
    for (var x = LEFT_WALL + 1; x < RIGHT_WALL; x++) {
      this.display_.hide(x, y);
    }
  }
  this.display_.updateScore(this.getScore());
};

Tetris.prototype.isLineFull_ = function(y) {
  for (var i = LEFT_WALL + 1; i < RIGHT_WALL; i++) {
    if (!this.display_.isVisible(i, y)) {
      return false;
    }
  }
  return true;
};

Tetris.prototype.copyLine_ = function(src, dest) {
  for (var i = LEFT_WALL + 1; i < RIGHT_WALL; i++) {
    this.display_.setVisible(i, dest, this.display_.isVisible(i, src));
  }
};

Tetris.prototype.moveBlock_ = function(block, x, y) {
  this.display_.hidePixels(block.getPixels());
  block.move(x, y);
  this.display_.showPixels(block.getPixels());
};

Tetris.prototype.rotateBlock_ = function(block) {
  this.display_.hidePixels(block.getPixels());
  block.rotate();
  this.display_.showPixels(block.getPixels());
};

Tetris.prototype.canMoveLeft_ = function(block) {
  return this.canMove_(block, LEFT, 0);
};

Tetris.prototype.canMoveRight_ = function(block) {
  return this.canMove_(block, RIGHT, 0);
};

Tetris.prototype.canMoveDown_ = function(block) {
  return this.canMove_(block, 0, DOWN);
};

Tetris.prototype.canMove_ = function(block, dx, dy) {
  var pixels = block.getPixels();
  return this.canChange_(pixels, Block.movedPixels(pixels, dx, dy));
};

Tetris.prototype.canRotate_ = function(block) {
  return this.canChange_(block.getPixels(), block.getRotatedPixels());
};

Tetris.prototype.canChange_ = function(oldPixels, newPixels) {
  this.display_.hidePixels(oldPixels);
  var ret = this.isEmpty_(newPixels);
  this.display_.showPixels(oldPixels);
  return ret;
};

Tetris.prototype.isEmpty_ = function(pixels) {
  return pixels.every(function(pixel) {
    return !this.display_.isVisible(pixel[0], pixel[1]);
  }.bind(this));
};

Tetris.prototype.reachedTop_ = function(block) {
  return block.getPixels().some(function(pixel) {
    return pixel[1] == 1;
  });
};

Tetris.prototype.endGame_ = function() {
  clearInterval(this.ticker_);
  clearInterval(this.speedTicker_);
  this.input_.reset();
  this.endCallback_();
};

Tetris.generateNewBlock = function() {
  var block = Blocks[Math.floor(Math.random() * Blocks.length)];
  return new Block(Math.floor((LEFT_WALL + RIGHT_WALL) / 2) - 2, 0, block);
};

Tetris.drawWalls = function(display) {
  for (var i = 0; i < display.height(); i++) {
    display.show(LEFT_WALL, i);
    display.show(RIGHT_WALL, i);
  }
  for (var i = LEFT_WALL + 1; i < RIGHT_WALL; i++) {
    display.show(i, display.height() - 1);
  }
};

Tetris.showPreview = function(display) {
  display.reset();
  Tetris.drawWalls(display);
  for (var i = 0; i < display.height() / 10; i++) {
    var block = Tetris.generateNewBlock();
    block.move(0, DOWN * 10 * i);
    display.showPixels(block.getPixels());
  }
  display.render();
};

function Block(x, y, pixels) {
  this.x_ = x;
  this.y_ = y;
  this.pixels_ = Block.movedPixels(pixels, x, y);
};

Block.prototype.getPixels = function() {
  return this.pixels_;
};

Block.prototype.getRotatedPixels = function() {
  return this.pixels_.map(function(pixel) {
    return [this.x_ - this.y_ + pixel[1], this.x_ + this.y_ - pixel[0]];
  }.bind(this));
};

Block.prototype.move = function(dx, dy) {
  this.x_ += dx;
  this.y_ += dy;
  this.pixels_ = Block.movedPixels(this.pixels_, dx, dy);
};

Block.prototype.rotate = function() {
  this.pixels_ = this.getRotatedPixels();
};

Block.movedPixels = function(pixels, dx, dy) {
  return pixels.map(function(pixel) {
    return [pixel[0] + dx, pixel[1] + dy];
  });
};

Blocks = [
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[-1, -1], [-1, 0], [0, 0], [1, 0]],
  [[-1, 1], [-1, 0], [0, 0], [1, 0]],
  [[0, -1], [0, 0], [0, 1], [0, 2]],
  [[-1, 0], [0, -1], [0, 0], [1, 0]],
  [[0, -1], [0, 0], [1, 0], [1, 1]],
  [[1, -1], [1, 0], [0, 0], [0, -1]],
];
