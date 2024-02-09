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
from .Common import Postgres as PG


#
# 新病院リスト サービスクラス
#
class FindHospital(APIView):
    #
    # 対象病院情報取得と、候補リスト取得
    # request Param: ?UserID=xxxxx…#ClientCD=9999…
    # Rsp: {"ClientCD":999…, ""}
    # 
    def get(self,request):
        #
        sSql_1 = "Select prefecture_code,medical_institution_cd,client_code,zip_cd,address,\n" +\
                 "    medical_institution_name,tel_no,representative_name,\n" +\
                 "    number_of_beds,number_fulltime_doctors,number_parttime_doctors,\n" +\
                 "    dupe_record From hospital_list \n" +\
                 "  Where client_code = {:d} And del_flag = false"
        sSql_2 = "Select prefecture_code,medical_institution_cd,client_code,zip_cd,address,\n" +\
                 "    medical_institution_name,tel_no,representative_name,\n" +\
                 "    number_of_beds,number_fulltime_doctors,number_parttime_doctors,\n" +\
                 "    dupe_record From hospital_list \n" +\
                 "  Where zip_cd = {:d} And client_code is Null"
        # 
        rsp_data = {}
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "新病院リスト 病院情報・候補取得/session:" + sSession)
        cPG = PG.Postgres(cLog)
        fRc = cPG.connect()
        if not fRc:
            rsp_data['Msg'] = "サーバーエラー:SE部へ連絡してください"
            rsp_data['Statu'] = "RDB Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        # パラメータ取得
        sUserID = request.GET.get('UserID')
        iClientCD = request.GET.get('ClientCD')
        try:
            if type(iClientCD) == str:
                iClientCD = int(iClientCD)
        except Exception as e:
            dLog.ExceptionLog(e, "パラメータ:統一クライアントコード不正" + iClientCD)
            rsp_data['Msg'] = "統一クライアントコードは、数字で指定してください。"
            rsp_data['Statu'] = "Param Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        #
        sSql = sSql_1.format(iClientCD)
        cLog.Logger.log(cLog.INFO, "病院情報取得 SQL:" + sSql)
        cCur = cPG.getNameCursor()
        cCur = cPG.select(cCur, sSql)
        rec = cPG.fetchOne(cCur)
        if rec == {}:
            cLog.Logger.log(cLog.INFO, "未登録病院照会:User" + sUserID + " 対象クライアントCD:" + str(iClientCD))
            rsp_data['Msg'] = "該当する診療所は未登録です。"
            rsp_data['Statu'] = "OK"
            cCur.close()
            cPG.disconnect()
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        #
        rsp_data['Msg'] = ""
        rsp_data['Stat'] = "医療機関コード未確定"
        rsp_data['']
        if rec['medical_institution_cd'] == None :
            rsp_data['Status'] = "医療機関コード確定済"
        # 候補リスト抽出
        sSql = sSql_2.format(iClientCD)
        cLog.Logger.log(cLog.INFO, "病院情報取得 SQL:" + sSql)
        cPG.select(cCur, sSql)
        recs = cPG.fetchAll(cCur)
        rsp_data['candidate'] = recs
        rsp_data['Statu'] = "OK"
        cCur.close()
        cPG.disconnect()
        return Response(rsp_data, status=status.HTTP_200_OK)


    #
    # 選択医療機関コードへ書き換え
    # 
    # request Param: ?ClientCD=9999999#HospitalCode=XXXXXXXXXX
    #
    def post(self,request):
        #
        rsp_data = {}
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "新病院リスト 病院情報・候補取得/session:" + sSession)
        cPG = PG.Postgres(cLog)
        fRc = cPG.connect()
        if not fRc:
            rsp_data['Msg'] = "サーバーエラー:SE部へ連絡してください"
            rsp_data['Statu'] = "RDB Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        # パラメータ/データボディ取得
        sUserID = request.POST.get('UserID')
        #
        r_data = request.body
        dData = json.loads(r_data)
        iFunction = dData['Function']
        sPrefCD = dData['PrefCD']
        iClientCD = dData['ClientCD']
        if "MedicalInstitutionCD1" in dData:
            sMedicalInstitutionCD1 = dData['MedicalInstitutionCD1']
        else:
            sMedicalInstitutionCD1 = ""
        if "MedicalInstitutionCD2" in dData:
            sMedicalInstitutionCD2 = dData['MedicalInstitutionCD2']
        else:
            sMedicalInstitutionCD2 = ""
        #
        # 処理振り分け
        WebStat = None
        match(iFunction):
            case 1: # 解除
                fRc = self.removeMedicalInstitutionCD(cLog, cPG, sUserID, iClientCD, sMedicalInstitutionCD1)
                if fRc:
                    cLog.Logger.log(cLog.INFO, "医療機関コード解除 USerID:{:s} ClientCD:{:d} 医療機関CD:{:s}".formant(sUserID, iClientCD, sMedicalInstitutionCD))
                    rsp_data['Msg'] = "処理完了しました"
                    rsp_data['Statu'] = "OK"
                    WebStat = status.HTTP_200_OK
                else:
                    cLog.Logger.log(cLog.ERROR, "医療機関コード解除 USerID:{:s} ClientCD:{:d} 医療機関CD:{:s}".formant(sUserID, iClientCD, sMedicalInstitutionCD))
                    rsp_data['Msg'] = "処理エラー"
                    rsp_data['Statu'] = "OK"
                    WebStat = status.HTTP_500_INTERNAL_SERVER_ERROR
                    cPG.rollback()
                cPG.disconnect()
            case 2: # 設定
                fRc = self.setMedicalInstitutionCD(cLog, cPG, sUserID, iClientCD, sPrefCD, sMedicalInstitutionCD2)
                cLog.Logger.log(cLog.INFO, "医療機関コード解除 USerID:{:s} ClientCD:{:d} 医療機関CD:{:s}".formant(sUserID, iClientCD, sMedicalInstitutionCD))
                rsp_data['Msg'] = "処理完了しました"
                rsp_data['Statu'] = "OK"
                WebStat = status.HTTP_200_OK
                cPG.disconnect()
            case 3: # 変更
                fRc = self.changeMedicalInstitutionCD(cLog, cPG, sUserID, iClientCD, sPrefCD, sMedicalInstitutionCD1, sMedicalInstitutionCD2)
                cLog.Logger.log(cLog.INFO, "医療機関コード解除 USerID:{:s} ClientCD:{:d} 医療機関CD:{:s}".formant(sUserID, iClientCD, sMedicalInstitutionCD))
                rsp_data['Msg'] = "処理完了しました"
                rsp_data['Statu'] = "OK"
                WebStat = status.HTTP_200_OK
                cPG.disconnect()
            case _: # エラー
                cLog.Logger.log(cLog.ERROR, "機能コード不正" + str(iFunction))
                rsp_data['Msg'] = "フロントAPL不正動作です。"
                rsp_data['Statu'] = "Param Error"
                cPG.disconnect()
                return Response(rsp_data, status=status.HTTP_400_BAD_REQUEST)
        return Response(rsp_data, status=WebStat)



    #
    # 医療機関CD解除
    def removeMedicalInstitutionCD(self, cLog:Log.Log, cDB:PG.Postgres, sUserID:str,\
                                   iClientCD:int, sMedicalInstitutionCD:str)->bool:
        #
        # check
        sSql_00 = "Select count(*) From hospital_list \n"+\
                  "  Where client_code = {:d} And medical_institution_cd = ''"
        # 削除済病院リスト復活
        sSql_01 = "Update hospital_list set delflag = false, upd_name = '{:s}'\n"+\
                  "  Where clinic_code = {:s} and medical_institution_cd = ''"
        # 医療機関CD削除
        sSql_02 = "Update hospital_list set medical_institution_cd = '', upd_name = '{:s}'\n"+\
                  "  Where clinic_code = {:s} and medical_institution_cd = '{:s}'"
        # クライアントコード削除
        sSql_03 = "Update hospital_list set client_code = null, upd_name = '{:s}' \n"+\
                  "  Where client_code = {:d} and medical_institution_cd = '{:s}'"
        #
        cLog.Logger.log(cLog.INFO, "医療機関コード 解除処理開始")
        sSql = sSql_00.format(iClientCD)
        cCur = cDB.getCursor()
        lRec = cDB.fetchOne(cCur)
        try:
            if lRec[0] == 0:
                # 病院リスト側レコードなし、医療機関CD抹消
                sSql = sSql_02.format(iClientCD, sMedicalInstitutionCD)
                iState, iCount, cCur = cDB.execute(cCur, sSql)
                if iState == cDB.SQL_EXEC_OK:
                    cDB.commit()
                    return True
            else:
                # 病院リスト側レコード復活
                sSql = sSql_01.format(sUserID, iClientCD)
                iState, iCount, cCur = cDB.execute(sSql, cCur)
                if iState == cDB.SQL_EXEC_ERROR:
                    cDB.rollback()
                    return False
                # 厚労省側レコードからクライアントCD抹消
                sSql = sSql_03.format(sUserID, iClientCD, sMedicalInstitutionCD)
                iState, iCount, cCur = cDB.execute(sSql, cCur)
                if iState == cDB.SQL_EXEC_OK:
                    cDB.commit()
                    return True
        except Exception as e:
            cLog.ExceptionLog(e, "医療機関CD 解除操作にて例外")
        return False


    #
    # 医療機関CD設定
    def setMedicalInstitutionCD(self, cLog:Log.Log, cPG:PG.Postgres, sUserID:str, iClientCD:int, \
                                sPrefCD:str, sMedicalInstitutionCD1:str, sMedicalInstitutionCD2:str,\
                                )->bool:
        #
        cLog.Logger.log(cLog.INFO, "医療機関CD 設定処理を開始")
        #
        # 項目補完の為、先読み
        sSql_01 = "Select dupe_record,last_survey,contracted,aggregation_target,\n"+\
                  "    treatment_category,area_cd,portal_area,medical_checkup_area,"+\
                  "    industrial_physician_area,dental_area,mdoc_area,nursing_area,"+\
                  "    fulltime_area,comment" +\
                  "  Where client_code = {:d} And medical_institution_cd = '{:s}'"
        # 差分更新
        sSql_02 = "Update hospital_list set dupe_record = '{:s}',last_survey = '{:s}',contracted = '{:s}',\n"+\
                  "    aggregation_target= {:d},treatment_category = '{:s}',area_cd = '{:s}',\n"+\
                  "    portal_area = '{:s}',medical_checkup_area = '{:s}',\n"+\
                  "    industrial_physician_area = '{:s}',dental_area = '{:s}',\n"+\
                  "    mdoc_area = '{:s}',nursing_area = '{:s}',fulltime_area = '{:s}',\n"+\
                  "    comment = '{:s}', upd_name = '{:s}'\n"+\
                  "  Where medical_institution_cd = '{:s} and prefecture_code='{:s} And client_code is Null"
        # SQL クライアントCD設定
        sSql_03 = "Update hospital_list set client_code = {:d}, upd_name = '{:s}'\n"+\
                  "  Where medical_institution_cd = '{:s} and prefecture_code='{:s}"
        # 紐無し病院リスト側レコード論理削除
        sSql_04 = "Update hospital_list set del_flag = true, upd_name = '{:s}' \n"+\
                  "  Where client_code = {:d} And medical_institution_cd = ''"
        # 病院リスト側項目転記
        sSql = sSql_01.format(iClientCD, sMedicalInstitutionCD1)
        cCur = cPG.select(cCur, sSql)
        dRec = cPG.fetchOne(cCur)
        if dRec == None:
            return False
        sSql = sSql_02.format(dRec[0],dRec[1],dRec[2],dRec[3],dRec[4],dRec[5],dRec[6],dRec[7],\
                              dRec[8],dRec[9],dRec[10],dRec[11],dRec[12],dRec[13], sUserID,\
                              sMedicalInstitutionCD2, sPrefCD)
        iState, iCounr, cCur = cPG.execute(sSql, cCur)
        if iState == cPG.SQL_EXEC_ERROR:
            cPG.rollback()
            return False
        # 厚労省レコードに附番
        sSql = sSql_03.format(iClientCD, sUserID, sMedicalInstitutionCD2, sPrefCD)
        iState, iCounr, cCur = cPG.execute(sSql, cCur)
        if iState == cPG.SQL_EXEC_ERROR:
            cPG.rollback()
            return False
        # 病院リスト側、論理削除
        sSql = sSql_04.format(sUserID, sMedicalInstitutionCD1)
        iState, iCounr, cCur = cPG.execute(sSql, cCur)
        if iState == cPG.SQL_EXEC_ERROR:
            cPG.rollback()
            return False
        #
        return True


    #
    # 医療機関CD付け替え
    def changeMedicalInstitutionCD(self, cLog:Log.Log, cPG:PG.Postgres, sUserID:str, iClientCD:int, sPrefCD:str,\
                                    sMedicalInstitutionCD1:str, sMedicalInstitutionCD2:str)->bool:
        #
        # SQL 元レコードから、病院リスト系項目転記
        # 項目補完の為、先読み
        sSql_01 = "Select dupe_record,last_survey,contracted,aggregation_target,\n"+\
                  "    treatment_category,area_cd,portal_area,medical_checkup_area,"+\
                  "    industrial_physician_area,dental_area,mdoc_area,nursing_area,"+\
                  "    fulltime_area,comment" +\
                  "  Where client_code = {:d} And medical_institution_cd = '{:s}'"
        # 差分更新
        sSql_02 = "Update hospital_list set dupe_record = '{:s}',last_survey = '{:s}',contracted = '{:s}',\n"+\
                  "    aggregation_target= {:d},treatment_category = '{:s}',area_cd = '{:s}',\n"+\
                  "    portal_area = '{:s}',medical_checkup_area = '{:s}',\n"+\
                  "    industrial_physician_area = '{:s}',dental_area = '{:s}',\n"+\
                  "    mdoc_area = '{:s}',nursing_area = '{:s}',fulltime_area = '{:s}',\n"+\
                  "    comment = '{:s}', upd_name = '{:s}'\n"+\
                  "  Where medical_institution_cd = '{:s} and prefecture_code='{:s} And client_code is Null"
        # 元レコードのクライアントコード抹消
        sSql_03 = "Update hospital_list set client_code = null , upd_name = '{:s}'\n"+\
                  "  Where medical_institution_cd = '{:s} and prefecture_code='{:s}"
        # 先レコードのクライアントコード補完
        sSql_04 = "Update hospital_list set client_code = {:d}, upd_name = '{:s}'\n"+\
                  "  Where medical_institution_cd = '{:s} and prefecture_code='{:s} And client_code is Null"
        #
        # 病院リスト側項目転記
        sSql = sSql_01.format(iClientCD, sMedicalInstitutionCD1)
        cCur = cPG.select(cCur, sSql)
        dRec = cPG.fetchOne(cCur)
        if dRec == None:
            return False
        sSql = sSql_02.format(dRec[0],dRec[1],dRec[2],dRec[3],dRec[4],dRec[5],dRec[6],dRec[7],\
                              dRec[8],dRec[9],dRec[10],dRec[11],dRec[12],dRec[13], sUserID,\
                              sMedicalInstitutionCD2, sPrefCD)
        iState, iCounr, cCur = cPG.execute(sSql, cCur)
        if iState == cPG.SQL_EXEC_ERROR:
            cPG.rollback()
            return False
        # 
        sSql = sSql_03.format(sUserID, sMedicalInstitutionCD1, sPrefCD)
        iState, iCounr, cCur = cPG.execute(sSql, cCur)
        if iState == cPG.SQL_EXEC_ERROR:
            cPG.rollback()
            return False
        # 
        sSql = sSql_04.format(iClientCD, sUserID, sMedicalInstitutionCD2, sPrefCD)
        iState, iCounr, cCur = cPG.execute(sSql, cCur)
        if iState == cPG.SQL_EXEC_ERROR:
            cPG.rollback()
            return False
        #
        return True


    #
    # 指定医療機関 解除
    # Partam ?UserID=999999#ClientCD=ZZZZZZ9
    def delete(self,request):
        #
        rsp_data = {}
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "新病院リスト 病院情報・候補取得/session:" + sSession)
        cPG = PG.Postgres(cLog)
        fRc = cPG.connect()
        if not fRc:
            rsp_data['Msg'] = "サーバーエラー:SE部へ連絡してください"
            rsp_data['Statu'] = "RDB Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        # パラメータ取得
        sUserID = request.DELETE.get('UserID')
        iClientCD = request.DELETE.get('ClientCD')
        smedical_institution_cd = request.GET.get('medical_institution_cd')
        try:
            if type(iClientCD) == str:
                iClientCD = int(iClientCD)
        except Exception as e:
            dLog.ExceptionLog(e, "パラメータ:統一クライアントコード不正" + iClientCD)
            rsp_data['Msg'] = "統一クライアントコードは、数字で指定してください。"
            rsp_data['Statu'] = "Param Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        #
        sSql_01 = "Update hospital_list set del_flag = true, upd_name = '{:s}' \n" +\
                  "  Where client_code = {:d}".format(iClientCD, sUserID)
        #
        sSql = sSql_01.format(sUserID, iClientCD)
        iStat, iCount, cCur = cPG.execute(sSql, cCur)
        if iCount < 1:
            rsp_data['Msg'] = "登録処理で処理エラーを検出しました。"
            rsp_data['Statu'] = "NG"
            cPG.rollback()
            cPG.disconnect()
            return Response(rsp_data, status=status.HTTP_304_NOT_MODIFIED)
        rsp_data['Msg'] = "統一クライアントコード:" + str(iClientCD) +\
                          "を論理削除しました"
        rsp_data['Statu'] = "OK"
        cPG.commit()
        cPG.disconnect()
        return Response(rsp_data, status=status.HTTP_200_OK)



#
# 地域区分管理
class HostpitalArea(APIView):
    #
    # Request Param:
    #  ?UserID=XXXXX…#ClientCD=999…
    # Rsp Body:
    # OK:
    # { 'HospitalInfomation':{'ClientCD': zzzzz9, 'ClinicName': 'XXXX…',},
    #   'ListItems':[{'北海道': '010', '札幌': '011', '東北': '020', '東北(東京)': '021', '仙台': '022', 
    #             '東京': '030', '中部(東京)': '041', '中部(大阪)': '042', '名古屋': '050', '大阪': '060', 
    #             '中四国': '070', '福岡': '080', '海外': '090'},…,{…}
    #               ]
    # }
    # 病院の地域区分を取得する
    #
    def get(self, request):
        #
        # 対象病院情報取得
        sSql_1 = "Select prefecture_code,medical_institution_cd,client_code,zip_cd,address,\n" +\
                 "    medical_institution_name,tel_no,representative_name,\n" +\
                 "    number_of_beds,number_fulltime_doctors,number_parttime_doctors,\n" +\
                 "    dupe_recordarea_cd,portal_area,medical_checkup_area,\n" +\
                 "    industrial_physician_area,dental_area,mdoc_area,nursing_area,fulltime_area \n" +\
                 "  From hospital_list \n" +\
                 "  Where client_code = {:d} And del_flag = false"
        # 選択リストガイドをマスターから取得
        sSql_2 = "Select value_pulling from m_code \n"+\
                 "  Where code_type in (200,201,202,203,204,205,206,207,208)\n"+\
                 "  Order by code_type"
        #
        rsp_data = {}
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "新病院リスト 病院情報・地域区分取得/session:" + sSession)
        cPG = PG.Postgres(cLog)
        fRc = cPG.connect()
        if not fRc:
            rsp_data['Msg'] = "サーバーエラー:SE部へ連絡してください"
            rsp_data['Statu'] = "RDB Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        # パラメータ取得
        sUserID = request.DELETE.get('UserID')
        iClientCD = request.DELETE.get('ClientCD')
        try:
            if type(iClientCD) == str:
                iClientCD = int(iClientCD)
        except Exception as e:
            dLog.ExceptionLog(e, "パラメータ:統一クライアントコード不正" + iClientCD)
            rsp_data['Msg'] = "統一クライアントコードは、数字で指定してください。"
            rsp_data['Statu'] = "Param Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        #
        try:
            sSql = sSql_1.format(iClientCD)
            cCur = cPG.select(cCur, sSql)
            dHospital = cPG.fetchOne(cCur)
            #
            cCur = cPG.select(cCur, sSql_2)
            dArea = cPG.fetchAll(cCur)
            rsp_data = {"HospitalInfomation": dHospital, "ListItems": dArea}
        except Exception as e:
            cLog.ExceptionLog(e, "病院リスト:地域区分取得で例外:"+str(e))
        #
        cLog.Logger.log(cLog.INFO,"Responce:" + str(rsp_data))
        cPG.disconnect()
        return Response(rsp_data, status=status.HTTP_200_OK)

    
    #
    # Request Body:
    #  {
    #    'HospitalInfomation':{'ClientCD': zzzzz9, 'ClinicName': 'XXXX…',}
    #  }
    #
    # 地域区分・病院情報を更新する
    #
    def post(self, request):
        #
        sSql_01 = "Update hospital_list set zip_cd = {:s},address = {:s},\n"+\
                  "    medical_institution_name = {:s},tel_no = {:s},\n"+\
                  "    representative_name = {:s},number_of_beds = {:s},\n"+\
                  "    number_fulltime_doctors = {:s},number_parttime_doctors = {:s},\n"+\
                  "    dupe_record = {:s},area_cd = {:s},portal_area = {:s},\n"+\
                  "    medical_checkup_area = {:s},industrial_physician_area = {:s},\n"+\
                  "    dental_area,mdoc_area = {:s},nursing_area = {:s},fulltime_area = {:s},\n"+\
                  "    comment = {:s},upd_name = {:s} \n"+\
                  "  Where prefecture_code = {:s} And medical_institution_cd = {:s} \n"+\
                  "    And client_code={:s}"
        #
        rsp_data = {}
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "新病院リスト 病院情報・地域区分取得/session:" + sSession)
        cPG = PG.Postgres(cLog)
        fRc = cPG.connect()
        if not fRc:
            rsp_data['Msg'] = "サーバーエラー:SE部へ連絡してください"
            rsp_data['Statu'] = "RDB Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        # パラメータ取得
        sUserID = request.DELETE.get('UserID')
        # リクエストボディ取得
        r_data = request.body
        dData = json.loads(r_data)
        if "HospitalInfomation" not in dData:
            rsp_data['Msg'] = "変更後データが未設定です。"
            rsp_data['Statu'] = "Request Error"
            return Response(rsp_data, status=status.HTTP_400_BAD_REQUEST)
        dHospitalInfomation = dData['HospitalInfomation']
        if dHospitalInfomation == {}:
            rsp_data['Msg'] = "変更後データがオールブランクです。"
            rsp_data['Statu'] = "Request Error"
            return Response(rsp_data, status=status.HTTP_400_BAD_REQUEST)
        # 履歴メッセージ作成
        sComment = datetime.datetime.today().strftime("%Y/%m/%d %H:%M 地域区分修正:") + sUserID
        # DB更新
        sSql = sSql_01.format(dHospitalInfomation['prefecture_code'],dHospitalInfomation['medical_institution_cd'],\
                              dHospitalInfomation['client_code,'],dHospitalInfomation['zip_cd'],dHospitalInfomation['address'],\
                              dHospitalInfomation['medical_institution_name'],dHospitalInfomation['tel_no'],dHospitalInfomation['representative_name'],\
                              dHospitalInfomation['number_of_beds'],dHospitalInfomation['number_fulltime_doctors'],dHospitalInfomation['number_parttime_doctors'],\
                              dHospitalInfomation['dupe_record,'],dHospitalInfomation['area_cd'],dHospitalInfomation['portal_area'],\
                              dHospitalInfomation['medical_checkup_area'],dHospitalInfomation['industrial_physician_area'],dHospitalInfomation['dental_area'],\
                              dHospitalInfomation['mdoc_area'],dHospitalInfomation['nursing_area'],dHospitalInfomation['fulltime_area'],\
                              sComment, sUserID)
        cCur = cPG.getCursor()
        iStat, iCount, cCur = cPG.execute(sSql, cCur)
        if iCount != 1:
            rsp_data['Msg'] = "変更登録でエラー検出"
            rsp_data['Statu'] = "NG"
            return Response(rsp_data, status=status.HTTP_304_NOT_MODIFIED)
        #
        rsp_data['Msg'] = "変更登録完了"
        rsp_data['Statu'] = "OK"
        return Response(rsp_data, status=status.HTTP_200_OK)
        

#
# マーケットリサーチ
class HospitalMarket(APIView):
    #
    # 設定値取得
    def get(self, request):
        #
        # 対象病院情報取得
        sSql_1 = "Select prefecture_code,medical_institution_cd,client_code,zip_cd,address,\n" +\
                 "    medical_institution_name,tel_no,representative_name,\n" +\
                 "    number_of_beds,number_fulltime_doctors,number_parttime_doctors,\n" +\
                 "    last_survey,contracted,aggregation_target,treatment_category,comment\n"+\
                 "  From hospital_list \n" +\
                 "  Where client_code = {:d} And del_flag = false"
        # 選択リストガイドをマスターから取得
        sSql_2 = "Select value_pulling from m_code \n"+\
                 "  Where code_type in (100,300,301,302)\n"+\
                 "  Order by code_type"
        #
        rsp_data = {}
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "新病院リスト マーケットリサーチ取得/session:" + sSession)
        cPG = PG.Postgres(cLog)
        fRc = cPG.connect()
        if not fRc:
            rsp_data['Msg'] = "サーバーエラー:SE部へ連絡してください"
            rsp_data['Statu'] = "RDB Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        # パラメータ取得
        iClientCD = request.DELETE.get('ClientCD')
        try:
            if type(iClientCD) == str:
                iClientCD = int(iClientCD)
        except Exception as e:
            dLog.ExceptionLog(e, "パラメータ:統一クライアントコード不正" + iClientCD)
            rsp_data['Msg'] = "統一クライアントコードは、数字で指定してください。"
            rsp_data['Statu'] = "Param Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        #
        try:
            sSql = sSql_1.format(iClientCD)
            cCur = cPG.select(cCur, sSql)
            dHospital = cPG.fetchOne(cCur)
            #
            cCur = cPG.select(cCur, sSql_2)
            dArea = cPG.fetchAll(cCur)
            rsp_data = {"HospitalInfomation": dHospital, "ListItems": dArea}
        except Exception as e:
            cLog.ExceptionLog(e, "病院リスト:マーケットリサーチ取得で例外:"+str(e))
        #
        cLog.Logger.log(cLog.INFO,"Responce:" + str(rsp_data))
        cPG.disconnect()
        return Response(rsp_data, status=status.HTTP_200_OK)


    #
    # 更新
    def post(self, request):
        sSql_01 = "Update hospital_list set zip_cd = {:s},address = {:s},\n"+\
                  "    medical_institution_name = {:s},tel_no = {:s},\n"+\
                  "    representative_name = {:s},number_of_beds = {:s},\n"+\
                  "    number_fulltime_doctors = {:s},number_parttime_doctors = {:s},\n"+\
                  "    last_survey,contracted,aggregation_target,treatment_category,\n"+\
                  "    comment = {:s},upd_name = {:s} \n"+\
                  "  Where prefecture_code = {:s} And medical_institution_cd = {:s} \n"+\
                  "    And client_code={:s}"
        #
        rsp_data = {}
        dLog = settings.LOG_INFO['LogWeb']
        cLog = Log.Log(dLog)
        sSession = request.session.session_key
        cLog.Logger.log(cLog.INFO, "新病院リスト 病院情報・地域区分取得/session:" + sSession)
        cPG = PG.Postgres(cLog)
        fRc = cPG.connect()
        if not fRc:
            rsp_data['Msg'] = "サーバーエラー:SE部へ連絡してください"
            rsp_data['Statu'] = "RDB Error"
            return Response(rsp_data, status=status.HTTP_404_NOT_FOUND)
        # パラメータ取得
        sUserID = request.DELETE.get('UserID')
        # リクエストボディ取得
        r_data = request.body
        dData = json.loads(r_data)
        if "HospitalInfomation" not in dData:
            rsp_data['Msg'] = "変更後データが未設定です。"
            rsp_data['Statu'] = "Request Error"
            return Response(rsp_data, status=status.HTTP_400_BAD_REQUEST)
        dHospitalInfomation = dData['HospitalInfomation']
        if dHospitalInfomation == {}:
            rsp_data['Msg'] = "変更後データがオールブランクです。"
            rsp_data['Statu'] = "Request Error"
            return Response(rsp_data, status=status.HTTP_400_BAD_REQUEST)
        # 履歴メッセージ作成
        sComment = datetime.datetime.today().strftime("%Y/%m/%d %H:%M マーケットリサーチ修正:") + sUserID
        # DB更新
        sSql = sSql_01.format(dHospitalInfomation['prefecture_code'],dHospitalInfomation['medical_institution_cd'],\
                              dHospitalInfomation['client_code,'],dHospitalInfomation['zip_cd'],dHospitalInfomation['address'],\
                              dHospitalInfomation['medical_institution_name'],dHospitalInfomation['tel_no'],dHospitalInfomation['representative_name'],\
                              dHospitalInfomation['number_of_beds'],dHospitalInfomation['number_fulltime_doctors'],dHospitalInfomation['number_parttime_doctors'],\
                              dHospitalInfomation['dupe_record,'],rsp_data['last_survey'],rsp_data['contracted'],\
                              rsp_data['aggregation_target'],rsp_data['treatment_category'],sComment, sUserID
                              )
        cCur = cPG.getCursor()
        iStat, iCount, cCur = cPG.execute(sSql, cCur)
        if iCount != 1:
            rsp_data['Msg'] = "変更登録でエラー検出"
            rsp_data['Statu'] = "NG"
            return Response(rsp_data, status=status.HTTP_304_NOT_MODIFIED)
        #
        rsp_data['Msg'] = "変更登録完了"
        rsp_data['Statu'] = "OK"
        return Response(rsp_data, status=status.HTTP_200_OK)
        


