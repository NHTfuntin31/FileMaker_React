# import request
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.authtoken.models import Token
from dateutil.relativedelta import relativedelta
import re


import ipaddress as IP
from django.conf import settings
import datetime, json
from django.db import connection

# ローカライズ
# 定数定義
from .Common import Log
from .Common import Postgres as PG
from .Common import Strings

#
# スケジュール帳サービス
# get:指定ドクターの指定月前後の予定データを一括で渡す
#     Params:
#     edoctor_no:e-doctorのID
#     date_year:対象日付年
#     date_Month:対象月
#     respose:以下のJSON
#     {"User":{"e-doctor_no":"e-doctor_ID", "No":"FileMaker_No"},
#      "Schedules":[テーブル>schedule_bookのレコード配列] }
class ScheduleBook(APIView):
    #
    cLog = None
    cPostgres = None
    #
    #

    #
    # Get:対象となるスケジュールデータの取得
    #
    def get(self, request):
        #
        dLog = settings.LOG_INFO['LogWeb']
        self.cLog = Log.Log(dLog)
        #
        if "edoctor_no" in request.GET:
            edoctor_no = request.GET.get("edoctor_no")
            print("edoctor_no",edoctor_no)
        else:
            print("param 指定なし")
            return Response({"messegt":"edoctor_noが未指定です。"},status=status.HTTP_400_BAD_REQUEST)
        print("Request User:",edoctor_no)
        if "date_year" in request.GET and "date_month" in request.GET:
            iDateYear = int(request.GET.get("date_year"))
            iDateMonth = int(request.GET.get("date_month"))
        else:
            iDateYear = datetime.date.today().year
            iDateMonth = datetime.date.today().month
        #
        print("URL Params: e-Doctor:{:s} Date:{:d}/{:d}".format(edoctor_no, iDateYear, iDateMonth))
        self.cLog.Logger.log(self.cLog.INFO,"URL Params: e-Doctor:{:s} Date:{:d}/{:d}".format(edoctor_no, iDateYear, iDateMonth))
        #
        curDate = datetime.date(iDateYear,iDateMonth,1)
        fromDate = curDate + relativedelta(months=-3)
        toDate = curDate + relativedelta(months=5)
        sFromDate = fromDate.strftime("%Y/%m/%d")
        sToDate = toDate.strftime("%Y/%m/%d")
        #
        self.cPostgres = PG.Postgres(self.cLog)
        self.cPostgres.connect()
        sSql = "Select id,edoctor_id,no,to_char(tarrget_date, 'yyyy/mm/dd') as tarrget_date,display_char,job_no,time_zone,\n"+\
              "    times,start_time,end_time,classification,cancel,factory_name,\n"+\
              "    address,overview,detail\n"+\
              "  From schedule_book\n"+\
              "  Where edoctor_id = '{:s}' And \n"+\
              "        tarrget_date >= '{:s}' And \n"+\
              "        tarrget_date <= '{:s}' \n"+\
              "  Order By tarrget_date,times,start_time"
        sql = sSql.format(edoctor_no, sFromDate, sToDate)
        print("Schedule Get SQL:",sql)
        cCur = self.cPostgres.getCursor()
        cCur = self.cPostgres.select(cCur, sql)
        lRecords = self.cPostgres.fetchAll(cCur)
        cCur.close()
        self.cPostgres.disconnect()
        #
        rsp_data = {}
        rsp_data["User"] = {"e-doctor_no":lRecords[0]["edoctor_id"], "no":lRecords[0]["no"]}
        if lRecords != None:
            hstatus = status.HTTP_200_OK
            rsp_data["Schedules"] = lRecords
        else:
            hstatus = status.HTTP_204_NO_CONTENT
            rsp_data["Schedules"] = []
        print("Response:",rsp_data)
        return Response(rsp_data, status=hstatus)
    

    #
    # スケジュール追加(プライベートのみ)
    # Request: 
    #   Param:None
    #   Body:{UserInfo":{"UserID": "D021348","Name": "西巻英治","E-Mail": "nisimaki@mtj.biglobe.ne.jp"},
    #         "Schedule":{"id":123456, "tarrget_date":対象日 ,"display_char":表示記号, "times":時間帯, 
    #         "start_time":開始時刻, "end_time":終了時刻, "factory_name":施設名/勤務先名,
    #         "address":住所, "overview":概要, "detail":詳細}
    #       }
    def put(self, request):
        #
        dLog = settings.LOG_INFO['LogWeb']
        self.cLog = Log.Log(dLog)
        r_data = request.body
        dData = json.loads(r_data)
        dUser = dData['User']
        dRecord = dData["Schedule"]
        print("RequestBody",str(dUser)+"\n", dRecord)
        # 入力チェックとSQLボディ生成
        sMsg,sValues = self.validationSchedule(dUser,dRecord)
        rsp_data = {}
        if sMsg != "":
            # 入力エラー
            print("Err:", sMsg)
            rsp_data["User"] = dUser
            rsp_data["Message"] = sMsg
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        # DB登録
        sql = "Insert Into schedule_book(edoctor_id,no,tarrget_date,display_char,job_no,\n"+\
              "    time_zone,times,start_time,end_time,classification,cancel,edit,factory_name,\n"+\
              "    address,overview,detail,ins_user) Values({:s});".format(sValues)
        #
        print("SQL Ins:", sql)
        rsp_data["User"] = dUser
        rsp_data["Message"] = ""
        self.cPostgres = PG.Postgres(self.cLog)
        self.cPostgres.connect()
        cCur = self.cPostgres.getCursor()
        stat, iCount, cCur =self.cPostgres.execute(sql,cCur)
        if stat != self.cPostgres.SQL_EXEC_OK:
            # 登録エラー
            rsp_data["Message"] = "スケジュール登録に失敗しました。"
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        #
        rsp_data = {}
        hsattr = status.HTTP_200_OK
        rsp_data["User"] = dUser
        rsp_data["Message"] = "スケジュールデータを登録しました。"
        return Response(rsp_data,status = status.HTTP_200_OK)


    #
    # スケジュールレコードイメージ生成
    def validationSchedule(self,dUser:dict, dRec:dict):
        #
        sRslt = ""
        sMessage = ""
        #
        # edoctor_id
        print("Date:",dRec)
        if dUser["e-doctor_no"] == None or dUser["e-doctor_no"] == "" :
                sMessage = "システムエラー。"
                return sMessage, ""
        sRslt = "'{:s}',".format(dUser["e-doctor_no"])
        # no
        if dUser["no"] == None or dUser["no"] == "" :
                sMessage = "システムエラー。"
                return sMessage, ""
        sRslt += "{:d},".format(dUser["no"])
        # tarrget_date
        try:
            print("Date:",dRec["tarrget_date"])
            pattern = re.compile(r'(\d{4})/(\d{2})/(\d{2})')
            match = re.search(pattern, dRec["tarrget_date"])
            print("Match", match)
            if match == None:
                sMessage = "日付の形式が不正です。\n入力内容を確認してください。"
                return sMessage, ""
            print("Date:",match.group(1),match.group(2),match.group(3))
            datetime.date(year=int(match.group(1)), month=int(match.group(2)),day=int(match.group(3)))
            sRslt += "'{:s}',".format(dRec["tarrget_date"])
        except Exception as e:
            sMessage = "日付の形式が不正です。\n入力内容を確認してください。" + str(e)
            return sMessage, ""
        # display_char
        if dRec["display_char"] != "◇" and dRec["display_char"] != "▽":
            sMessage = "システムエラー"
            return sMessage, ""
        sRslt += "'{:s}',".format(dRec["display_char"])
        # job_no
        sRslt += "Null,"
        # time_zone
        print(dRec["start_time"], dRec["end_time"])
        tTimeZone = Strings.makeTimeZone(dRec["start_time"], dRec["end_time"])
        if tTimeZone == []:
            sMessage = "時間帯指定に誤りがあります。"
            return sMessage, ""
        print("TimeZone",tTimeZone)
        sRslt += "'{:s}',".format(tTimeZone[0])
        # times
        sRslt += "'{:s}～{:s}',".format(tTimeZone[1],tTimeZone[2])
        # start_time
        sRslt += "'{:s}',".format(tTimeZone[1])
        # end_time
        sRslt += "'{:s}',".format(tTimeZone[2])
        # classification
        sSql = "Select code_pulling from m_code Where code_type = 1201"
        cCur = connection.cursor()
        cCur.execute(sSql)
        dRslt = {}
        rec = cCur.fetchone()
        cCur.close()
        if dRec["classification"] in rec[0]:
            sRslt += "'{:s}',".format(dRec["classification"])
        else:
            sMessage = "区分指定を選択してください"
            return sMessage, ""
        # cancel
        sRslt += str(dRec["cancel"])+ ","
        # edit
        sRslt += "False,"
        # factory_name
        sRslt += "'{:s}',".format(dRec["factory_name"])
        # address
        sRslt += "'{:s}',".format(dRec["address"])
        # overview
        sRslt += "'{:s}',".format(dRec["overview"])
        # detail
        sRslt += "'{:s}',".format(dRec["detail"])
        # ins_user
        sRslt += "'{:s}'".format(dUser["e-doctor_no"])
        #
        return sMessage , sRslt


    #
    # スケジュール更新プライベートのみ)
    # Request: 
    #   Param:None
    #   Body:{UserInfo":{"UserID": "D021348","Name": "西巻英治","E-Mail": "nisimaki@mtj.biglobe.ne.jp"},
    #         "Schedule":{"id":123456, "tarrget_date":対象日 ,"display_char":表示記号, "times":時間帯, 
    #         "start_time":開始時刻, "end_time":終了時刻, "factory_name":施設名/勤務先名,
    #         "address":住所, "overview":概要, "detail":詳細}
    #       }
    def post(self, request):
        #
        sql = "update schedule_book set tarrget_date='{:s}', display_char = '{:s}',\n"+\
              "       time_zone = '{:s}', times = '{:s}', start_time = '{:s}',\n"+\
              "       end_time = '{:s}',classification = '{:s}' ,cancel = {:s},\n"+\
              "       factory_name = '{:s}', address = '{:s}',overview='{:s}',\n"+\
              "       detail='{:s}',upd_user='{:s}' \n"+\
              "  Where id = '{:s}"
        #
        dLog = settings.LOG_INFO['LogWeb']
        self.cLog = Log.Log(dLog)
        r_data = request.body
        dData = json.loads(r_data)
        dUser = dData['User']
        dRecord = dData["Schedule"]
        # 入力チェックとSQLボディ生成
        sMsg,dValues = self.validationSchedulePost(dUser,dRecord)
        if sMsg != "":
            # 入力エラー
            rsp_data["User"] = dUser
            rsp_data["Message"] = sMsg
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        # DB登録
        sSql = sql.format(dValues["tarrget_date"],dValues["display_char"],dValues["time_zone"],\
                          dValues["times"],dValues["start_time"],dValues["end_time"],\
                          dValues["classification"],dValues["cancel"],dValues["factory_name"],\
                          dValues["address"],dValues["overview"],dValues["detail"],dValues["upd_user"],\
                          dValues["edoctor_id"])
        #
        rsp_data["User"] = dUser
        rsp_data["Message"] = ""
        self.cPostgres = PG.Postgres(self.cLog)
        self.cPostgres.connect()
        cCur = self.cPostgres.getCursor()
        stat, iCount, cCur =self.cPostgres.execute(sql,cCur)
        if stat != ChildProcessError.SQL_EXEC_OK:
            # 登録エラー
            rsp_data["Message"] = "スケジュール更新に失敗しました。"
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        #
        rsp_data = {}
        hsattr = status.HTTP_200_OK
        rsp_data["User"] = dUser
        rsp_data["Message"] = "スケジュールデータを更新しました。"
        return Response(rsp_data,status = status.HTTP_200_OK)


    #
    # スケジュールレコードイメージ生成
    def validationSchedulePost(self,dUser:dict, dRec:dict):
        #
        sRslt = ""
        sMessage = ""
        dRslt = {}
        #
        # edoctor_id
        if dUser["e-doctor_no"] == None or dUser["e-doctor_no"] == "" :
                sMessage = "システムエラー。"
                return sMessage, {}
        dRslt["id"] = dRec["id"]
        # no
        if dUser["no"] == None or dUser["no"] == "" :
                sMessage = "システムエラー。"
                return sMessage, {}
        dRslt["no"] = dUser["no"]
        # tarrget_date
        try:
            pattern = re.compile(r'(\d{4})/(\d{2})/(\d{2})')
            match = re.search(pattern, dRec["tarrget_date"])
            if match == None:
                sMessage = "日付の形式が不正です。\n入力内容を確認してください。"
                return sMessage, ""
            datetime.date(year=match.group(1), month=match.group(2),day=match.group(3))
            dRslt["tarrget_date"] = dRec["tarrget_date"]
        except:
            sMessage = "日付の形式が不正です。\n入力内容を確認してください。"
            return sMessage, {}
        # display_char
        if dRec["display_char"] != "◇" and dRec["display_char"] != "▽":
            sMessage = "システムエラー"
            return sMessage, {}
        dRslt["display_char"] = dRec["display_char"]
        # job_no
        dRslt["job_no"] += "Null"
        # time_zone
        tTimeZone = Strings.makeTimeZone(dRec["start_time"], dRec["end_time"])
        if tTimeZone == []:
            sMessage = "時間帯指定に誤りがあります。"
            return sMessage, ""
        dRslt["time_zone"] = tTimeZone[0]
        # times
        dRslt["times"] = "'{:s}～{:s}'".foramt(tTimeZone[1],tTimeZone[2])
        # start_time
        dRslt["start_time"] = "{:s}".format(tTimeZone[1])
        # end_time
        dRslt["end_time"] = "{:s}".format(tTimeZone[2])
        # classification
        sSql = "Select code_pulling from m_code Where code_type = 1201"
        cCur = connection.cursor()
        cCur.execute(sSql)
        rec = cCur.fetchone()
        cCur.close()
        if dRec["classification"] in rec[0]:
            dRslt["classification"] = format(dRec["classification"])
        else:
            sMessage = "区分指定を選択してください"
            return sMessage, {}
        # cancel
        dRslt["cancel"] = dRec["calcen"]
        # factory_name
        dRslt["factory_name"] = dRec["factory_name"]
        # address
        dRslt["address"] = dRec["address"]
        # overview
        dRslt["overview"] = dRec["overview"]
        # detail
        dRslt["detail"] = dRec["detail"]
        # ins_user
        dRslt["ins_user"] = dUser["e-doctor_no"]
        #
        return sMessage , dRslt


#
# 付帯サービス
class Masters(APIView):
    #
    cPostgres = None
    #
    #

    #
    # Get:対象となる各種コードマスター取得
    #
    def get(self, request):
        #
        cCur = connection.cursor()
        sql = "Select code_type, code_pulling, value_pulling\n"+\
              "  From m_code Where code_type in (1201,1203) Order By code_type"
        #
        lRecs = [{},{}]
        cCur.execute(sql)
        rec = cCur.fetchone()
        lRecs[0][rec[0]] = {"Code":rec[1], "Value":rec[2]}
        rec = cCur.fetchone()
        lRecs[1][rec[0]] = {"Code":rec[1], "Value":rec[2]}
        cCur.close()
        #
        rsp_data = {"Master":lRecs}
        return Response(rsp_data,status = status.HTTP_200_OK)
