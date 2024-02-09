from logging import getLogger, FileHandler, Formatter
import json
import os
import traceback

class Log:
    #
    Logger = None
    cHandler = None
    #
    DEBUG = 10
    INFO = 20
    WARNING = 30
    ERROR = 40
    CRITICAL = 50

    def __init__(self,dConf:dict):
        #
        self.Logger = getLogger(dConf['LogName'])
        self.Logger.setLevel(dConf['LogLevel'])
        self.cHandler = FileHandler(dConf['LogFile'])
        fmt = Formatter('%(asctime)s %(levelname)s %(module)s %(lineno)d %(message)s')
        self.cHandler.setFormatter(fmt)
        self.Logger.addHandler(self.cHandler)

    def ExceptionLog(self, e:Exception, sMsg:str):
        #
        self.Logger.log(self.CRITICAL, sMsg + str(e))
        self.Logger.log(self.CRITICAL, traceback.format_exc())

if __name__ == '__main__':
    #
    cLog = Log({'LogFile':"D:\\Python\\App.log", "LogName":"Test", "LogLevel":"DEBUG"})
    cLog.Logger.log(Log.DEBUG,"test 1")
    cLog.Logger.log(Log.INFO,"test 2")
    cLog.Logger.log(Log.WARNIG,"test 3")
    cLog.Logger.log(Log.ERROR,"test 4")
    cLog.Logger.log(Log.CRITICAL,"test 5")