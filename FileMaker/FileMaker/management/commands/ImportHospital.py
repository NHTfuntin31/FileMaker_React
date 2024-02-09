from django.core.management.base import BaseCommand
from .Common import Log 
from .Common import MongoDB
from .Common import Postgres
import json, sys, os, pathlib
from django.conf import settings
import openpyxl as XLS
from django.conf import settings
import datetime
import traceback


#
# 新病院リスト医療機関マッチング票(XLSX)とHospital_listのマージ
#
class importHospitalList:
    #
    dParams = {}
    dLog = {}
    dMongo = {}
    dPG = {}
    #
    cMongo = None
    cPG = None
    cLog = None
    fStatus = False
    #
    # 都道府県コード変換
    dPrefCD = {}
    # 地域区分コード変換
    dAreaCD = {}
    # 前回調査対象コード
    dZenkai = {}
    # 重複区分コード変換
    dChoufuku = {}
    # 病院・診療所区分コード変換
    dHPCL = {}
    #
    lFiles = []
    lOffice = []
    sCurOffice = ""
    cBook = None
    cSheet = None
    #
    
    #
    #
    def __init__(self):
        #
        try:
            print("Start")
            dLog = settings.LOG_INFO['LogBatch']
            print("setting.Log:",dLog)
            self.cLog = Log.Log(dLog)
            fd = open("D:\\Web\\FileMaker\\FileMaker\\management\\commands\\Params\\HospitalList.json", "r", encoding="utf-8")
            self.dParams = json.load(fd)
            print("Params:", self.dParams)
            fd.close()
            #
            self.dMongo = settings.EXT_DATABASE['MongoDB']
            self.cMongo = MongoDB.Mongo(self.cLog)
            self.cMongo.selectCollection(self.dParams['DocDB']['Collection'])
            self.cPG = Postgres.Postgres(self.cLog)
            self.loadMaster()
            self.fStatus = True
        except Exception as e:
            print("Exception on Init", e)
            self.cLog.ExceptionLog(e, "Exception on Init")


    #
    # マスター事前取得(都道府県マスタ)
    def loadMaster(self):
        #
        # 厚労省都道府県CD
        sSql = "Select * from m_code where code_type = 100"
        # 地域区分
        sSql2= "Select * from m_code where code_type = 200"
        # マーケットリサーチ/前回調査時対象
        sSql3= "Select * from m_code where code_type = 301"
        # マーケットリサーチ/重複
        sSql4= "Select * from m_code where code_type = 302"
        # マーケットリサーチ/HP/CL
        sSql5= "Select * from m_code where code_type = 304"
        # 【有無区分】
        sSql7= "Select * from m_code where code_type = 1005"
        cCur = self.cPG.getCursor()
        cCur = self.cPG.select(cCur,sSql)
        self.dPrefCD = self.cPG.fetchOne(cCur)
        cCur = self.cPG.select(cCur,sSql2)
        self.dAreaCD = self.cPG.fetchOne(cCur)
        cCur = self.cPG.select(cCur,sSql3)
        self.dZenkai = self.cPG.fetchOne(cCur)
        cCur = self.cPG.select(cCur,sSql4)
        self.dChoufuku = self.cPG.fetchOne(cCur)
        cCur = self.cPG.select(cCur,sSql5)
        self.dHPCL = self.cPG.fetchOne(cCur)
        # 残マスター収容
        cCur.close()
        print("Pref:", self.dPrefCD)
        self.cLog.Logger.log(self.cLog.INFO, "Pref:" + str(self.dPrefCD))


    #
    # Excelファイル有無チェック
    def checkExcel(self)->bool:
        #
        try:
            lFile = []
            print("BasePath:", self.dParams['Excel']['BasePath'])
            lFile = list(pathlib.Path(self.dParams['Excel']['BasePath']).glob('*.xlsx'))
            print("Files:", lFile)
            self.cLog.Logger.log(self.cLog.INFO, "Path:"+self.dParams['Excel']['BasePath']+\
                                 " Files:" + str(lFile) )
            if len(lFile) == 0:
                return False
            for f in lFile:
                self.lFiles.append(str(f))
            print("処理対象ファイル:",self.lFiles)
            #print("Find Files", self.lFiles)
            return True
        except Exception as e:
            print("Eccel-Book 存在チェックで例外",e)
            self.cLog.ExceptionLog(e, "Eccel-Book 存在チェックで例外")
            return False

    #
    # MongoDBより、新病院リスト情報を取得する
    def getHospitalList(self, iClientCD:int)->dict:
        #
        dWhere = {self.dParams['DocDB']['Key']: iClientCD}
        lRecs = self.cMongo.selectAll(dWhere, self.dParams['DocDB']['Column'])
        if len(lRecs) == 0:
            return None
        return lRecs[0]
    

    #
    # 厚労省データチェック
    def checkHospitalEntory(self, sHospitalCD:str)->bool:
        #
        fRslt = False
        #
        sSql = "Select Count(*) count From hospital_list Where medical_institution_cd = '{:s}'".format(sHospitalCD)
        cCur = self.cPG.getCursor()
        cCur = self.cPG.select(cCur, sSql)
        dRec = self.cPG.fetchOne(cCur)
        if dRec['count'] > 0:
            return True
        #
        return fRslt


    #
    # 新病院リスト 更新
    def updateHospital(self, dRec:dict)->bool:
        #
        print("新病院リスト 紐づき更新 開始")
        fRslt = False
        #
        sSql = "update hospital_list set client_code = {:d}, dupe_record = '{:s}',\n"+\
               "    last_survey = '{:s}', contracted = '{:s}', area_cd = '{:s}',\n" +\
               "    update_history = '{:s}\n' || update_history \n" +\
               "  Where medical_institution_cd = '{:s}'"
        #
        # dupe_record 重複レコード
        sdupe_record = "00"
        if dRec['重複有無'] == "":
            sdupe_record = "00"
        else:
            if dRec['重複有無'] in self.dChoufuku["value_pulling"]:
                sdupe_record = self.dChoufuku["value_pulling"][dRec['重複有無']]
            else:
                print("対象重複区分がありません", dRec['重複有無'])
                self.cLog.Logger.log(self.cLog.ERROR, "対象重複区分がありません" +\
                                     dRec['重複有無'])
        # last_survey マーケットリサーチ/前回調査時対象
        slast_survey = "00"
        if dRec['集計対象'] == "":
            print("前回調査対象が空欄です")
            self.cLog.Logger.log(self.cLog.ERROR, "前回調査対象が空欄です")
        else:
            if dRec['集計対象'] == "●":
                slast_survey = "01"
        # contracted 契約有無
        scontracted = "00"
        if dRec['契約有無'] == "":
            print("契約有無が空欄です")
            self.cLog.Logger.log(self.cLog.ERROR, "契約有無が空欄です")
        else:
            if dRec['契約有無'] == "有":
                scontracted = "01"
        # area_cd 地域区分
        sarea_cd = self.dAreaCD['value_pulling'][self.sCurOffice]
        #
        sdate = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S 照合結果マージ")
        #
        print("Clientcd:", dRec['Clientcd'])
        print("sdupe_record:", sdupe_record)
        print("slast_survey:", slast_survey)
        print("scontracted:", scontracted)
        print("sarea_cd:", sarea_cd)
        print("sdate:", sdate)
        print("医療機関CD:",dRec['医療機関CD'])
        sSqlExec = sSql.format(dRec['Clientcd'], sdupe_record, slast_survey, scontracted,\
                               sarea_cd, sdate, dRec['医療機関CD'])
        print("Update SQL:", sSqlExec)
        self.cLog.Logger.log(self.cLog.INFO,"Update SQL:"+sSqlExec)
        #
        cCur = self.cPG.getCursor()
        if cCur == None:
            print("Postgre Cursor取得できません")
            self.cLog.Logger.log(self.cLog.ERROR, "Postgre Cursor取得できません")
            return fRslt
        #
        try:
            fRslt = self.cPG.execute(cCur, sSqlExec)
            self.cPG.commit()
        except Exception as e:
            print("DB更新 厚労省データ更新で例外",e)
            self.cLog.ExceptionLog(e, "DB更新 厚労省データ更新で例外")
            return False
        #
        return fRslt


    #
    # 新病院リスト 新規追加
    def insertHospital(self, dRec:dict)->bool:
        #
        fRslt = False
        print("新病院リスト 紐づきなし 追加登録 開始")
        # 都道府県コード,クライアントCD,郵便番号,住所表示,医療機関名,
        # 電話番号,代表者氏名,病床数,常勤医師数,
        # 非常勤医師数,重複レコード,前回調査対象,契約有無,
        # 診療区分CD,地域区分CD,廃院フラグ,更新履歴,更新者
        sSql = "Insert Into hospital_list(\n" +\
               "    prefecture_code,client_code,zip_cd,address,medical_institution_name,\n"+\
               "    tel_no,representative_name,number_of_beds,number_fulltime_doctors,\n"+\
               "    number_parttime_doctors,dupe_record,last_survey,contracted,\n"+\
               "    treatment_category,area_cd,dead_flag,update_history,upd_name) Values\n"+\
               "   ('{:s}', {:d}, '{:s}', '{:s}', '{:s}',\n"+\
               "    '{:s}', '{:s}', {:d}, {:d},\n"+\
               "    {:d}, '{:s}', '{:s}', '{:s}',\n"+\
               "    '{:s}', '{:s}', false, '{:s}', 'System')"
        #
        # MongoDBから病院リスト取得
        dMongo = self.getHospitalList(dRec['Clientcd'])
        print("Mongo:", dMongo)
        if dMongo == None:
            # 対象病院削除済
            return True
        # {"郵便":1, "住所1":1, "住所2":1, "住所3":1, "代表取締役":1, "TEL":1, "病床数合計":1, "常勤医数":1, "非常勤医数":1 }
        # 都道府県コード
        sprefecture_code = ""
        if dMongo['住所1'] != "":
            sprefecture_code = self.dPrefCD['value_pulling'][dMongo['住所1']]
        # クライアントCD
        iclient_code = dRec['Clientcd']
        # 郵便番号
        szip_cd = dMongo['郵便'].replace("\n", "")
        # 住所表示
        if type(dMongo['住所3']) == str:
            saddress = dMongo['住所1'] + dMongo['住所2'] + dMongo['住所3']
        else:
            saddress = dMongo['住所1'] + dMongo['住所2'] + str(dMongo['住所3'])
        if len(saddress) > 256:
            saddress = saddress[:256]
        # 医療機関名
        if "'" in dRec['病院名']:
            smedical_institution_name = dRec['病院名'].replace("'", "chr(39)")
            smedical_institution_name = smedical_institution_name.replace("chr(39)",\
                                                                          "' || chr(39) || '" ) 
        else:
            if "&#" in dRec['病院名']:
                smedical_institution_name = dRec['病院名'].split("&#")[0]
            else:
                smedical_institution_name = dRec['病院名']
        
        # 電話番号
        stel_no = dMongo['TEL']
        # 代表者氏名
        srepresentative_name = ""
        if dMongo['代表取締役'] != None:
            srepresentative_name = dMongo['代表取締役']
        # 病床数
        inumber_of_beds = 0
        if dMongo['病床数合計'] != "":
            inumber_of_beds = dMongo['病床数合計']
        # 常勤医師数
        if dMongo['常勤医数'] != "":
            inumber_fulltime_doctors  = dMongo['常勤医数']
            if inumber_fulltime_doctors > 9999:
                inumber_fulltime_doctors = 9999
        else:
            inumber_fulltime_doctors  = 0
        # 非常勤医師数
        if dMongo['非常勤医数'] != "":
            inumber_parttime_doctors = int(dMongo['非常勤医数'])
            if inumber_parttime_doctors> 9999:
                inumber_parttime_doctors = 9999
        else:
            inumber_parttime_doctors = 0
        # 重複レコード
        if dRec['重複有無'] == "":
            sdupe_record = "00"
        else:
            if dRec['重複有無'] in self.dChoufuku["value_pulling"]:
                sdupe_record = self.dChoufuku["value_pulling"][dRec['重複有無']]
            else:
                print("対象重複区分がありません", dRec['重複有無'])
                self.cLog.Logger.log(self.cLog.ERROR, "対象重複区分がありません" +\
                                     dRec['重複有無'])
        # 前回調査対象
        slast_survey = "00"
        if dRec['集計対象'] == "":
            print("前回調査対象が空欄です")
            self.cLog.Logger.log(self.cLog.ERROR, "前回調査対象が空欄です")
        else:
            if dRec['集計対象'] == "●":
                slast_survey = "01"
        # 契約有無
        scontracted = "00"
        if dRec['契約有無'] == "":
            print("契約有無が空欄です")
            self.cLog.Logger.log(self.cLog.ERROR, "契約有無が空欄です")
        else:
            if dRec['契約有無'] == "有":
                scontracted = "01"
        # 診療区分CD
        streatment_category = "99"
        if dRec['HP/CL'] != "":
            streatment_category = self.dHPCL['code_pulling'][dRec['HP/CL']]
        # 地域区分CD
        sarea_cd = self.dAreaCD['value_pulling'][self.sCurOffice]
        # 更新履歴
        supdate_history = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S 照合結果マージ")
        #
        # print("sprefecture_code:",sprefecture_code)
        # print("iclient_code:",iclient_code)
        # print("szip_cd:",szip_cd)
        # print("saddress:",saddress)
        # print("smedical_institution_name:",smedical_institution_name)
        # print("stel_no:",stel_no)
        # print("srepresentative_name:",srepresentative_name)
        # print("inumber_of_beds:",inumber_of_beds)
        # print("inumber_fulltime_doctors:",inumber_fulltime_doctors)
        # print("inumber_parttime_doctors:",inumber_parttime_doctors)
        # print("sdupe_record:",sdupe_record)
        # print("slast_survey:",slast_survey)
        # print("scontracted:",scontracted)
        # print("streatment_category:",streatment_category)
        # print("sarea_cd:",sarea_cd)
        # print("supdate_history:",supdate_history)
        sSqlExec = sSql.format(sprefecture_code, iclient_code, szip_cd, saddress,smedical_institution_name,
                               stel_no, srepresentative_name,inumber_of_beds, inumber_fulltime_doctors,
                               inumber_parttime_doctors, sdupe_record, slast_survey,scontracted, 
                               streatment_category, sarea_cd, supdate_history)
        print("Insert SQL:", sSqlExec)
        self.cLog.Logger.log(self.cLog.INFO,"Insert SQL:"+sSqlExec)
        #
        cCur = self.cPG.getCursor()
        if cCur == None:
            print("Postgre Cursor取得できません")
            self.cLog.Logger.log(self.cLog.ERROR, "Postgre Cursor取得できません")
            return fRslt
        try:
            fRslt = self.cPG.execute(cCur, sSqlExec)
            self.cPG.commit()
        except Exception as e:
            self.cLog.ExceptionLog(e, "新病院リスト 紐づきなし 追加登録で例外")
            print("新病院リスト 紐づきなし 追加登録で例外", e)
            return False
        #
        return fRslt


    #
    # 非保険診療所存在チェック
    def checkNoLinkHospital(self, sClientCD:str)->bool:
        #
        fRslt = False
        #
        sSql = "Select Count(*) Count From hospital_list \n" +\
               "  Where client_code = '{:d}'"
        sSqlExec = sSql.format(sClientCD)
        cCur = self.cPG.getCursor()
        cCur = self.cPG.select(cCur, sSqlExec)
        drec = self.cPG.fetchOne(cCur)
        if drec["count"] == 0:
            return False
        #
        return True
    

    #
    # 非保険診療所レコード更新(更新キーが)
    def updateNoLink(self, dRec:dict)->bool:
        #
        #
        sSql = "update hospital_list set client_code = {:d}, dupe_record = '{:s}',\n"+\
               "    last_survey = '{:s}', contracted = '{:s}', area_cd = '{:s}',\n" +\
               "    update_history = '{:s}\n' || update_history, \n" +\
               "    medical_institution_cd = ''\n" +\
               "  Where client_code = {:d}"
        #
        print("新病院リスト 紐づきなし更新 開始")
        # dupe_record 重複レコード
        sdupe_record = "00"
        if dRec['重複有無'] == "":
            sdupe_record = "00"
        else:
            if dRec['重複有無'] in self.dChoufuku["value_pulling"]:
                sdupe_record = self.dChoufuku["value_pulling"][dRec['重複有無']]
            else:
                print("対象重複区分がありません", dRec['重複有無'])
                self.cLog.Logger.log(self.cLog.ERROR, "対象重複区分がありません" +\
                                     dRec['重複有無'])
        # last_survey マーケットリサーチ/前回調査時対象
        slast_survey = "00"
        if dRec['集計対象'] == "":
            print("前回調査対象が空欄です")
            self.cLog.Logger.log(self.cLog.ERROR, "前回調査対象が空欄です")
        else:
            if dRec['集計対象'] == "●":
                slast_survey = "01"
        # contracted 契約有無
        scontracted = "00"
        if dRec['契約有無'] == "":
            print("契約有無が空欄です")
            self.cLog.Logger.log(self.cLog.ERROR, "契約有無が空欄です")
        else:
            if dRec['契約有無'] == "有":
                scontracted = "01"
        # area_cd 地域区分
        sarea_cd = self.dAreaCD['value_pulling'][self.sCurOffice]
        #
        sdate =  datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S 医療機関CDなしに変更")
        sSqlExec = sSql.format(dRec['Clientcd'], sdupe_record, slast_survey, scontracted,\
                               sarea_cd, sdate, dRec['Clientcd'])
        print("Update SQL:", sSqlExec)
        self.cLog.Logger.log(self.cLog.INFO,"Update SQL:"+sSqlExec)
        #
        cCur = self.cPG.getCursor()
        if cCur == None:
            print("Postgre Cursor取得できません")
            self.cLog.Logger.log(self.cLog.ERROR, "Postgre Cursor取得できません")
            return fRslt
        try:
            fRslt = self.cPG.execute(cCur, sSqlExec)
            self.cPG.commit()
        except Exception as e:
            self.cLog.ExceptionLog(e, "新病院リスト 紐づきなし更新で例外")
            print("新病院リスト 紐づきなし更新で例外", e)
            return False
        #
        return fRslt
    

    #
    #
    def procRecord(self, dRec:dict)->bool:
        #
        fRslt = False
        #
        if dRec['厚労省有無'] == "●":
            # 厚労省データあり
            fRslt = self.checkHospitalEntory(dRec['医療機関CD'])
            if fRslt:
                # DB更新
                fRslt = self.updateHospital(dRec)
                print("updateHospital stat:", fRslt)
                return fRslt
        # 厚労省データなし、単独登録
        # ToDo 紐なしデータチェック
        fRslt = self.checkNoLinkHospital(dRec['Clientcd'])
        if fRslt:
            # 登録済レコード更新
            fRslt = self.updateNoLink(dRec)
        else:
            fRslt = self.insertHospital(dRec)
        #
        return fRslt


    #
    # 1Book一括処理
    def procBook(self, sBook:str)->bool:
        #
        fRslt = False
        #
        try:
            self.cBook = XLS.load_workbook(sBook)
            self.cSheet = self.cBook.worksheets[0]
            for line in range(self.dParams['Excel']['Offset'],99999):
                dRec = {}
                for dCol in self.dParams['Excel']['Column']:
                    stmp = self.cSheet.cell(row=line, column=dCol['Col']).value
                    if stmp == None:
                        stmp = ""
                    dRec[dCol['Key']] = stmp
                if dRec['病院名'] == "":
                    break
                print("対象 Rec:", dRec)
                fRslt = self.procRecord(dRec)
                if fRslt == False:
                    print("Record:" + str(dRec) + "処理中に、例外を検出しました。")
                    self.cLog.Logger.log(self.cLog.ERROR,"Record:" + str(dRec) + "処理中に、例外を検出しました。")
                    return fRslt
            return fRslt
        except Exception as e:
            print("Book:" + sBook + "処理中に、例外を検出しました。", e,traceback.format_exc())
            self.cLog.Logger.log(self.cLog.ERROR,"Book:" + sBook + "処理中に、例外を検出しました。")
        #
        return fRslt
    

    lOfficeName = ["東京", "名古屋", "大阪", "福岡"]
    #
    # 全Book一括処理
    def execute(self)->bool:
        #
        fRslt = False
        #
        fRslt = self.checkExcel()
        if fRslt == False:
            print("対象となるExcelファイルがありません")
            self.cLog.Logger.log(self.cLog.ERROR,"対象となるExcelファイルがありません")
            return fRslt
        for sBook in self.lFiles:
            self.sCurOffice = ""
            for area in self.lOfficeName:
                if area in sBook:
                    self.lOffice.append(area)
                    self.sCurOffice = area
                    break
            fRslt = self.procBook(sBook)
            if fRslt == False:
                print("Book:", sBook, "で、処理エラーを検出しました")
                self.cLog.Logger.log(self.cLog.ERROR, "Book:" + sBook + "で、処理エラーを検出しました")
                return fRslt
        #
        return fRslt


class Command(BaseCommand):
    #
    help = "パラメータはありません"

    def handle(self, *args, **options):
        print("start Hospital List import!")
        print(os.getcwd())
        #
        cHospital = importHospitalList()
        if cHospital.fStatus == False:
            print("初期化エラー")
            sys.exit(-1)
        fRc = cHospital.execute()
        print("execute status", fRc)
        if fRc == False:
            print("Error")
            sys.exit(-1)
        #
        print("ユーザー登録が正常終了しました:")