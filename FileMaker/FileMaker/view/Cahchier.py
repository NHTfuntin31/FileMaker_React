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
from .Common import Library

#
# 対象ドクターの収支データ管理」
# get   :指定年月の収支データを取得
# post  :新規追加
# put   ;登録データ更新
# delete:指定データ削除(完全削除)
# 
class Cahchier(APIView):
    #
    #
    cLog = None
    cPostgres = None
    #
    # 対象ドクター/指定年月での収支データを取得する。
    #     Params:
    #     edoctor_no:e-doctorのID
    #     date_year:対象日付年
    #     date_Month:対象月
    #     respose:以下のJSON
    #     {"User":{"e-doctor_no":"e-doctor_ID", "no":"no"},
    #      "Schedules":[テーブル>cashier_accountのレコード配列] }
    def get(self, request):

        dLog = settings.LOG_INFO['LogWeb']
        self.cLog = Log.Log(dLog)
        #
        if "e-doctor_no" in request.GET:
            edoctor_no = request.GET.get("e-doctor_no")
            #print("edoctor_no",edoctor_no)
        else:
            #print("param 指定なし")
            return Response({"messegt":"e-doctor_noが未指定です。"},status=status.HTTP_400_BAD_REQUEST)
        #print("Request User:",edoctor_no)
        if "date_year" in request.GET and "date_month" in request.GET:
            iDateYear = int(request.GET.get("date_year"))
            iDateMonth = int(request.GET.get("date_month"))
        else:
            iDateYear = datetime.date.today().year
            iDateMonth = datetime.date.today().month
        #
        #print("URL Params: e-Doctor:{:s} Date:{:d}/{:d}".format(edoctor_no, iDateYear, iDateMonth))
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
        sSql = "Select to_char(tarrget_date,'YYYY/MM/DD') tarrget_date,division,job_no,expense_item,price,memo,to_char(payment_date,'YYYY/MM/DD') payment_date,\n"+\
               "    edoctor_id,no,id\n"+\
               "  From cashier_account\n"+\
               "  Where edoctor_id = '{:s}' And \n"+\
               "        tarrget_date >= '{:s}' And \n"+\
               "        tarrget_date <= '{:s}' \n"+\
               "  Order By tarrget_date,id"
        sql = sSql.format(edoctor_no, sFromDate, sToDate)
        #print("Schedule Get SQL:",sql)
        cCur = self.cPostgres.getCursor()
        cCur = self.cPostgres.select(cCur, sql)
        lRecords = self.cPostgres.fetchAll(cCur)
        cCur.close()
        cLib = Library.Library(self.cPostgres, self.cLog)
        dMaster = cLib.getMasters(["1202"])
        self.cPostgres.disconnect()
        #
        rsp_data = {}
        if len(lRecords) != 0:
            rsp_data["User"] = {"e-doctor_no":lRecords[0]["edoctor_id"], "no":lRecords[0]["no"]}
        else:
            rsp_data["User"] = {"e-doctor_no":edoctor_no}
        if lRecords != None:
            hstatus = status.HTTP_200_OK
            rsp_data["Cashier"] = lRecords
        else:
            hstatus = status.HTTP_204_NO_CONTENT
            rsp_data["Cashier"] = []
        rsp_data["Master"] = dMaster["Master"]
        #print("Response:",rsp_data)
        return Response(rsp_data, status=hstatus)
    

    # post  :新規追加
    # 対象ドクター/指定日の収支データを登録する。
    #     Params: None
    #     request.body:以下のJSON
    #     {"User":{"e-doctor_no":"e-doctor_ID", "no":"no"},
    #      "Schedules":{} }
    def post(self, request):

        dLog = settings.LOG_INFO['LogWeb']
        self.cLog = Log.Log(dLog)
        self.cPostgres = PG.Postgres(self.cLog)
        #
        r_data = request.body
        dData = json.loads(r_data)
        dUser = dData['User']
        dRecord = dData["Cashier"]
        #
        if "e-doctor_no" not in dUser:
            print("Body 指定なし")
            return Response({"messegt":"e-doctor_noが未指定です。"},status=status.HTTP_400_BAD_REQUEST)
        #print("Request User:",dUser["edoctor_no"])
        print("Drec:", dRecord)
        if dRecord == {}:
            print("Body 指定なし")
            return Response({"messegt":"出納情報が未指定です。"},status=status.HTTP_400_BAD_REQUEST)
        #print("Request User:",dUser)
        #
        #print("e-Doctor:{:s}".format(dUser["edoctor_no"]))
        self.cLog.Logger.log(self.cLog.INFO,"e-Doctor:{:s}".format(dUser["e-doctor_no"]))
        #
        sSquIns = "Insert Into cashier_account(edoctor_id,no,tarrget_date,expense_item,\n"+\
                  "    payment_date,division,price,memo,ins_user) Values({:s})"
        self.cPostgres.connect()
        rsp_data = {}
        rsp_data["User"] = dUser
        try:
            sValue = "'" + dUser["e-doctor_no"] + "'," + str(dUser["no"]) + ","
            sValue += "'" + dRecord["tarrget_date"] + "',"
            sValue += "'" + dRecord["expense_item"] + "',"
            if dRecord["payment_date"] != None :
                sValue += "'" + dRecord["payment_date"] + "',"
            else:
                sValue += "Null,"
            sValue += "'" + dRecord["division"] + "',"
            sValue += str(dRecord["price"]) + ","
            sValue += "'" + dRecord["memo"] + "',"
            sValue += "'" + dUser["e-doctor_no"] + "'"
        except Exception as e:
            print("sValue:", sValue,e)
            rsp_data["Message"] = "入力項目値が不正です。" + str(e)
            self.cPostgres.disconnect()
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        sSql = sSquIns.format(sValue)
        cCur = self.cPostgres.getCursor()
        stat, iCount, cCur =self.cPostgres.execute(sSql,cCur)
        if stat != self.cPostgres.SQL_EXEC_OK:
            # 登録エラー
            rsp_data["Message"] = "登録に失敗しました。"
            self.cPostgres.disconnect()
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        #
        self.cPostgres.commit()
        self.cPostgres.disconnect()
        rsp_data = {}
        rsp_data["User"] = dUser
        rsp_data["Message"] = "登録しました。"
        return Response(rsp_data,status = status.HTTP_200_OK)

        
    # post  :更新
    # 対象ドクター/指定日の収支データを登録する。
    #     Params: None
    #     request.body:以下のJSON
    #     {"User":{"e-doctor_no":"e-doctor_ID", "no":"no"},
    #      "Schedules":{} }
    def put(self, request):

        dLog = settings.LOG_INFO['LogWeb']
        self.cLog = Log.Log(dLog)
        self.cPostgres = PG.Postgres(self.cLog)
        #
        r_data = request.body
        dData = json.loads(r_data)
        dUser = dData['User']
        dRecord = dData["Cashier"]
        print("**",dUser,dRecord)
        #
        if dRecord == {}:
            print("Body 指定なし")
            return Response({"messegt":"出納情報が未指定です。"},status=status.HTTP_400_BAD_REQUEST)
        #print("Request User:",dRecord)
        #
        print("e-Doctor:{:s}".format(dUser["e-doctor_no"]))
        self.cLog.Logger.log(self.cLog.INFO,"e-Doctor:{:s}".format(dUser["e-doctor_no"]))
        #
        if dRecord["payment_date"] == None:
            dRecord["payment_date"] = "Null"
        else:
            dRecord["payment_date"] = "'" + dRecord["payment_date"] + "'"
        sSquUpd = "Update cashier_account Set edoctor_id = '{:s}',no = {:d}, tarrget_date = '{:s}',\n"+\
                  "    expense_item = '{:s}', payment_date = {:s}, division = '{:s}', price ={:d},\n"+\
                  "    memo = '{:s}',upd_user = '{:s}' \n"+\
                  "  Where id = {:d}"
        if dRecord["id"] == None:
            return Response({"messegt":"ID情報が未指定(新規登録対象）です。"},status=status.HTTP_400_BAD_REQUEST)
        self.cPostgres.connect()
        rsp_data = {}
        rsp_data["User"] = dUser
        if dRecord["payment_date"] == None:
            dRecord["payment_date"] = "Null"
        try:
            if dRecord["payment_date"] == None:
                dRecord["payment_date"] = 'Null'
            sSql = sSquUpd.format(dUser["e-doctor_no"], dUser["no"], dRecord["tarrget_date"],\
                                  dRecord["expense_item"],dRecord["payment_date"], \
                                  dRecord["division"],dRecord["price"],\
                                  dRecord["memo"],dUser["e-doctor_no"],dRecord["id"])
        except Exception as e:
            rsp_data["Message"] = "入力項目値が不正です。" + str(e)
            self.cPostgres.disconnect()
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        #print("SQL:", sSql)
        cCur = self.cPostgres.getCursor()
        stat, iCount, cCur =self.cPostgres.execute(sSql,cCur)
        if stat != self.cPostgres.SQL_EXEC_OK:
            # 登録エラー
            rsp_data["Message"] = "更新に失敗しました。"
            self.cPostgres.disconnect()
            return Response(rsp_data,status = status.HTTP_400_BAD_REQUEST)
        #
        self.cPostgres.commit()
        self.cPostgres.disconnect()
        rsp_data = {}
        rsp_data["User"] = dUser
        rsp_data["Message"] = "更新しました。"
        return Response(rsp_data,status = status.HTTP_200_OK)
