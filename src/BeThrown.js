class BeThrown extends Error {
  constructor(params) {
    var message = (params) ? params.message : undefined;
    var fileName = (params) ? params.fileName : undefined;
    var lineNumber = (params) ? params.lineNumber : undefined;

    super(message, fileName, lineNumber);
    Error.captureStackTrace(this, BeThrown);
    
    for (var key in params) {
      if (key != 'message' && key != 'fileName' && key != 'lineNumber') {
        this[key] = params[key];
      }
    }
  };
};

module.exports = BeThrown;
