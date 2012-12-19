var URLRequestDefinition = (function () {
  var def = {
    initialize: function () {
      this._url = null;
      this._method = 'GET';
      this._data = null;
      this._digest = null;
      this._contentType = 'application/x-www-form-urlencoded';
      this._requestHeaders = null;
    },

    setMethod: function (val) {
      this._method = val;
    },
    setRequestHeaders: function (val) {
      this._requestHeaders = val;
    },

    get contentType() {
      return this._contentType;
    },
    set contentType(val) {
      this._contentType = val;
    },
    get data() {
      return this._data;
    },
    set data(val) {
      this._data = val;
    },
    get digest() {
      return this._digest;
    },
    set digest(val) {
      this._digest = val;
    },
    get method() {
      return this._method;
    },
    get requestHeaders() {
      return this._requestHeaders;
    },
    get url() {
      return this._url;
    },
    set url(val) {
      this._url= val;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        setMethod: def.setMethod,
        setRequestHeaders: def.setRequestHeaders,
        contentType: desc(def, 'contentType'),
        data: desc(def, 'data'),
        digest: desc(def, 'digest'),
        method: desc(def, 'method'),
        requestHeaders: desc(def, 'requestHeaders'),
        url: desc(def, 'url')
      }
    }
  };

  return def;
}).call(this);
