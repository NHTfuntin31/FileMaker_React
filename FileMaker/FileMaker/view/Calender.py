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
# 祝祭日カレンダーサービス
# get:当年の祝祭日一覧を返す
#     Params:"edoctor_no"
#     respose:以下のJSON
#     {"Holiday":{"yyyy/mm/dd":"祝祭日名",…} }
class Calender(APIView):
    #
    cLog = None
    cPostgres = None
    #
    #

    #
    # Get:対象となるカレンダーの取得
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
        #
        curDate = datetime.date.today()
        sFromDate = "{:d}/01/01".format(curDate.year)
        sToDate = "{:d}/12/31".format(curDate.year)
        #
        self.cPostgres = PG.Postgres(self.cLog)
        self.cPostgres.connect()
        sSql = "Select day,shift,name\n"+\
              "  From holiday_calendar\n"+\
              "  Where day >= '{:s}' And \n"+\
              "        day <= '{:s}'\n"+\
              "  Order By day"
        sql = sSql.format(sFromDate, sToDate)
        #print("Schedule Get SQL:",sql)
        cCur = self.cPostgres.getCursor()
        cCur = self.cPostgres.select(cCur, sql)
        lRecords = self.cPostgres.fetchAll(cCur)
        cCur.close()
        self.cPostgres.disconnect()
        #print("Schedule Get Data:",lRecords)
        #
        rsp_data = {}
        dtmp = {}
        for dRec in lRecords:
            dtmp[dRec["day"].strftime("%Y/%m/%d")] = dRec["name"]
            print("rec",dtmp)
        if dtmp == {}:
            hstatus = status.HTTP_204_NO_CONTENT
            rsp_data["Schedules"] = []
        else:
            hstatus = status.HTTP_200_OK
        rsp_data["Holiday"] = dtmp
        #print("Response:",rsp_data)
        return Response(rsp_data, status=hstatus)
