import psycopg2 as Postgre
from . import Log
from django.conf import settings

class Postgres:
    #
    cCon = None
    #
    lCur = []
    #
    cLog = None
    #
    lColumnNames = []
    
    def __init__(self, cLog:Log):
        #
        dCon = settings.DATABASES['default']
        #print("PG:", dCon)
        sCon = 'postgresql://{user}:{password}@{host}:{port}/{dbname}' \
                                     .format(user=dCon['USER'], password =dCon['PASSWORD'],
                                             host=dCon['HOST'], port=dCon['PORT'],
                                             dbname=dCon['NAME'])
        #print("Connection:",sCon)
        self.cCon = Postgre.connect(sCon)
        self.cLog = cLog

    #
    # disconnect
    def disconnect(self):
        #
        self.cCon.close()
    #
    # Trx
    def commit(self):
        try:
            self.cCon.commit()
        except Exception as e:
            self.cLog.ExceptionLog(e, "Commit Error")
            print("Commit Error:",e)

    def rollback(self):
        self.cCon.rollback()

    #
    # カーソル取得
    def getCursor(self):
        #
        try:
            cCur = self.cCon.cursor()
            self.lCur.append(cCur)
            return cCur
        except Exception as e:
            self.cLog.ExceptionLog(e, "Postgres Cursor Error:")
            print("Postgres Cursor Error:",e)
            return None
    
    #
    # カーソル取得
    def getNamedCursor(self, sName:str, iIter:int):
        #
        try:
            cCur = self.cCon.cursor(sName)
            if iIter != 0:
                cCur.itersize = iIter
            self.lCur.append(cCur)
            return cCur
        except Exception as e:
            self.cLog.ExceptionLog(e, "Postgres Cursor Error:")
            print("Postgres Cursor Error:",e)
            return None

    #
    # 登録(insert/update/delete)系SQL実行
    def execute(self, cCur, sSql:str)->bool:
        #
        try:
            cCur.execute(sSql)
            return True
        except Exception as e:
            self.cLog.ExceptionLog(e, "Postgres Exec Error:")
            self.cLog.Logger.log(self.cLog.INFO, "SQL:" + sSql)
            print("Postgres Exec Error:",e)
            print("SQL:", sSql)
            return False
    

    #
    # 照会系(Select)SQL実行
    def select(self, cCur, sSql:str):
        #
        cCur.execute(sSql)
        return cCur
    
    #
    # データ取得
    def fetchOne(self, cCur)->dict:
        #
        row = cCur.fetchone()
        self.lColumnNames = [desc[0] for desc in cCur.description]
        dRslt = dict(zip(self.lColumnNames, row))
        self.lColumnNames = []
        return dRslt
    
    #
    # データ取得
    def fetchAll(self, cCur)->dict:
        #
        rows = cCur.fetchall()
        self.lColumnNames = [desc[0] for desc in cCur.description]
        lRslt = []
        for row in rows:
            dRslt = dict(zip(self.lColumnNames, row))
            lRslt.append(dRslt)
        self.lColumnNames = []
        return lRslt
