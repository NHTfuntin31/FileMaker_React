import redis,json
from django.conf import settings
#
import Log
import traceback

#
# Redis 汎用ライブラリ

#
#
class Redis:
    #
    # Const
    REDIS_BANK_MIN = 1
    REDIS_BANK_MAX = 16
    REDIS_AUTH_BLOCK = 1
    REDIS_WEB_STORE = 2
    #
    dConf = {}
    #
    cLog = None
    cRedis = None
    fState = False
    iCurrentBank = -1
    #

    #
    # 
    def __init__(self, iMode:int, cLog: Log.Log):
        #
        self.cLog = cLog
        # 設定値取得
        match iMode:
            case self.REDIS_AUTH_BLOCK:
                self.dConf = settings.EXT_DATABASE['Redis_Auth']
            case self.REDIS_WEB_STORE:
                self.dConf = settings.EXT_DATABASE['Redis_WebStore']
            case _:
                return
        #
        try:
            self.cRedis = redis.Redis(host=self.dConf['Host'], port=self.dConf['PortNo'],
                                      db=self.dConf['DB'] , decode_responses = True)
        except Exception as e:
            self.cLog.ExceptionLog(e, "Redis接続で、例外検出しました。")
        self.iCurrentBank = self.dConf['DB']
        self.fState = True


    #
    # DB-No 
    def SelectDB(self, iMode:int)->bool:
        #
        if iMode < self.cRedis.REDIS_BANK_MIN or \
           iMode > self.cRedis.REDIS_BANK_MAX:
            return False
        fRc = self.cRedis.select(iMode)
        if fRc == True:
            self.iCurrentBank = iMode
            return True
        return False
    

    #
    # DictデータのSet
    def DictSet(self, sKey, dVal:dict):
        #
        sVal = json.dumps(dVal)
        self.cRedis.set(sKey, sVal)


    #
    # DictデータのGet
    def DictGet(self, sKey, dVal:dict):
        #
        sVal = self.cRedis.set(sKey)
        return json.loads(sVal)
    

    #
    # SringListデータのSet
    def StrListtSet(self, sKey, lVal:list):
        #
        self.cRedis.set(sKey, ",".join(lVal))


    #
    # SringListデータのGet
    def StrListGet(self, sKey, dVal:dict):
        #
        sVal = self.cRedis.set(sKey)
        return json.loads(sVal.split(','))


    #
    # intListデータのSet
    def IntListtSet(self, sKey, lVal:list):
        #
        self.cRedis.set(sKey, ",".join(map(str,lVal)))


    #
    # SringListデータのGet
    def IntListGet(self, sKey, dVal:dict):
        #
        sVal = self.cRedis.set(sKey)
        return [int(str) for str in sVal]


    #
    # 特定機能メソッド
    #
    #
    # 権限DB初期化
    # 権限DBは不定期に全載せ替えを行う。
    def clearAuthDB(self):
        #
        self.cRedis.select(self.REDIS_AUTH_BLOCK)
        lkeys = self.cRedis.keys("*")
        for urls in lkeys:
            self.cRedis.delete(urls)
        return
    

    # dApi = {"crrl_no": 01000, "api_no": 0B1110, "url": "/////"}
    # REST-APIユーザー権限追加
    def entryAuth(self, dApiMaster: dict, sUserID:str ):
        #
        skey = dApiMaster['url'] + "_" + "{:04b}".format(dApiMaster['api_no'])
        if self.cRedis.exists(skey) == 1:
            # 登録済URL
            lVal = self.StrListGet(skey)
            if sUserID in lVal:
                # 既に登録済
                return 
            # 未登録ユーザー
            lVal.append(sUserID)
            self.StrListtSet(skey, lVal)
            return
        sVal = []
        sVal.append(sUserID)
        self.StrListtSet(skey,sVal)
        return
        

    #
    # 永続化
    def sava(self):
        #
        self.cRedis.sava()
    

    #
    # 遅延保存
    def saveBackGround(self):
        #
        self.cRedis.bgsave()
    

