var SimpleButtonDefinition = (function () {
  var def = {
    __class__: 'flash.display.SimpleButton',

    get downState() {
      return this._downState;
    },
    set downState(val) {
      this._downState = val;
    },
    get hitTestState() {
      return this._hitArea;
    },
    set hitTestState(val) {
      this._hitArea = val;
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
    get useHandCursor() {
      return this._useHandCursor;
    },
    set useHandCursor(val) {
      this._useHandCursor = val;
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2Button().$attachNativeObject(this);
      }
      return this.$as2Object;
    },
    initialize: function () {
      this._downState = null;
      this._hitArea = null;
      this._isMouseDown = false;
      this._isMouseOver = false;
      this._mouseChildren = false;
      this._overState = null;
      this._upState = null;
      this._useHandCursor = true;

      var s = this.symbol;
      if (s) {
        var states = s.states;
        if (states.down)
          this._downState = createState(states.down.value, this);
        if (states.hitTest)
          this._hitArea = createState(states.hitTest.value, this);
        if (states.over)
          this._overState = createState(states.over.value, this);
        if (states.up)
          this._upState = createState(states.up.value, this);
      }

      // binding mouse events
      var MouseEventClass = avm2.systemDomain.getClass("flash.events.MouseEvent");
      this.addEventListener(MouseEventClass.MOUSE_DOWN, function (evt) {
        this._isMouseDown = true;
        this._updateButton();
      }.bind(this), true);
      this.addEventListener(MouseEventClass.MOUSE_OUT, function (evt) {
        this._isMouseOver = false;
        this._updateButton();
      }.bind(this), true);
      this.addEventListener(MouseEventClass.MOUSE_OVER, function (evt) {
        this._isMouseOver = true;
        this._updateButton();
      }.bind(this), true);
      this.addEventListener(MouseEventClass.MOUSE_UP, function (evt) {
        this._isMouseDown = false;
        this._updateButton();
      }.bind(this), true);
    },

    _updateButton: function () {
      this._markAsDirty();

      var state = this._upState;
      if (this._isMouseDown && this._isMouseOver && this._downState)
        state = this._downState;
      else if (this._isMouseOver && this._overState)
        state = this._overState;
      this._children = [state];
    },

    get shouldHaveHandCursor() {
      return this._useHandCursor;
    }
  };

  function createState(symbolInfo, parent) {
    if (!symbolInfo)
      return null;

    var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
      avm2.systemDomain.getClass(symbolInfo.className) :
      avm2.applicationDomain.getClass(symbolInfo.className);
    var props = Object.create(symbolInfo.props);
    props.animated = true;
    props.parent = parent;
    var instance = symbolClass.createAsSymbol(props);
    symbolClass.instance.call(instance);
    return instance;
  }

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        downState: desc(def, "downState"),
        hitTestState: desc(def, "hitTestState"),
        overState: desc(def, "overState"),
        upState: desc(def, "upState"),
        useHandCursor: desc(def, "useHandCursor"),
        _updateButton: def._updateButton,
      }
    }
  };

  return def;
}).call(this);
