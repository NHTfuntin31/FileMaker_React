import pyodbc as pyodbc
import re
import datetime
from . import Log

class FileMaker:
    #
    # 対象テーブル列名リスト
    #
    lColimunNames = []
    # コネクション
    cCon = None
    # カーソル
    cCur = None
    # カラム名リスト
    lColumnNames = []
    # 読み込み単位件数
    iReadCount = 100
    # カレントレコードポジション
    iCurRecPos = 0
    # 
    sConnection = ""
    #
    cLog = None

    def __init__(self, sConnect:str, cLog):
        #
        try:
            self.sConnection = sConnect
            self.cCon = pyodbc.connect(sConnect)
            self.cLog = cLog
        except Exception as e:
            self.cLog.ExceptionLog(e, "FileMaker Connect Error")
            print("ODBC Connection error:",e)

    
    #
    # 再接続
    def reConnect(self)->bool:
        #
        try:
            self.cCon = pyodbc.connect(self.sConnection)
            return True
        except Exception as e:
            self.cLog.ExceptionLog(e, "FileMaker ReConnect Error")
            print("ODBC Connection error:",e)
            return False

    #
    #
    def close(self):
        #
        self.cCon.close()
    #
    # カーソル取得
    def getCursor(self,sName:str = ""):
        #
        self.iCurRecPos = 0
        self.cCur = self.cCon.cursor()
        return self.cCur

    def closeCursor(self):
        self.cCur.close()

    #
    # 対象テーブルの列名リストを取得する。
    def getColName(self)->bool:
        #
        try:
            ltmp = [column[0] for column in self.cCur.description]
            # 2023.07.11 項目名は全て全角変換
            self.lColimunNames = []
            for item in ltmp:
                self.lColimunNames.append(item.upper())
            return True
        except Exception as e:
            return False

    #
    # SQL実行し、カラム名リストを生成する。
    def selectTable(self, sSql:str)->bool:
        # 単件読み
        sSql += " Offset " + str(self.iCurRecPos) + " rows fetch first " + \
                str(self.iReadCount) + " rows only"
        #print("FileMaker SQL:", sSql)
        try:
            self.cCur.execute(sSql)
            if self.iCurRecPos == 0:
                frc = self.getColName()
        except Exception as e:
            self.cLog.ExceptionLog(e, "FileMaker Select Error")
            self.Clog.Logger.log(self.cLog.CRITICAL, "SQL:" + sSql)
            print("FileMaker Access Err:", e)
            print("Err SQL:", sSql)
            return False
        return True


    def remove_emojis(self,text):
        emojis_removed = []
        for char in text:
             # 絵文字の最大Unicodeコードポイント（U+FFFD）よりも小さい場合に追加
             # 💦でない
            if ord(char) <= 65533 and \
               ord(char) != 55421 :  
                emojis_removed.append(char)
        return ''.join(emojis_removed)    
    
    #
    # レコードセットから、dictを生成する
    def getRec(self, cRec)->dict:
        #
        dRslt = {}
        pos = 0
        for sColName in self.lColimunNames:
            if cRec[pos] == None:
                val = ""
            else:
                try:
                    if type(cRec[pos]) == datetime.date:
                        val = cRec[pos].strftime("%Y/%m/%d")
                    elif type(cRec[pos]) == datetime.time:
                        if cRec[pos] != None:
                            val = cRec[pos].strftime("%H:%M:%S")
                        else:
                            print("Time is Null")
                            val = None
                    elif type(cRec[pos]) == datetime.datetime:
                        val = cRec[pos].strftime("%Y/%m/%d %H:%M:%S")
                    else:
                        if type(cRec[pos]) == str:
                            val = self.remove_emojis(cRec[pos])
                            # print("val:",val)
                        else:
                            if type(cRec[pos]) == float:
                                val = int(cRec[pos])
                            else:
                                val = cRec[pos]
                except Exception as e:
                    print("データ変換エラー:",e)
                    print("対象:", sColName, ":",type(cRec[pos]), ":",cRec[pos])

            dRslt[sColName] = val
            pos +=1
        return dRslt

    #
    # SQL指定にて、指定件数のレコードリストを取得する。
    def getRecs(self, sSql:str, iRecs:int)->list:
        #
        self.lRecs = []
        self.iReadCount = iRecs
        fRc = self.selectTable(sSql)
        if fRc == False:
            return None
        
        for iPos in range(0,iRecs):
            try:
                rec = self.cCur.fetchone()
                if rec == None:
                    break
            except Exception as e:
                self.cLog.ExceptionLog(e, "FileMaker Fetch Error! このテーブルはAPL経由で操作できません")
                print("Fetch Error", e)
                print("Recs:",len(self.lRecs),rec)
                print("このテーブルはODBC経由で取得できません。　エラーデータを確認してください")
                return {}
            if rec == None:
                return self.lRecs
            self.iCurRecPos += 1
            self.lRecs.append(self.getRec(rec))
        
        return self.lRecs


    #
    # 対象件数を取得する
    def getRecCount(self,sSql:str)->int:
        #
        self.cCur.execute(sSql)
        row = self.cCur.fetchone()
        return int(row[0])
    #
    # SQL指定にて、レコードリストを1件取得する
    def getRecOne(self, sSql:str)->dict:
        #
        lRec = []
        self.cCur = self.cCon.cursor()
        self.cCur.execute(sSql)
        try:
            lrec = self.cCur.fetchone()
        except Exception as e:
            self.cLog.ExceptionLog(e, "FileMaker FetchOne Error!")
            print("FetchOneで例外：", e)
            return {}
        try:
            fRc = self.getColName()
            if fRc == False:
                self.cCur.close()
                print("カラム名取得でエラー")
                return {}
        except Exception as e:
            self.cLog.ExceptionLog(e, "FileMaker カラム名取得で Error!")
            print("カラム名取得で例外:", e)
            return {}
        try:
            if lrec != None:
                dRec = self.getRec(lrec)
            else:
                self.cLog.ExceptionLog(e, "FileMaker カラム辞書生成 Error!")
                print("辞書生成でエラー")
                return {}
        except Exception as e:
            print("Columnマップで例外:",e)
            return {}
        self.cCur.close()
        #
        return dRec
    
    #
    # SQLにてFileMaker更新
    def execute(self, sSql:str)->bool:
        #
        self.cCur = self.cCon.cursor()
        count = self.cCur.execute(sSql).rowcount
        if count > 0:
            self.cCon.commit()
        self.cCur.close()
        return count
