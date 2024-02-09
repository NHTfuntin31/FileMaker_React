import json
from django.conf import settings
#
from . import Log
from . import Redis
from . import Postgres
from . import Const


#
# Redis#1に登録されたAPIの許可情報をチェックする
#
def checkAuth(sUrl:str, sCmd:str, sSession:str, cLog:Log)->bool:
    #
    cRedis = Redis.Redis(cLog)
    #
    lUsers = cRedis.hget(sUrl, sCmd)
    # DBよりsession_keyからユーザーIDを取得
    cDB = Postgres.Postgres(cLog)
    sSqlChk = "Select user_id From link_session Where session ='{:s}'"
    sSql = sSqlChk.format(sSession)
    cCur = cDB.getCursor()
    cDB.select(cCur,sSql)
    rec = cDB.fetchOne(cCur)
    sUser = rec['user_id']
    cCur.close()
    cDB.disconnect()
    #
    return sUser in lUsers
