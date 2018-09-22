
const rewire = require('rewire')
const {willResolve, expectToReject} = require('jasmine-promise-tools');

// connection用のモック
const ConnectionMock = require('../../../common/mock/ConnectionMock');

/* TEST TARGET */

const SimplyEnough = rewire('../../../../src/SimplyEnough');

/* CONSTANTS */

// 定数ファイル
const CONSTANTS = require('../../../../src/constants');


describe('SimplyEnough', function() {
  /* コンストラクタ */
  describe('constructor', ()=>{
    it('return new instance', async ()=>{
      var se = new SimplyEnough({
        config: {
          db: {
            host: 'example.com',
            port: 9999,
            user: 'foo',
            password: 'foo_password',
            database: 'bar_db',
            charset: "utf8_general_ci"
          }
        }
      });
      expect(se).not.toBeUndefined();
      expect(se._config_).not.toBeUndefined();
    });

    // エラー
    describe('occures error', ()=>{
      // 必須パラメータが設定されていない
      describe('when required parameters are not set.', ()=>{
        // params 引数が設定されていない
        it('Throw an error if params argument is not setted.', async ()=>{
          try {
            var se = new SimplyEnough(undefined);
            fail();
          } catch(err) {
            expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
          }
        });

        // params.config 引数が設定されていない
        it('Throw an error if params.config argument is not setted.', async ()=>{
          try {
            var se = new SimplyEnough({
              config: undefined,
            });
            fail();
          } catch(err) {
            expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
          }
        });

        // params.config.db 引数が設定されていない
        it('Throw an error if params.config.db argument is not setted.', async ()=>{
          try {
            var se = new SimplyEnough({
              config: {
                db: undefined,
              }
            });
            fail();
          } catch(err) {
            expect(err.message).toBe(CONSTANTS.ERROR_MESSAGE.ERROR_REQUIRED_PARAMETERS_UNDEFINED);
          }
        });
      })
    });
  });
});
