from django.core.management.base import BaseCommand
from .Common import Log
from .Common import Postgres
from .Common import Redis
import sys, os
from django.conf import settings


class AuthGen:
    #
    cLog = None
    cPG = None
    cRD = None
    fState = False
    #
    dUrl = {}


    def __init__(self):
        #
        dLog = settings.LOG_INFO['LogBatch']
        self.cLog = Log.Log(dLog)
        try:
            self.cPG = Postgres.Postgres(self.cLog) #Postgres.Postgres(self.cLog)
        except Exception as e:
            self.cLog.ExceptionLog(e, "Postgres接続エラー")
            return
        try:
            self.cRD = Redis.Redis(Redis.Redis.REDIS_AUTH_BLOCK,self.cLog)
        except Exception as e:
            self.cLog.ExceptionLog(e, "Redis接続エラー")
            return
        #
        sSql = "Select api_no,url,api_cmd from api_master \n" +\
               "  Where start_date <= now() and end_date >= now() Order By url;"
        cCur = self.cPG.getCursor()
        self.cPG.select(cCur, sSql)
        dRecs = self.cPG.fetchAll(cCur)
        print("api_master",dRecs)
        cCur.close()
        for rec in dRecs:
            #
            self.dUrl[rec['api_no']] = rec['url']
            #
            lcmd = rec['api_cmd']['Cmd']
            for cmd in lcmd:
                sKey = rec['url']
                print("hset",sKey,cmd,"",type(cmd))
                Rc = self.cRD.cRedis.hset(rec['url'], cmd, "[]")
        self.fState = True


    #
    # PostgreからRedis権限テーブルへ登録
    def execute(self)->bool:
        #
        fRc = False
        #
        sSql = "Select api_list, user_id From user_auth_master \n" +\
               "  Where start_date <= now() and end_date > now() Order By user_id"
        #
        cCur = self.cPG.getCursor()
        self.cPG.select(cCur, sSql)
        lRecs = self.cPG.fetchAll(cCur)
        cCur.close()
        #
        print("URLS:",self.dUrl)
        for dRec in lRecs:
            dApi = dRec['api_list']
            sUser = dRec['user_id']
            lcmd = dApi['Api']
            print("lcmd",lcmd)
            for cmd in lcmd:
                print("cmd",cmd)
                for pos in range(len(cmd)):
                    if pos == 0:
                        sUrl = self.dUrl[cmd[pos]]
                        continue
                    sfield = cmd[pos]
                    lUsers = self.cRD.cRedis.hget(sUrl, sfield)
                    lUsers = eval(lUsers)
                    print("h:",lUsers)
                    lUsers.append(sUser)
                    sVal = str(lUsers)
                    print("Redis", sUrl,sfield,sVal)
                    self.cRD.cRedis.hset(sUrl, sfield, sVal)
        fRc = True
        #
        return fRc


class Command(BaseCommand):
    #
    help = "パラメータはありません"

    def handle(self, *args, **options):
        print("Web権限情報の登録を開始します")
        print(os.getcwd())
        #
        cAuth = AuthGen()
        if cAuth.fState == False:
            print("初期化エラー")
            sys.exit(-1)
        fRc= cAuth.execute()
        #
        if fRc == False:
            print("実行エラーが発生しました")
            sys.exit(-2)
        print("ユーザー権限登録が正常終了しました:")