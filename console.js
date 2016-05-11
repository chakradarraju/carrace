function Console() {
  this.restartGame_();
}

Console.prototype.restartGame_ = function() {
  this.display_ = new Display();
  this.input_ = new Input();
  this.game_ = new CarGame(this.display_, this.input_, this.onGameOver_.bind(this));
};

Console.prototype.onGameOver_ = function() {
  this.showGameOver_();
  var restart = document.getElementById('restart');
  var self = this;
  restart.style.display = '';
  this.input_.listenPress(ENTER_KEY, function() {
    restart.style.display = 'none';
    self.restartGame_();
  });
};

Console.prototype.showGameOver_ = function() {
  var G = [[1, 0], [2, 0], [3, 0], [0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 3], [4, 2], [3, 2]];
  var A = [[7, 0], [8, 0], [9, 0], [6, 1], [10, 1], [6, 2], [10, 2], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [6, 4], [10, 4]];
  var M = [[12, 0], [16, 0], [12, 1], [13, 1], [15, 1], [16, 1], [12, 2], [14, 2], [16, 2], [12, 3], [16, 3], [12, 4], [16, 4]];
  var E = [[18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [18, 1], [18, 2], [19, 2], [20, 2], [21, 2], [18, 3], [18, 4], [19, 4], [20, 4], [21, 4], [22, 4]];
  var O = [[1, 6], [2, 6], [3, 6], [0, 7], [4, 7], [0, 8], [4, 8], [0, 9], [4, 9], [1, 10], [2, 10], [3, 10]];
  var V = [[6, 6], [10, 6], [6, 7], [10, 7], [6, 8], [10, 8], [7, 9], [9, 9], [8, 10]];
  var EE = [[12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [12, 7], [12, 8], [13, 8], [14, 8], [15, 8], [12, 9], [12, 10], [13, 10], [14, 10], [15, 10], [16, 10]];
  var R = [[18, 6], [19, 6], [20, 6], [21, 6], [18, 7], [22, 7], [18, 8], [19, 8], [20, 8], [21, 8], [18, 9], [20, 9], [18, 10], [21, 10]];
  var containerWidth = 25;
  var containerHeight = 13;
  var offsetLeft = Math.floor(this.display_.width() / 2 - containerWidth / 2);
  var offsetTop = Math.floor(this.display_.height() / 2 - containerHeight / 2);
  for (var i = 0; i < containerWidth; i++) {
    for (var j = 0; j < containerHeight; j++) {
      this.display_.hide(offsetLeft + i, offsetTop + j);
    }
  }
  var self = this;
  G.concat(A,M,E,O,V,EE,R).forEach(function(pixel) {
    self.display_.show(offsetLeft + 1 + pixel[0], offsetTop + 1 + pixel[1]);
  });
  this.display_.render();
};

var c = new Console();
