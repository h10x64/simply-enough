const mysql = require('mysql');

const CONST = require('./constants');

class SimplyEnough {
  constructor(params) {
    if (!params || !params.config) {
      console.warn(CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      return undefined;
    }
  
    this._config_ = params.config;
  };

  async sendQuery(params) {
    if (!params || !params.query) {
      throw CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED;
    }
  
    var query = params.query;
    var connection = undefined;
  
    // Create new connection when params.connection is not setted.
    if (params.connection) {
      connection = params.connection;
    } else {
      console.debug("Create connection");
      connection = await createConnection();
    }
    // Start transaction if params.beginTransaction is setted.
    if (params.beginTransaction) {
      console.debug("Begin transaction");
      connection = await beginTransaction({connection: connection});
    }
    // Send query
    console.debug("Send query");
    try {
      // paramsにdoCommitが設定されていた場合、コミットする
      if (params.doCommit) {
        console.debug("Do commit");
        connection = await doCommit({connection: connection});
      }
  
      res = await doSendQuery({connection: connection, query: query});
  
      return {
        connection: connection,
        result: res.result,
        fields: res.fields
      };
    } catch(errMsg) {
      throw errMsg;
    } finally {
      // Close connection if params.closeConnection is setted.
      if (params.closeConnection) {
        console.debug("Close connection");
        connection.end();
      }
    }
  };
  
  /* Wrapper */
  createConnection() {
    return new Promise((resolve, reject)=>{
      try {
        var connection = mysql.createConnection(this._config_.db);
        resolve(connection);
      } catch(err) {
        reject(CONST.ERROR_MESSAGE.ERROR_CREATE_CONNECTION_FAILED);
      }
    });
  };
  
  beginTransaction(params) {
    if (!params || !params.connection) {
      return Promise.reject(CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
    }
  
    var connection = params.connection;
  
    return new Promise((resolve, reject)=>{
      connection.beginTransaction((err)=>{
        if (err) {
          reject(CONST.ERROR_MESSAGE.ERROR_BEGIN_TRANSACTION_FAILED);
          return;
        }
  
        resolve(connection);
      });
    });
  };
  
  doSendQuery(params) {
    if (!params || !params.query || !params.connection) {
      return Promise.reject(CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
    }
  
    connection = params.connection;
    query = params.query;
  
    return new Promise((resolve, reject)=>{
      try {
        connection.query(query, (err, result, fields) => {
          if (err) {
            console.warn("-- send query failed --");
            console.warn(err);
            console.warn("-----------------------");
            reject(CONST.ERROR_MESSAGE.ERROR_SEND_QUERY_FAILED);
            return;
          }
  
          resolve({connection: connection, result: result, fields: fields});
        });
      } catch(err) {
        console.warn(err);
        reject(CONST.ERROR_MESSAGE.ERROR_SEND_QUERY_FAILED);
      }
    });
  };
  
  async doCommit(params) {
    if (!params || !params.connection) {
      return Promise.reject(CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
    }
  
    var connection = params.connection;
    
    return new Promise((resolve, reject)=>{
      connection.commit((err)=>{
        if (err) {
          reject(CONST.ERROR_MESSAGE.ERROR_DO_COMMIT_FAILED);
        }
  
        resolve(connection);
      });
    });
  };
};

module.exports = SimplyEnough;
