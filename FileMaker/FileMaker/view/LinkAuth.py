# import request
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.authtoken.models import Token

import ipaddress as IP
from django.conf import settings
import datetime, json
from django.db import connection

# ローカライズ
# 定数定義
from .Common import Log
from .Common import makePassword as MakePass


#
#
class Ping(APIView):
    #
    def get(self,request):
        #
        return Response({'Pong'}, status=status.HTTP_200_OK)
#
# ログイン認証・承認クラス
class Login(APIView):
    #
    def get(self,request):
        #
        return Response({'Pong'}, status=status.HTTP_200_OK)


    #
    # 認証・承認とユーザー/メニュー制御通知
    def post(self, request):
        #
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        r_data = request.body
        dData = json.loads(r_data)
        username = dData['username']
        password = dData['password']
        print(username, password)
        cLog.Logger.log(cLog.INFO,"Login Request:"+username)
        # 接続元IPでの確認
        # 接続元IP取得
        # 'HTTP_X_FORWARDED_FOR'ヘッダを参照して転送経路のIPアドレスを取得する。
        forwarded_addresses = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded_addresses:
            # 'HTTP_X_FORWARDED_FOR'ヘッダがある場合: 転送経路の先頭要素を取得する。
            client_addr = forwarded_addresses.split(',')[0]
            cLog.Logger.log(cLog.INFO,"forwarded_addresses:"+forwarded_addresses)
        else:
            # 'HTTP_X_FORWARDED_FOR'ヘッダがない場合: 直接接続なので'REMOTE_ADDR'ヘッダを参照する。
            client_addr = request.META.get('REMOTE_ADDR')
            cLog.Logger.log(cLog.INFO,"request.META.get:"+str(request.META))
        # print("Session:", request.session.session_key)
        # print("IP", client_addr)
        cLog.Logger.log(cLog.INFO,"Connect From:"+client_addr)
        if client_addr == "::1":
            client_addr = "127.0.0.1"
        fRc = checkIPWall(client_addr)
        if fRc == False:
            cLog.Logger.log(cLog.CRITICAL,"request not allowed:"+client_addr+" User:"+username)
            return Response({"request not allowed"}, status=status.HTTP_403_FORBIDDEN)
        cLog.Logger.log(cLog.INFO,"Wall Check OK:"+client_addr)
        # Basic認証
        user = authenticate(request, username=username, password=password)
        # 認証OKなら、Djangoログイン
        if user is not None:
            login(request, user)
            #print("Session:", request.session.session_key)
            #print("Token:", request.META.get('CSRF_COOKIE', None))
            # トークン生成
            rsp_data = {}
            token = user.get_session_auth_hash()
            rsp_data['Token'] = token
            rsp_data['Session'] = request.session.session_key
            dSession = {'UserID': username, 'IP': client_addr, 'Token': token,  'Session':rsp_data['Session']}
            cLog.Logger.log(cLog.INFO,"Entry Session Info:"+str(dSession))
            # セッション管理へ登録
            entrySessionTable(dSession)
        else:
            cLog.Logger.log(cLog.ERROR,"Login Fail:"+client_addr+" User:"+username)
            return Response({"UnAuthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        # ユーザー情報取得
        dUser = getUserInfo(username)
        rsp_data['UserInfo'] = dUser
        #print("Session:", request.session.session_key)
        # ユーザー別権限マスタ経由でメニュー権限情報を取得し、レスポンス生成
        lMenu = getMenuItems(username)
        rsp_data['Menu'] = lMenu
        cLog.Logger.log(cLog.INFO,"Login Success:"+client_addr+" User:"+username)
        # 期限切れセッション破棄
        dropSession()
        # トークン生成・ユーザー情報のレスポンス生成
        return Response(rsp_data, status=status.HTTP_200_OK)


#
# ログアウト
class Logout(APIView):
    def post(self, request):
        # 
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        # print("Session", dir(request.session), sSession)
        if sSession == None:
            return Response({"You Alredy Logout"}, status=status.HTTP_400_BAD_REQUEST)
        #print("Session", sSession)
        cLog.Logger.log(cLog.INFO, "ログアウト要求 session:" + sSession)
        # 期限切れセッション破棄
        dropSession()
        # Django ログアウト
        logout(request)
        delLinkSession(sSession)
        return Response({"Bye"}, status=status.HTTP_200_OK)


# パスワード変更
class ChangePass(APIView):
    #
    def post(self, request):
        #
        # ユーザーID取得
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "パスワード変更 session:" + sSession)
        sSql = "Select user_id From link_session Where session = '{:s}'".format(sSession)
        cLog.Logger.log(cLog.INFO, "SQL1:" + sSql)
        cCur = connection.cursor()
        cCur.execute(sSql)
        rec = cCur.fetchone()
        if rec == {}:
            return Response("未ログインでは変更できません", status=status.HTTP_404_NOT_FOUND)
        cLog.Logger.log(cLog.INFO, "link_session:" + str(rec))
        sUser = rec[0]
        # パスワード暗号化
        r_data = request.body
        dData = json.loads(r_data)
        sNewPass = dData['new_password']
        sPass = MakePass.make_password(sNewPass)
        # パスワード更新
        cLog.Logger.log(cLog.INFO, "newPass:" + sNewPass)
        sSql = "Update auth_user set password = '{:s}' Where username = '{:s}'".format(sPass, sUser)
        try:
            cCur = connection.cursor()
            cCur.execute(sSql)
        except Exception as e:
            return Response("Update Error", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # トークン生成・ユーザー情報のレスポンス生成
        return Response("Completed", status=status.HTTP_200_OK)


#
# セッション管理削除
def delLinkSession(sSession_Key:str):
    #
    sSql = "Delete From link_session \n"+\
           "  Where session = '{:s}';"
    sSql = sSql.format(str(sSession_Key))
    #print("SQL:",sSql)
    cCur = connection.cursor()
    cCur.execute(sSql)
    cCur.close()

#
# セッション管理テーブル登録
# {'UserID': username, 'IP': client_addr, 'Token': token,  'Session':rsp_data['Session']}
def entrySessionTable(dUser:dict):
    #
    sSqlIns = "Insert Into link_session(user_id,ip_address,token,session)\n" + \
              "  Values('{:s}', '{:s}', '{:s}', '{:s}');"
    sSql = sSqlIns.format(dUser['UserID'], dUser['IP'], dUser['Token'], dUser['Session'])
    cCur =connection.cursor()
    cCur.execute(sSql)
    cCur.close()


#
# ユーザー情報取得
def getUserInfo(sUserID:str)->dict:
    #
    sSql = "Select first_name,last_name,email From auth_user\n"\
           "  Where username = '{:s}';"
    #
    cCur = connection.cursor()
    cCur.execute(sSql.format(sUserID))
    rec = cCur.fetchone()
    dRslt = {'UserID': sUserID, 'Name': rec[0] + rec[1], 'E-Mail': rec[2]}
    return dRslt


#
# メニュー権限取得
def getMenuItems(sUserID:str)->list:
    #
    dRslt = {}
    #
    sSqlUser = "Select menu_list From user_auth_master\n" +\
               "  Where start_date <='{:s}' And end_date >= '{:s}'\n"\
               "    And user_id = '{:s}'"
    sSqlMenu = "Select display_name, site_link, menu_id From menu_master\n"\
               "  Where start_date <='{:s}' And end_date >= '{:s}'\n"\
               "    And level_no = {:d} And menu_id in ({:s})\n"\
               "  Order By menu_id"
    #
    sToday = datetime.date.today().strftime('%Y/%m/%d')
    sSql = sSqlUser.format(sToday, sToday, sUserID)
    cCur = connection.cursor()
    cCur.execute(sSql)
    dRslt = {}
    rec = cCur.fetchone()
    cCur.close()
    rec = rec[0]
    #print("Record",rec, type(rec))
    lItem = rec['Menu']
    lRslt = []
    for m in lItem:
        dTmp = {}
        #print("Menu d:",m)
        dTmp['MenuNo'] = m[0]
        dTmp['Function'] = m[1:len(m)]
        sSql = sSqlMenu.format(sToday, sToday, m[0], ",".join(map(str,m[1:len(m)])))
        #print("SQL:", sSql)
        cCur2 = connection.cursor()
        cCur2.execute(sSql)
        dTmp['DisplayName'] = []
        dTmp['Link'] = []
        for p in range(0, cCur2.cursor.rowcount):
            rec = cCur2.fetchone()
            dTmp['DisplayName'].append(rec[0])
            dTmp['Link'].append(rec[1])
        #print("Menu Info:",dTmp)
        lRslt.append(dTmp)
        cCur2.close()
    #
    return lRslt


#
# APIマップのRedis登録
# →オンバッチにて、一括登録(日次処理)
def entryRedis(iDBNo:int, sUserID:str, dAPIMap:dict)->bool:
    #
    fRc = False
    #
    return fRc


#
# IPチェック
# sIP:利用者クライアントIPアドレス(V4)
def checkIPWall(sIP:str)->bool:
    #
    if settings.LOCAL_ACCESS == True and sIP == '127.0.0.1':
        return True
    ipClient = IP.ip_address(sIP)
    # settingsからMask取得
    lMasks = settings.FIRE_WALL['Masks']
    for sMask in lMasks:
        ipMask = IP.ip_network(sMask)
        if ipClient in ipMask.hosts():
            return True
    return False


#
# 期限切れセッション破棄
def dropSession():
    #
    sSqlSel = "Delete From link_session\n"\
              "  Where session = (\n"+\
              "    Select session_key from django_session\n"+\
              "      Where expire_date < '{:s}')"
    sSqlDel = "Delete From django_session\n"\
              "  Where expire_date < '{:s}'"
    #
    sNow = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    sSql = sSqlSel.format(sNow)
    print("SQL:", sSql)
    cCur = connection.cursor()
    cCur.execute(sSql)
    sSql = sSqlDel.format(sNow)
    print("SQL:", sSql)
    cCur.execute(sSql)
    cCur.close()
