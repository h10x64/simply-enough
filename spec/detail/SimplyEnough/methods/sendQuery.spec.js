
const rewire = require('rewire')
const {willResolve, expectToReject} = require('jasmine-promise-tools');

// connection用のモック
const ConnectionMock = require('../../../common/mock/ConnectionMock');

/* TEST TARGET */

const SimplyEnough = rewire('../../../../src/SimplyEnough');

/* CONSTANTS */

// 定数ファイル
const CONSTANTS = require('../../../../src/constants');

// テキトウなコンフィグ
const EASY_CONFIG = require('../../../common/config');


describe('SimplyEnough', function() {
  /* sendQueryメソッド */
  describe('.sendQuery', ()=>{
    // params.connectionが設定されていない場合、新しくコネクションを作成すること
    it('create connection automatically when params.connection was not setted.', willResolve(async ()=>{
      var connectionMock = new ConnectionMock();

      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

      var res = await se.sendQuery({
        query: "SELECT * FROM t_foo;",
      });

      expect(res.connection).not.toBeUndefined();

      se.closeConnection({connection: res.connection});
    }));

    // connection.queryを呼び出すこと
    it('must call connection.query', willResolve(async ()=>{
      var connectionMock = new ConnectionMock();

      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
      var res = await se.sendQuery({
        query: "SELECT * FROM t_foo;",
      });

      expect(connectionMock.lastParams.query).not.toBeUndefined();

      se.closeConnection({connection: res.connection});
    }));

    // 呼び出された引数options.sqlがparams.queryと等しいこと
    it('called connection.query\'s "sql" argument must be same as the params.query', willResolve(async ()=>{
      var connectionMock = new ConnectionMock();

      var sendSqlStatement = "SELECT * FROM t_foo;";
      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
      var res = await se.sendQuery({
        query: sendSqlStatement,
      });

      expect(connectionMock.lastParams.query.options.sql).toBe(sendSqlStatement);

      se.closeConnection({connection: res.connection});
    }));

    // 引数
    describe('arguments', ()=>{
      // beginTransaction引数
      describe('beginTransaction', ()=>{
        // params.beginTransactionが設定されていた場合、connection.beginTransactionが呼び出されること
        it('must call connection.beginTransaction when params.beginTransaction was setted.', willResolve(async ()=>{
          var connectionMock = new ConnectionMock();

          var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

          var res = await se.sendQuery({
            beginTransaction: true,
            doCommit: false,
            closeConnection: true,
            query: "SELECT * FROM t_foo;",
          });

          expect(connectionMock.lastParams.beginTransaction).not.toBeUndefined();
        }));
      });

      // doCommit引数
      describe('doCommit', ()=>{
        // params.doCommitが設定されていた場合、connection.commitが呼び出されること
        describe('must call connection.commit when params.doCommit was setted.', ()=>{
          // params.beginTransactionが設定されていた場合
          it('params.beginTransaction was setted.', willResolve(async ()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: true,
              doCommit: true,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });

            expect(connectionMock.lastParams.commit).not.toBeUndefined();
          }));

          // トランザクション開始済のconnectionがparams.connectionに設定されていて、params.beginTransactionが設定されていなかった場合 
          it('connection that already started transaction was set into the params, and params.beginTransaction was not setted.', willResolve(async ()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

            var res1 = await se.sendQuery({
              beginTransaction: true,
              doCommit: false,
              closeConnection: false,
              query: "SELECT * FROM t_foo;",
            });
            var res2 = await se.sendQuery({
              connection: res1.connection,
              beginTransaction: false,
              doCommit: true,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.commit).not.toBeUndefined();
          }));
        });

        // params.doCommitが設定されていない場合、connection.commitが呼び出されない事
        describe('must not call connection.commit when params.doCommit was not setted.', ()=>{
          // params.beginTransactionが設定されていない場合
          it('params.beginTransaction was not setted.', willResolve(async ()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
            var conn = await se.createConnection();

            var res = await se.sendQuery({
              connection: conn,
              beginTransaction: false,
              doCommit: false,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });

            expect(connectionMock.lastParams.commit).toBeUndefined();
          }));

          // params.beginTransactionが設定されていた場合
          it('params.beginTransaction was setted.', willResolve(async ()=>{
            var connectionMock = new ConnectionMock();

            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
            var conn = await se.createConnection();

            var res = await se.sendQuery({
              connection: conn,
              beginTransaction: true,
              doCommit: false,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });

            expect(connectionMock.lastParams.commit).toBeUndefined();
          }));
        });
      });

      // closeConnection引数
      describe('closeConnection', ()=>{
        // params.closeConnectionが設定されていた場合、connection.endが呼び出されること
        describe('call connection.end if params.closeConnection was setted.', ()=>{
          it('beginTransaction: false, doCommit: false', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: false,
              doCommit: false,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).not.toBeUndefined();
          });
          it('beginTransaction: false, doCommit: true', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: false,
              doCommit: true,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).not.toBeUndefined();
          });
          it('beginTransaction: true, doCommit: false', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: true,
              doCommit: false,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).not.toBeUndefined();
          });
          it('beginTransaction: true, doCommit: true', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: true,
              doCommit: true,
              closeConnection: true,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).not.toBeUndefined();
          });
        });

        // params.closeConnectionが設定されていない場合、connection.endが呼び出されないこと
        describe('must not call connection.end if params.closeConnection was not setted.', ()=>{
          it('beginTransaction: false, doCommit: false', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: false,
              doCommit: false,
              closeConnection: false,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).toBeUndefined();
          });
          it('beginTransaction: false, doCommit: true', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: false,
              doCommit: true,
              closeConnection: false,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).toBeUndefined();
          });
          it('beginTransaction: true, doCommit: false', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: true,
              doCommit: false,
              closeConnection: false,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).toBeUndefined();
          });
          it('beginTransaction: true, doCommit: true', async()=>{
            var connectionMock = new ConnectionMock();
        
            var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
        
            var res = await se.sendQuery({
              beginTransaction: true,
              doCommit: true,
              closeConnection: false,
              query: "SELECT * FROM t_foo;",
            });
        
            expect(connectionMock.lastParams.end).toBeUndefined();
          });
        });
      });
    });

    describe('error handling', ()=>{
      // トランザクションが開始していない場合、クエリエラーが発生してもconnection.rollbackが実行されない事
      it('must not call connection.rollback when transaction is not started, even if query error occurred.', willResolve(()=>{
        var connectionMock = new ConnectionMock({
          raiseQueryError: true,
        });

        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        // Do the test
        return expectToReject(
          se.sendQuery({
            beginTransaction: false,
            doCommit: false,
            closeConnection: false,
            query: "SELECT * FROM t_foo;",
          })
        ).then((err)=>{
          expect(connectionMock.lastParams.rollback).toBeUndefined();
        });
      }));

      // mysql.beginTransactionメソッドが失敗した場合、リジェクトされること
      it('must rejected when mysql.beginTransaction was failed.', willResolve(()=>{
        var connectionMock = new ConnectionMock({
          raiseBeginTransactionError: true,
        });

        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        return expectToReject(
          se.sendQuery({
            beginTransaction: true,
            doCommit: false,
            closeConnection: false,
            query: "SELECT * FROM t_foo;",
          })
        ).then((err)=>{
          expect(connectionMock.lastParams.beginTransaction).not.toBeUndefined();
          expect(connectionMock.lastParams.query).toBeUndefined();
          expect(connectionMock.lastParams.commit).toBeUndefined();
          expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_BEGIN_TRANSACTION_FAILED);
        });
      }));

      // mysql.queryメソッドが失敗した場合、リジェクトされること
      it('must rejected when mysql.query was failed.', willResolve(()=>{
        var connectionMock = new ConnectionMock({
          raiseQueryError: true,
        });

        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        // Do the test
        return expectToReject(
          se.sendQuery({
            beginTransaction: false,
            doCommit: false,
            closeConnection: false,
            query: "SELEC * FRO t_foo;",
          })
        ).then((err)=>{
          expect(connectionMock.lastParams.query).not.toBeUndefined();
          expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_SEND_QUERY_FAILED);
        });
      }));

      // mysql.commitが失敗した場合、リジェクトされること
      it('must rejected when mysql.commit was failed.', willResolve(()=>{
        var connectionMock = new ConnectionMock({
          raiseCommitError: true,
        });

        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        // Do the test
        return expectToReject(
          se.sendQuery({
            beginTransaction: true,
            closeConnection: false,
            doCommit: true,
            query: "INSERT INTO t_foo('hoge', 'fuga') VALUES ('foo', 'bar');",
          })
        ).then((err)=>{
          expect(connectionMock.lastParams.beginTransaction).not.toBeUndefined();
          expect(connectionMock.lastParams.query).not.toBeUndefined();
          expect(connectionMock.lastParams.commit).not.toBeUndefined();
          expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_DO_COMMIT_FAILED);
        });
      }));
    });
  });
});
