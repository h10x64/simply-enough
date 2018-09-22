
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
  /* beginTransaction メソッド */
  describe('.beginTransaction', ()=>{
    it('call connection.beginTransaction', async ()=>{
      var connectionMock = new ConnectionMock();
      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

      // テスト //
      // Do the test //

      var connection = await se.createConnection();
      await se.beginTransaction({
        connection: connection
      });

      // connectionモックのbeginTransactionが呼び出されていること
      expect(connectionMock.lastParams.beginTransaction).not.toBeUndefined();
    });

    /* エラー */
    describe('occures error', ()=>{

      // connection.beginTransactionがエラーを投げた場合
      it('when connection.beginTransaction throws some error.', async ()=>{
        var connectionMock = new ConnectionMock({
          raiseBeginTransactionError: true,
        })
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        // 準備 //
        // Preperations //
  
        var connection = await se.createConnection();
  
        // テスト //
        // Do the test //

        var err = await expectToReject(
          se.beginTransaction({
            connection: connection
          }),
        );
  
        // connectionモックのbeginTransactionが呼び出されていること
        expect(connectionMock.lastParams.beginTransaction).not.toBeUndefined();
        // errが所定の文字列(CONSTANTS.ERROR_MESSAGE.ERROR_BEGIN_TRANSACTION_FAILED)であること
        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_BEGIN_TRANSACTION_FAILED);
      });

      // params 引数が設定されていなかった場合
      it('when params argument not set.', async ()=>{
        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
  
        // テスト //
        // Do the test //
  
        var err = await expectToReject(
          se.beginTransaction(undefined),
        );
  
        // connectionモックのbeginTransactionが呼び出されていないこと
        expect(connectionMock.lastParams.beginTransaction).toBeUndefined();
        // errが所定の文字列(CONSTANTS.ERROR_MESSAGE.ERROR_BEGIN_TRANSACTION_FAILED)であること
        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });

      // params.connection が設定されていなかった場合
      it('when params.connection not set.', async ()=>{
        var connectionMock = new ConnectionMock();
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);
  
        // テスト //
        // Do the test //
  
        var err = await expectToReject(
          se.beginTransaction({
            connection: undefined
          }),
        );
  
        // connectionモックのbeginTransactionが呼び出されていないこと
        expect(connectionMock.lastParams.beginTransaction).toBeUndefined();
        // errが所定の文字列(CONSTANTS.ERROR_MESSAGE.ERROR_BEGIN_TRANSACTION_FAILED)であること
        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
      });
    });
  });
});
