from logging import getLogger, FileHandler, Formatter
import json
import os
import traceback
from django.conf import settings
from . import Const
import datetime

class Log:
    #
    Logger = None
    cHandler = None
    #
    sLogPath = ""
    #
    DEBUG = 10
    INFO = 20
    WARNING = 30
    ERROR = 40
    CRITICAL = 50
    # ログマックスサイズ(256MB)
    MAX_LOG_SIZE = 1024*1024*256

    def __init__(self,dLog:dict):
        #
        dConf = dLog
        self.Logger = getLogger(dConf['LogName'])
        self.Logger.setLevel(dConf['LogLevel'])
        self.sLogPath = dConf['LogFile'] + datetime.datetime.now().strftime("-%Y-%m-%d.log")
        #
        self.cHandler = FileHandler(self.sLogPath)
        fmt = Formatter('%(asctime)s %(levelname)s %(module)s %(lineno)d %(message)s')
        self.cHandler.setFormatter(fmt)
        self.Logger.addHandler(self.cHandler)


    #
    # 例外ログ取得
    def ExceptionLog(self, e:Exception, sMsg:str):
        #
        self.Logger.log(self.CRITICAL, sMsg + str(e))
        self.Logger.log(self.CRITICAL, traceback.format_exc())
        #self.Logger.log(self.CRITICAL, traceback.format_traceBack())
    


if __name__ == '__main__':
    #
    cLog = Log({'LogFile':"D:\\Python\\App.log", "LogName":"Test", "LogLevel":"DEBUG"})
    cLog.Logger.log(Log.DEBUG,"test 1")
    cLog.Logger.log(Log.INFO,"test 2")
    cLog.Logger.log(Log.WARNIG,"test 3")
    cLog.Logger.log(Log.ERROR,"test 4")
    cLog.Logger.log(Log.CRITICAL,"test 5")