import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.select import Select
from selenium.webdriver.common.keys import Keys
import traceback

#
# 厚労省サイトをスクレイピングし、医師資格登録状況を確認する。
# ここでは、氏名・性別・種別(医師/歯科医)での、簡易判定とする。
class CheckDoctorLicense:
    #
    cWebDriver = None
    cLog = None
    sUrl = 'https://licenseif.mhlw.go.jp/search_isei/jsp/top.jsp'
    fState = False
    #

    #
    #
    def __init__(self, sUrl=""):
        #
        try:
            if sUrl != "":
                self.sUrl = sUrl
            self.cWebDriver = webdriver.Chrome()
        except Exception as e:
            print("サイトオープンで例外",e)
            traceback.print_exc()
            return
        fState = True


    #
    #
    def open(self)->bool:
        res = self.cWebDriver.get(self.sUrl)
        return res

    #
    # URL再オープン
    def reOpenUrl(self, sUrl:str)->bool:
        #
        self.sUrl = sUrl
        try:
            self.cWebDriver = webdriver.Chrome()
        except Exception as e:
            print("サイトオープンで例外",e)
            traceback.print_exc()
            return False
        return True


    #
    #
    def close(self):
        #
        self.cWebDriver.close()

    
    #
    #
    def BackPage(self):
        self.cWebDriver.back()


    # 医師免許種別
    CD_KIND_DOCTOR = 1
    CD_KIND_DENTAL = 2
    # 性別
    CD_SEX_MAN = 1
    CD_SEX_WOMAN = 2
    #
    # 医師ラジオ
    xPathDoctor ='//*[@id="licenseif_kensaku"]/div[2]/form/table/tbody/tr[1]/td/input[1]'
    # 歯科医師ラジオ
    xPathDental = '//*[@id="licenseif_kensaku"]/div[2]/form/table/tbody/tr[1]/td/input[2]'
    # 男性ラジオ
    xPathMen = '//*[@id="licenseif_kensaku"]/div[2]/form/table/tbody/tr[2]/td/input[1]'
    xPathWoman = '//*[@id="licenseif_kensaku"]/div[2]/form/table/tbody/tr[2]/td/input[2]'
    # 氏名テキスト
    xPathName = '//*[@id="licenseif_kensaku"]/div[2]/form/table/tbody/tr[3]/td[1]/input'
    # 結果画面性別
    xPathRSex = '//*[@id="licenseif_results"]/div[2]/div[3]/table/tbody/tr[2]/td[4]'
    # 結果画面登録年
    xPathRYear = '//*[@id="licenseif_results"]/div[2]/div[3]/table/tbody/tr[2]/td[5]'
    # 結果画面氏名イメージ
    xPathRName = '//*[@id="licenseif_results"]/div[2]/div[3]/table/tbody/tr[2]/td[3]/img'
    # 検索ボタン
    xPathFind = '//*[@id="licenseif_kensaku"]/div[2]/form/div[2]/a[1]'


    #
    # 医師免許確認
    # in) 
    # cdKind:免許種別
    # cdSex:性別
    # sName:氏名(姓名の間は1スペース)
    # out)
    # {"結果":False, "性別":"", "取得年": ""}
    #
    def check(self, cdKind:int, cdSex:int, sName:str)->[bool,dict]:
        #
        dRslt = {"結果":False, "性別":"", "取得年": ""}
        #
        # 医師種別設定
        match(cdKind):
            case self.CD_KIND_DOCTOR:
                self.cWebDriver.find_element(By.XPATH, self.xPathDoctor).click()
            case self.CD_KIND_DENTAL:
                self.cWebDriver.find_element(By.XPATH, self.xPathDental).click()
            case _:
                return False,dRslt
        # 性別設定
        match(cdSex):
            case self.CD_SEX_MAN:
                self.cWebDriver.find_element(By.XPATH, self.xPathMen).click()
            case self.CD_SEX_WOMAN:
                self.cWebDriver.find_element(By.XPATH, self.xPathWoman).click()
            case _:
                return False,dRslt
        # ドクター名設定
        if sName == "":
            return False,dRslt
        form = self.cWebDriver.find_element(By.XPATH, self.xPathName)
        #form.clear()
        form.send_keys(Keys.CONTROL + "a")
        form.send_keys(Keys.DELETE)
        form.send_keys(sName)
        # 検索
        self.cWebDriver.find_element(By.XPATH, self.xPathFind).click()
        try:
            form = self.cWebDriver.find_element(By.XPATH, self.xPathRSex)
            dRslt["性別"] = form.text
            form = self.cWebDriver.find_element(By.XPATH, self.xPathRYear)
            dRslt["取得年"] = form.text
            dRslt["結果"] = True
            if dRslt["性別"] == "男":
                if cdSex == 1:
                    return True, dRslt
            if dRslt["性別"] == "女":
                if cdSex == 2:
                    return True, dRslt
        except Exception as e:
            print("検索結果照会で例外", e)
            traceback.print_exc()
            return False,{}
        #
        return False,dRslt
