import Log
import mysql.connector
from mysql.connector import errorcode

#
# MySQL アクセサクラス
class MySQL:
    #
    dConfig = {}
    cLog = None
    #
    cCon = None


    #
    #
    def __init(self, dConf:dict, cLog:Log.Log):
        #
        self.cLog = cLog
        self.dConfig = dConf
    

    # 
    # DB Connect
    def connect(self)->bool:
        #
        try:
            self.cCon = mysql.connector.connect(user=self.dConfig['User'], password=self.dConfig['PassWord'],
                                                host=self.dConfig['Host'], port=self.dConfig['Port'],
                                                Database=self.dConfig['DataBase'])
        except mysql.connector.Error as Err:
            self.cLog.Logger.log(self.cLog.CRITICAL, "MySQL接続にて例外。 エラーコード:"+str(Err.errno)+":"+Err.msg)
            return False
        return True
    

    #
    # DB切断
    def disconnect(self):
        #
        if self.cCon != None:
            self.cCon.disconnect()
            self.cCon = None


    #
    # カーソル取得(後始末はちゃんとする事)
    def getCursor(self, fDict = True):
        #
        return self.cCon.cursor(dictionary=fDict)
    

    #
    # トランザクション開始
    def begin(self):
        #
        self.cCon.cmd_query("Begin")
    

    #
    # コミット
    def commit(self):
        #
        self.cCon.commit()
    

    #
    # ロールバック
    def rollback(self):
        #
        self.cCon.rollback()
    

    #
    # SQL実行
    # 参照・更新件数は、cCur.rowcount()で取得すること
    # 参照レコードは、fetchone/fetchall
    def execute(self, cCur,sSql:str):
        #
        try:
            cCur.execute(sSql)
        except mysql.connector.Error as Err:
            self.cLog.Logger.log(self.cLog.CRITICAL, "MySQL SQL実行にて例外。 エラーコード:"+str(Err.errno)+":"+Err.msg)
            self.rollback()
            cCur.close()
            return None
        return cCur


    #
    #