
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
  /* doSendQuery メソッド */
  describe('.doSendQuery', ()=>{
    // connection.queryメソッドを呼んでいること
    it('call connection.query method.', async () =>{
      // テスト前準備 //
      // Preperation //
      
      var connectionMock = new ConnectionMock();
      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

      var connection = await se.createConnection();
      const queryStr = 'SELECT * FROM t_hoge;';

      // テスト //
      // Do the test //

      try {
        var res = await se.doSendQuery({
          connection: connection,
          query: queryStr,
        });
        
        // connectionモックのqueryが呼び出されていること
        expect(connectionMock.lastParams.query).not.toBeUndefined();
        // connectionモックのquery呼び出しでqueryStrと同じ値が渡されていること
        expect(connectionMock.lastParams.query.options.sql).toBe(queryStr);
        // レスポンスがあること
        expect(res).not.toBeUndefined();
      } catch (err) {
        // エラーの場合はテスト失敗
        fail();
      }
    });

    // エラー //
    describe('occures error', ()=>{
      // connection.queryメソッドでエラーが起きた場合
      it('when connection.query throws some error.', async ()=>{
        // テスト前準備 //
        // Preperation //

        var connectionMock = new ConnectionMock({
          raiseQueryError: true,  // queryメソッドでエラーを発生させる
        });
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        var connection = await se.createConnection();
        const queryStr = 'SELECT * FROM t_hoge;';
  
        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doSendQuery({
            connection: connection,
            query: queryStr,
          })
        );
        
        expect(connectionMock.lastParams.query).not.toBeUndefined();
        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_SEND_QUERY_FAILED);
      });

      // params引数が設定されていなかった場合
      it('when params argument not set.', async ()=>{
        // テスト前準備 //
        // Preperation //

        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doSendQuery(undefined),
        );

        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });

      // params.connectionが設定されていなかった場合
      it('when params.connection not set.', async ()=>{
        // テスト前準備 //
        // Preperation //

        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        const queryStr = 'SELECT * FROM t_hoge;';

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doSendQuery({
            connection: undefined,
            query: queryStr,
          }),
        );

        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });

      // params.queryが設定されていなかった場合
      it('when params.query not set.', async ()=>{
        // テスト前準備 //
        // Preperation //

        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        var connection = await se.createConnection();

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doSendQuery({
            connection: connection,
            query: undefined,
          }),
        );

        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });
    })
  });
});
