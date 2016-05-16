GAMES = [CarGame, Tetris];

function Menu(display, input, startCallback) {
  this.display_ = display;
  this.input_ = input;
  this.startCallback_ = startCallback;
  this.selectionIndex_ = 0;
  this.showPreview_();

  this.setupInputHandlers_();
  this.display_.setMessage('Use Left/Right to browse games and Enter to start game.');
}

Menu.prototype.setupInputHandlers_ = function() {
  this.input_.listenPress(RIGHT_KEY, this.showNext_.bind(this));
  this.input_.listenPress(LEFT_KEY, this.showPrevious_.bind(this));
  this.input_.listenPress(ENTER_KEY, this.startGame_.bind(this));
};

Menu.prototype.showNext_ = function() {
  this.selectionIndex_++;
  if (this.selectionIndex_ === GAMES.length) this.selectionIndex_ = 0;
  this.showPreview_();
};

Menu.prototype.showPrevious_ = function() {
  this.selectionIndex_--;
  if (this.selectionIndex_ === -1) this.selectionIndex_ = GAMES.length - 1;
  this.showPreview_();
};

Menu.prototype.showPreview_ = function() {
  GAMES[this.selectionIndex_].showPreview(this.display_);
};

Menu.prototype.startGame_ = function() {
  this.startCallback_(GAMES[this.selectionIndex_]);
};
