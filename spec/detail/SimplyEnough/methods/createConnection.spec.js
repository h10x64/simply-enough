
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

describe('SimplyEnough', ()=>{
  /* createConnection メソッド */
  describe('.createConnection', ()=>{
    // 新しいコネクションを作る
    it('must create new connection.', async ()=>{
      var connectionMock = new ConnectionMock();
      var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

      // テスト前チェック //
      // Pre test assartion //

      // connectionMock.lastParams.createConnection に値が入っていない事
      expect(connectionMock.lastParams.createConnection).toBeUndefined();

      // テスト実施 //
      // Do the test //

      var connection = await se.createConnection();

      // connection 変数が undefined でない事
      expect(connection).not.toBeUndefined();
      // connectionMock.lastParams.createConnection に呼び出し時の引数オブジェクトが生成されている事
      expect(connectionMock.lastParams.createConnection).not.toBeUndefined();
    });

    // エラーを起こす
    describe('occures error', ()=>{
      // mysql.createConnectionでエラーが発生した時
      it('when mysql.createConnection throw some error.', async ()=>{
        var connectionMock = new ConnectionMock({
          raiseCreateConnectionError: true,
        });
        var se = ConnectionMock.createMockedSEInstance(SimplyEnough, connectionMock, EASY_CONFIG);

        // Do the test //
        var err = await expectToReject(
          se.createConnection(),
        );

        // connectionモックのcreateConnectionが呼び出されていること
        expect(connectionMock.lastParams.createConnection).not.toBeUndefined();
        // err.messageが所定の文字列であること
        expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_CREATE_CONNECTION_FAILED);
      });
    });
  });
});
