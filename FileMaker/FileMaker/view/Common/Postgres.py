from django.conf import settings
import psycopg2 
from psycopg2.extras import DictCursor
from . import Log

class Postgres:
    #
    _db_url = ""
    _db_port = 0
    _db_name = ""
    _user_id = ""
    _pass_word = ""
    #
    _cDB = None
    #
    _cLog = None
    #
    lColumnNames = []    
    #
    def __init__(self, cLog:Log):
        dbInf = settings.DATABASES["default"]
        if dbInf is None:
            return None
        self._db_url = dbInf["HOST"]
        self._db_port = dbInf["PORT"]
        self._db_name = dbInf["NAME"]
        self._user_id = dbInf["USER"]
        self._pass_word = dbInf["PASSWORD"]
        self._cLog = cLog

    def connect(self, AutoCommit=True, ReadOnly=False) -> bool:
        #
        if self._cDB is not None:
            return True
        try:
            self._cDB = psycopg2.connect(host=self._db_url, port=self._db_port,
                                         dbname=self._db_name, user=self._user_id,
                                         password=self._pass_word)
            self._cDB.set_session(readonly=ReadOnly, autocommit=AutoCommit, )
            return True
        except psycopg2.DatabaseError as _Ex:
            self._cLog.ExceptionLog(_Ex, "Psrtgre ")
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgcode))
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgerror))
            print("ErrorCode:", _Ex.pgcode)
            print("ErrorCode:", _Ex.pgerror)
            return False
    
    def disconnect(self):
        #
        if self._cDB is None:
            return
        self._cDB.close()
        self._cDB = None
        return
    
    SQL_EXEC_ERROR = -1
    SQL_EXEC_NODATA = 0
    SQL_EXEC_OK = 1
    SQL_COMMIT_ERROR = -2
    SQL_COMMMIT_OK = 1
        
    #
    # Select一括取得
    def SelectAll(self, sSql: str):
        #
        cur = self._cDB.cursor(cursor_factory=DictCursor)
        try:
            cur.execute(sSql)
            if cur.rowcount == 0:
                return self.SQL_EXEC_NODATA, None
        except psycopg2.DatabaseError as _Ex:
            self._cLog.ExceptionLog(_Ex, "Postgres SelectAll Error")
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgcode))
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgerror))
            self._cLog.Logger(self._cLog.ERROR, "SQL:" + str(sSql))
            print("SQL:", sSql)
            print("ErrorCD:", _Ex.pgcode)
            print("Message:", _Ex.pgerror)
            return self.SQL_EXEC_ERROR, None
        return cur.rowcount, cur
    
    
    #
    # 更新系SQL実行
    def execute(self, sSql: str, cur):
        #
        if cur is None:
            cur = self._cDB.Cursor()
        try:
            irsp = cur.execute(sSql)
        except psycopg2.DatabaseError as _Ex:
            self._cLog.ExceptionLog(_Ex, "Postgres Execute Error")
            self._cLog.Logger.log(self._cLog.ERROR, "SQL:" + str(sSql))
            print("SQL:", sSql)
            print("ErrorCD:", _Ex.pgcode)
            print("Message:", _Ex.pgerror)
            return self.SQL_EXEC_ERROR, _Ex.pgcode, cur
        return self.SQL_EXEC_OK, irsp, cur


    #
    # 更新確定
    def commit(self):
        #
        if self._cDB.autocommit is True:
            return
        try:
            self._cDB.commit()
        except psycopg2.DatabaseError as _Ex:
            self._cLog.ExceptionLog(_Ex, "Postgres Commit Error")
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgcode))
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgerror))
            print("ErrorCD:", _Ex.pgcode)
            print("Message:", _Ex.pgerror)
            return self.SQL_COMMIT_ERROR
        return self.SQL_COMMMIT_OK
    

    #
    # 更新キャンセル
    def rollback(self, cur):
        #
        if self._cDB.autocommit is True:
            return
        try:
            self._cDB.rollback()
        except psycopg2.DatabaseError as _Ex:
            self._cLog.ExceptionLog(_Ex, "Postgres RollBack Error")
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgcode))
            self._cLog.Logger(self._cLog.ERROR, "ErrorCode:" + str(_Ex.pgerror))
            print("ErrorCD:", _Ex.pgcode)
            print("Message:", _Ex.pgerror)
            return self.SQL_COMMIT_ERROR
        return self.SQL_COMMMIT_OK


    #
    # 名無しカーソル取得
    def getCursor(self):
        #
        try:
            cCur = self._cDB.cursor()
            return cCur
        except Exception as e:
            print("Postgres Cursor Error:",e)
            self.cLog.ExceptionLog(e, "Postgres Cursor Error:")
            return None


    #
    # 名無しカーソル取得
    def getNameCursor(self):
        #
        try:
            cCur = self._cDB.cursor(cursor_factory=DictCursor)
            return cCur
        except Exception as e:
            self.cLog.ExceptionLog(e, "Postgres Cursor Error:")
            print("Postgres Cursor Error:",e)
            return None


    #
    # 名前付きカーソル取得
    def getNamedCursor(self, sName:str, iIter:int):
        #
        try:
            cCur = self._cDB.cursor(sName)
            if iIter != 0:
                cCur.itersize = iIter
            self.lCur.append(cCur)
            return cCur
        except Exception as e:
            self.cLog.ExceptionLog(e, "Postgres Cursor Error:")
            print("Postgres Cursor Error:",e)
            return None
    

    #
    # 照会系(Select)SQL実行(ServerCursor経由)
    def select(self, cCur, sSql:str):
        #
        cCur.execute(sSql)
        return cCur
    
    #
    # データ単件取得(ServerCursor経由)
    def fetchOne(self, cCur)->dict:
        #
        row = cCur.fetchone()
        self.lColumnNames = [desc[0] for desc in cCur.description]
        dRslt = dict(zip(self.lColumnNames, row))
        return dRslt
    
    #
    # データ全取得(ServerCursor経由)
    def fetchAll(self, cCur)->list:
        #
        rows = cCur.fetchall()
        self.lColumnNames = [desc[0] for desc in cCur.description]
        lRslt = []
        for row in rows:
            dRslt = dict(zip(self.lColumnNames, row))
            lRslt.append(dRslt)
        return lRslt
