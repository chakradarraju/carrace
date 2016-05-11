function Input() {
  this.reset();
}

Input.prototype.setupInputHandler_ = function() {
  var setupHandler = function(listenerCollection) {
    return function(e) {
      var listeners = listenerCollection[e.keyCode];
      if (listeners) {
        for (var i in listeners) {
          listeners[i]();
        }
      }
    }
  };
  document.onkeydown = setupHandler(this.pressListeners_);
  document.onkeyup = setupHandler(this.releaseListeners_);
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

Input.prototype.reset = function() {
  this.pressListeners_ = {};
  this.releaseListeners_ = {};
  this.setupInputHandler_();
};
