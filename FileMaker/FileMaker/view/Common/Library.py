from . import Postgres
from . import Log

class Library:
    #
    cPG = None
    cLog = None
    #


    #
    #
    def __init__(self,cPostgres:Postgres.Postgres, cLogger:Log.Log):
        #
        self.cPG = cPostgres
        self.cLog = cLogger


    #
    # コードマスター取得
    # コードNoは文字列とする
    def getMasters(self, lCodes:list)->dict:
        #
        dCodes = {}
        #
        sGetSQL = "Select code_type,  code_pulling, value_pulling From m_code \n"+\
                  "  Where code_type in ({:s}) order by code_type"
        #
        sCodes = ",".join(lCodes).replace("'","")
        sSql = sGetSQL.format(sCodes)
        iCount, cCur = self.cPG.SelectAll(sSql)
        lRecs = self.cPG.fetchAll(cCur)
        for dRec in lRecs:
            dCodes[dRec["code_type"]] = {"Code":dRec["code_pulling"], "Value":dRec["value_pulling"]}
        #
        dRslt = {"Master": dCodes}
        return dRslt



