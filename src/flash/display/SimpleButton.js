const SimpleButtonDefinition = (function () {
  var def = {
    __class__: 'flash.display.SimpleButton',

    get downState() {
      return this._downState;
    },
    set downState(val) {
      this._downState = val;
    },
    get hitTestState() {
      return this._hitTestState;
    },
    set hitTestState(val) {
      this._hitTestState = val;
    },
    get overState() {
      return this._overState;
    },
    set overState(val) {
      this._overState = val;
    },
    get upState() {
      return this._upState;
    },
    set upState(val) {
      this._upState = val;
    },
    get _isContainer() {
      return true;
    },

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this._upState = createSprite(s.states.up, this);
        this._overState = createSprite(s.states.over, this);
        this._downState = createSprite(s.states.down, this);
        this._hitTestState = createSprite(s.states.hitTest, this);
      }
    },

    _updateButton: function () {
      this._children = [this.upState];
    }
  };

  function createSprite(symbolInfo, parent) {
    if (!symbolInfo) {
      return null;
    }
    var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
      avm2.systemDomain.getClass(symbolInfo.className) :
      avm2.applicationDomain.getClass(symbolInfo.className);
    var instance = symbolClass.createAsSymbol(symbolInfo.props);
    symbolClass.instance.call(instance);
    instance._animated = true;
    instance._parent = parent;
    return instance;
  }

  const desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        downState: desc(def, "downState"),
        hitTestState: desc(def, "hitTestState"),
        overState: desc(def, "overState"),
        upState: desc(def, "upState"),
        _updateButton: def._updateButton
      }
    }
  };

  return def;
}).call(this);
