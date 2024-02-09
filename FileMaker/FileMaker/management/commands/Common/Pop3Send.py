import os,sys,json,datetime as DT
from datetime import date as date
import datetime
#
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate
import email.utils
import ssl
#
from . import Log


class Pop3MailSend:
    #
    dArgs = None
    #
    cLog = None
    #
    cMailServer = None
    cSSLContext = None
    #


    #
    #
    def __init__(self, dMailConfig:dict, log:Log.Log):
        #
        self.dArgs = dMailConfig
        self.cLog = log

    
    # 
    # メール接続
    def connectMail(self)->bool:
        #
        fRc = True
        if self.dArgs['MailServer']['SMTP']:
            fRc = self.SMTPBasic()
            self.cLog.Logger.log(self.cLog.INFO,"SMPT 認証:" + str(fRc))
            return fRc
        if self.dArgs['MailServer']['SMTPS']:
            fRc = self.SMTPSsl()
            self.cLog.Logger.log(self.cLog.INFO,"SMPTS 認証:" + str(fRc))
            return fRc
        if self.dArgs['MailServer']['STARTTSL']:
            fRc = self.SMTPStartTSL()
            self.cLog.Logger.log(self.cLog.INFO,"STARTTSL 認証:" + str(fRc))
            return fRc
        fRc = self.SMTPBasic()
        self.cLog.Logger.log(self.cLog.INFO,"Basic 認証:" + str(fRc))
        #
        return fRc


    

    # ToDo
    # SMTP STARTTSL認証
    def SMTPBasic(self)->bool:
        #
        fRc =True
        #
        try:
            self.cMailServer = SMTP(self.dArgs['MailServer']['Host'],
                                    self.dArgs['MailServer']['Port'])
            mRc = self.cMailServer.login(self.dArgs['MailServer']['Account'],
                                         self.dArgs['MailServer']['PassWord'])
            self.cLog.Logger.log(self.cLog.INFO, "Basic Login OK")
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "MailServer SMTP接続エラー:" + str(e))
            self.cLog.Logger.log(self.cLog.CRITICAL, "Loginレスポンス:" + str(mRc))
            print("MailServer SMTP接続エラー:", e, mRc)
            fRc = False
        #
        return fRc


    # ToDo
    # SMTP STARTTSL認証
    def SMTPStartTSL(self)->bool:
        #
        #
        fRc =True
        if self.dArgs['MailServer']['Port'] != 587:
            self.cLog.Logger.log(self.cLog.WARNIG, "STARTTLSなのにポートが587ではない:" + str(self.dArgs['MailServer']['Port']))
            print("STARTTLSなのにポートが587ではない:" + str(self.dArgs['MailServer']['Port']))
        #
        try:
            self.cMailServer = SMTP(self.dArgs['MailServer']['Host'],
                                    self.dArgs['MailServer']['Port'])
            #
            if self.cMailServer.has_extn('STARTTLS'):
                # ehloは内部で勝手に実行してくれるが、あえで手動で実行したい場合は明示的にechoすることができる
                self.cMailServer.ehlo()   
                self.cMailServer.starttls()
                self.cMailServer.ehlo()
            mRc = self.cMailServer.login(self.dArgs['MailServer']['Account'],
                                         self.dArgs['MailServer']['PassWord'])
            self.cLog.Logger.log(self.cLog.INFO, "SMTPS Login OK")
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "MailServer SMTP接続エラー:" + str(e))
            self.cLog.Logger.log(self.cLog.CRITICAL, "Loginレスポンス:" + str(mRc))
            print("MailServer SMTP接続エラー:", e, mRc)
            fRc = False
        #
        return fRc


    # 
    # SMTP SSL/TSL認証
    def SMTPSsl(self)->bool:
        #
        fRc =True
        #
        try:
            self.cSSLContext = ssl.create_default_context()
            self.cMailServer = SMTP(self.dArgs['MailServer']['Host'],
                                    self.dArgs['MailServer']['Port'],
                                    self.cSSLContext)
            mRc = self.cMailServer.login(self.dArgs['MailServer']['Account'],
                                         self.dArgs['MailServer']['PassWord'])
            self.cLog.Logger.log(self.cLog.INFO, "SSL Login OK")
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "MailServer SMTP接続エラー:" + str(e))
            self.cLog.Logger.log(self.cLog.CRITICAL, "Loginレスポンス:" + str(mRc))
            print("MailServer SMTP接続エラー:", e, mRc)
            fRc = False
        #
        return fRc
    

    #
    # メール切断
    def disConnectMail(self):
        #
        self.cLog.Logger.log(self.cLog.INFO,"Server DisConnectted:")
        self.cMailServer.quit()

    #
    # メール単件送信
    def sendMail(self, cMailMsg:MIMEText)->bool:
        #
        try:
            self.cMailServer.send_message(cMailMsg)
            self.cLog.Logger.log(self.cLog.INFO, "Mail Send OK")
            return True
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "メール送信エラー:" + str(e))
            print("メール送信エラー:", e)
        #
        return True
