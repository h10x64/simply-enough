
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
  /* doCommit メソッド */
  describe('.doCommit', ()=>{

    // connection.commitメソッドを呼び出すこと
    it('call connection.commit method.', async ()=>{
      // テスト前準備 //
      // Preperation //

      var connectionMock = new ConnectionMock();
      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

      // コネクションを作る
      // Create connection
      var connection = await se.createConnection();
      // トランザクション開始
      // Begin transaction
      await se.beginTransaction({connection: connection});
      // クエリ送出
      // Send query
      var res = await se.doSendQuery({connection: connection, query: "INSERT INTO t_hoge(id, count) VALUES (1, 2);"})

      // テスト //
      // Do the test //

      try {
        await se.doCommit({
          connection: connection,
        });

        // connectionモックのcommitメソッドが呼び出されていること
        expect(connectionMock.lastParams.commit).not.toBeUndefined();
      } catch(err) {
        // エラーの場合は失敗
        fail();
      } finally {
        // コネクションを閉じる
        // Close connection
        await se.closeConnection({
          connection: connection,
        });
      }
    });

    // エラー //
    describe('occures error', ()=>{
      // connection.commitメソッドでエラーが発生した場合
      it('when connection.commit throws some error.', async ()=>{
        // テスト前準備 //
        // Preperation //
        var connectionMock = new ConnectionMock({
          raiseCommitError: true,
        });
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        var connection = await se.createConnection();
        await se.beginTransaction({connection: connection});
        var res = await se.doSendQuery({connection: connection, query: "INSERT INTO t_hoge(id, count) VALUES (1, 2);"})

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doCommit({
            connection: connection,
          }),
        );

        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_DO_COMMIT_FAILED);
      });

      // params引数が設定されていなかった場合
      it('when params argument not set.', async ()=>{
        // テスト前準備 //
        // Preperation //
        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        var connection = await se.createConnection();
        await se.beginTransaction({connection: connection});
        var res = await se.doSendQuery({connection: connection, query: "INSERT INTO t_hoge(id, count) VALUES (1, 2);"})

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doCommit(undefined),
        );

        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });

      // params.connectionが設定されていなかった場合
      it('when params.connection not set.', async ()=>{
        // テスト前準備 //
        // Preperation //
        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        var connection = await se.createConnection();
        await se.beginTransaction({connection: connection});
        var res = await se.doSendQuery({connection: connection, query: "INSERT INTO t_hoge(id, count) VALUES (1, 2);"})

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doCommit({
            connection: undefined,
          }),
        );

        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });
    });
  });
});
