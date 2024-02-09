from django.core.management.base import BaseCommand
from .Common import Log 
from .Common import MongoDB
from .Common import Postgres
from .Common import makePassword as MakePass
import json, sys, os
from django.conf import settings

class ImportUser:
    #
    cMongo = None
    cPG = None
    cLog = None
    #
    dConfig = {}
    fState = False
    #

    def __init__(self):
        #
        try:
            # ログ設定
            dtmp = getattr(settings, "LOG_INFO", None)
            self.dConfig['Log'] = dtmp['LogBatch']
            # DB 設定
            dtmp = getattr(settings, "EXT_DATABASE", None)
            self.dConfig['MongoDB'] = dtmp['MongoDB']
            self.dConfig['Log']['LogName'] = "UserInfoImport"
            self.cLog = Log.Log(self.dConfig['Log'])
            self.fState = True
            print("Config", self.dConfig['Postgres'])
        except Exception as e:
            print("設定ファイル読み込みで失敗しました。", e)


    #
    # DB系初期化
    def DBOpen(self, sCollection="")->bool:
        #
        try:
            self.cMongo = MongoDB.Mongo(self.dConfig['MongoDB'], self.cLog)
            self.cPG = Postgres.Postgres(self.cLog)
            if sCollection != "":
                self.cCollection = self.cMongo.selectCollection(sCollection)
        except Exception as e:
            self.cLog.ExceptionLog(e, "DB初期化で例外が出ました。:")
            return False
        return True


    #
    # Djangoユーザー登録
    def entryUser(self, dRec:dict)->int:
        #
        iRc = -1
        #
        sSqlChk = "Select count(*) as count From auth_user Where username = '"
        sSql = "Insert Into auth_user(password, is_superuser, username, \n" + \
               "    first_name, last_name, is_staff, is_active,email,date_joined) Values ("
        #
        sUserName = "{:04d}".format(int(dRec['管理NO']))
        sSqlChk += sUserName + "';"
        #
        print("Mongo Rec:", dRec)
        #
        sPass = MakePass.make_password('P@ssword')
        sSql += "'" + sPass + "',"
        sSql += "True,"
        sSql += "'" + sUserName +"',"
        sSql += "'" + dRec['担当名姓'] + "','" + dRec['担当名名前'] + "', True, True, '', now());"
        #
        cCur = self.cPG.getCursor()
        # 存在チェック
        cCur = self.cPG.select(cCur,sSqlChk)
        dRslt = self.cPG.fetchOne(cCur)
        if dRslt['count'] == 1:
            cCur.close()
            self.cLog.Logger.log(self.cLog.INFO, "既に登録済ユーザーです:" + sUserName)
            return 0
        #
        fRc = self.cPG.execute(cCur, sSql)
        if fRc:
            self.cPG.commit()
            cCur.close()
            return 1
        self.cPG.rollBack()
        return -1


    #
    # Mongoから、担当者情報を取得する
    def execute(self)->int:
        #
        iRslt = 0
        #
        cCur = self.cMongo.select({'現行': {'$ne':'退職者'}}, {'管理NO':1, '担当名姓':1, '担当名名前':1})
        dRec = self.cMongo.next(cCur)
        while dRec != {}:
            iRc = self.entryUser(dRec)
            if iRc == 1:
                iRslt += 1
            if iRc < 0:
                self.cLog.Logger.log(self.cLog.ERROR, "Entry Error")
                return -1
            if iRc == 0:
                self.cLog.Logger.log(self.cLog.INFO, "Entry Skip:" + "{:04d".format(dRec['管理NO']))
            dRec = self.cMongo.next(cCur)
        return iRslt


class Command(BaseCommand):
    #
    help = "パラメータはありません"

    def handle(self, *args, **options):
        print("start UserInfomation import!")
        print(os.getcwd())
        #
        cUser = ImportUser()
        if cUser.fState == False:
            print("初期化エラー")
            sys.exit(-1)
        fRc = cUser.DBOpen("営業担当コード_テーブル")
        print("DB Open:", fRc)
        if fRc == False:
            print("Error")
            sys.exit(-1)
        iRc = cUser.execute()
        #
        if iRc < 0:
            print("実行エラーが発生しました")
            sys.exit(-2)
        print("ユーザー登録が正常終了しました:", iRc, "件")