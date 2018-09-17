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
      throw {
        msg: CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED,
        err: {}
      };
    }

    var query = params.query;
    var connection = undefined;
    var errorOccured = false;
  
    // Create new connection when params.connection is not setted.
    if (params.connection) {
      connection = params.connection;
    } else {
      console.debug("Create connection");
      connection = await this.createConnection();
    }
    // Start transaction if params.beginTransaction is setted.
    if (params.beginTransaction) {
      console.debug("Begin transaction");
      connection = await this.beginTransaction({connection: connection});
    }
    try {
      console.debug("Send query");
      console.debug(query);
      var res = await this.doSendQuery({connection: connection, query: query});

      // Do commit when params.doCommit is setted.
      if (params.doCommit) {
        console.debug("Do commit");
        connection = await this.doCommit({connection: connection});
      }
  
      return {
        connection: connection,
        result: res.result,
        fields: res.fields
      };
    } catch(err) {
      errorOccured = true;
      throw err;
    } finally {
      if (errorOccured && connection._transaction_started_) {
        // Rollback if error was occured.
        console.debug("Rollback");
        await this.doRollback({
          connection: connection,
        });
      } else if (params.closeConnection) {
        // Close connection if params.closeConnection is setted.
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
        reject({
          msg: CONST.ERROR_MESSAGE.ERROR_CREATE_CONNECTION_FAILED,
          err: err
        });
      }
    });
  };
  
  beginTransaction(params) {
    if (!params || !params.connection) {
      return Promise.reject({
        msg: CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED,
        err: {}
      });
    }
  
    var connection = params.connection;
  
    return new Promise((resolve, reject)=>{
      connection.beginTransaction((err)=>{
        if (err) {
          reject({
            msg: CONST.ERROR_MESSAGE.ERROR_BEGIN_TRANSACTION_FAILED,
            err: err
          });
          return;
        }
  
        connection._transaction_started_ = true;
        resolve(connection);
      });
    });
  };
  
  doSendQuery(params) {
    if (!params || !params.query || !params.connection) {
      return Promise.reject({
        msg: CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED,
        err: {}
      });
    }

    var connection = params.connection;
    var query = params.query;
  
    return new Promise((resolve, reject)=>{
      try {
        connection.query(query, (err, result, fields) => {
          if (err) {
            console.warn("-- send query failed --");
            console.warn(err);
            console.warn("-----------------------");
            reject({
              msg: CONST.ERROR_MESSAGE.ERROR_SEND_QUERY_FAILED,
              err: {}
            });
            return;
          }
  
          resolve({connection: connection, result: result, fields: fields});
        });
      } catch(err) {
        console.warn(err);
        reject({
          msg: CONST.ERROR_MESSAGE.ERROR_SEND_QUERY_FAILED,
          err: err
        });
      }
    });
  };

  doRollback(params) {
    if (!params || !params.connection) {
      return Promise.reject({
        msg: CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED,
        err: {}
      });
    }

    var connection = params.connection;

    return new Promise((resolve, reject)=>{
      connection.rollback(()=>{
        delete connection._transaction_started_;
        resolve(connection);
      });
    });
  };
  
  async doCommit(params) {
    if (!params || !params.connection) {
      return Promise.reject({
        msg: CONST.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED,
        err: {}
      });
    }
  
    var connection = params.connection;
    
    return new Promise((resolve, reject)=>{
      connection.commit((err)=>{
        if (err) {
          reject({
            msg: CONST.ERROR_MESSAGE.ERROR_DO_COMMIT_FAILED,
            err: err
          });
          return;
        }
  
        delete connection._transaction_started_;
        resolve(connection);
      });
    });
  };
};

module.exports = SimplyEnough;
