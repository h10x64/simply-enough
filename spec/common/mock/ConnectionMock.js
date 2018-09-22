class ConnectionMock {
  constructor(params) {
    var params = params || {};

    this.raiseCreateConnectionError = params.raiseCreateConnectionError || false;
    this.raiseBeginTransactionError = params.raiseBeginTransactionError || false;
    this.raiseCommitError = params.raiseCommitError || false;
    this.raiseQueryError = params.raiseQueryError || false;

    this.lastParams = {
      createConnection: undefined,
      beginTransaction: undefined,
      commit: undefined,
      rollback: undefined,
      query: undefined,
      end: undefined,
    };
  };

  // mysqlモジュールをモックに置き換えたSimplyEnoughのインスタンスを作成するメソッド
  // Create instance that mysql module replaced by connectionMock
  static createMockedSEInstance(SE, connectionMock, configArg) {
    // 'simply-enough'モジュール上の'mysql'モジュールを上書き
    // Overwrite 'mysql' module on the 'simply-enough' module
    SE.__set__('mysql', {
      createConnection: ()=>{
        connectionMock.lastParams.createConnection = {};
        if (connectionMock.raiseCreateConnectionError) {
          var errMsg = "!!! CREATE_CONNECTION_ERROR_TEST !!!";
          console.log(errMsg);
          throw errMsg;
        }
        return connectionMock;
      },
    });
    
    // 新しいオブジェクトを作る
    // Create new object.
    var ret = new SE({
      config: configArg
    });

    return ret;
  };

  /* METHODS */

  // 'mysql'モジュールのConnectionインスタンスのモックメソッドです。
  // これらのメソッドは、呼び出し時の引数を lastParams.*METHOD_NAME* に保存します。
  // また、this.raise*METHOD_NAME*Errorが設定されていた場合、(形式に沿っていない)エラーを投げます。
  // Mock up 'mysql'module's Connection instance.
  // These methods stores all arguments into the lastParams.*METHOD_NAME*.
  // And, thrown some (informal) error if this.raise*METHOD_NAME*Error was setted.

  beginTransaction(options, callback) {
    this.lastParams.beginTransaction = {
      options: options,
      callback: callback
    };

    var cb = callback;
    if (!callback && typeof options === 'function') {
      cb = options;
    }

    if (this.raiseBeginTransactionError) {
      console.error("!!! BEGIN_TRANSASTION_ERROR_TEST !!!");
      cb("BEGIN_TRANSACTION_ERROR");
      return;
    }

    cb(undefined);
  };

  commit(options, callback) {
    this.lastParams.commit = {
      options: options,
      callback: callback
    };

    var cb = callback;
    if (!callback && typeof options === 'function') {
      cb = options;
    }

    if (this.raiseCommitError) {
      console.error("!!! COMMIT_ERROR_TEST !!!");
      cb("COMMIT_ERROR");
      return;
    }

    cb(undefined);
  };

  rollback(options, callback) {
    this.lastParams.rollback = {
      options: options,
      callback: callback
    };

    var cb = callback;
    if (!callback && typeof options === 'function') {
      cb = options;
    }

    cb(undefined);
  };

  query(sql, values, callback) {
    this.lastParams.query = {
      sql: sql,
      values: values,
      cb: callback
    };

    var cb = callback;
    if (!callback && typeof values === 'function') {
      cb = values;
    }

    if (this.raiseQueryError) {
      console.error("!!! QUERY_ERROR_TEST !!!");
      cb("QUERY_ERROR");
      return;
    }

    cb(undefined);
  };

  end(options, callback) {
    this.lastParams.end = {
      options: options,
      callback: callback
    };

    var cb = callback;
    if (!callback && typeof options === 'function') {
      cb = options;
    }

    if (typeof(cb) == 'function') {
      cb(undefined);
    }
  };
};

module.exports = ConnectionMock;
