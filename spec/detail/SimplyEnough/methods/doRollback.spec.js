
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
  /* doRollback メソッド */
  describe('.doRollback', ()=>{

    // connection.rollbackメソッドを呼び出すこと
    it('call connection.rollback method.', async ()=>{
      // テスト前準備 //
      // Preperation //
      var connectionMock = new ConnectionMock();
      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

      var connection = await se.createConnection();

      // テスト //
      // Do the test //

      try {
        var res = await se.doRollback({
          connection: connection,
        });

        expect(res).not.toBeUndefined();
      } catch(err) {
        fail();
      }
    });

    // エラー //
    describe('occures error', ()=>{

      // params引数が設定されていなかった場合
      it('when params argument not set.', async ()=>{
        // テスト前準備 //
        // Preperation //
        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        var connection = await se.createConnection();

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doRollback(undefined),
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

        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.doRollback({
            connection: undefined,
          }),
        );

        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });
    });
  });
});
