import pymongo
import json
#
import collections  # From Python standard library.
import bson
from bson.codec_options import CodecOptions
from . import Log
from django.conf import settings

#
# MongoDB
class Mongo:
    #
    # 接続情報
    dConVales = {}
    #
    cClient = None
    #
    cDB = None
    #
    cCollection = None
    # 二次検索用
    cCollectionOpt = None
    cLog = None
    #
    iInsCount = 0
    # 検索系
    cRows = None
    #
    # DB/Collection接続まで行う。
    def __init__(self, cLog):
        #
        self.dConVales = settings.EXT_DATABASE['MongoDB']
        #print("Mongo Config:", self.dConVales,"**", self.dConVales['Auth'])
        try:
            self.cLog = cLog
            if self.dConVales['Auth'] == True:
                self.cClient = pymongo.MongoClient(host = self.dConVales['Host'],
                                                   port = self.dConVales['PortNo'],
                                                   username = self.dConVales['User'],
                                                   password = self.dConVales['Pass'],
                                                   authSource = self.dConVales['DBName'])
            else:
                self.cClient = pymongo.MongoClient(host = self.dConVales['Host'],
                                                   port = self.dConVales['PortNo'])
            self.cDB = self.cClient[self.dConVales['DBName']]
        except Exception as e:
            print("Exception on MondoDB init ", e)    
            self.cLog.ExceptionLog(e, "Exception on MondoDB init ")
    #
    #
    def close(self):
        self.cClient.close()

    #
    # Collection指定
    def selectCollection(self, sCollection:str)->bool:
        #
        if self.cClient == None:
            return False
        try:
            #print("MongoDB Select Collection", sCollection)
            self.cCollection = self.cDB[sCollection]
            #print("cCollection:", self.cCollection)
            self.iInsCount = 0
            return True
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Select Collection Except:")
            print("MongoDB Select Collection Except:", e)
            return False
    
    #
    # Collection指定
    def selectOptCollection(self, sCollection:str)->bool:
        #
        if self.cClient == None:
            return False
        try:
            #print("MongoDB Select Collection", sCollection)
            self.cCollectionOpt = self.cDB[sCollection]
            #print("cCollection:", self.cCollection)
            self.iInsCount = 0
            return True
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Select Collection Except:")
            print("MongoDB Select Collection Except:", e)
            return False
    

    #
    # レコード登録を1件行う
    def insert(self, dRec:dict)->bool:
        #
        try:
            #print("Mongo Insert:", dRec)
            self.cCollection.insert_one(dRec)
            self.iInsCount += 1
            return True
        except Exception as e:
            print("MongoDB Insert Record Except:", e)
            return False

    #
    # レコード登録をｎ件行う
    def insertBulk(self, lRec:list)->int:
        #
        #print("Bulk Records:", lRec)
        if lRec == None or len(lRec) == 0:
            return -1
        try:
            for rec in lRec:
                self.cCollection.insert_one(rec)
                #print("Rec:", rec)
            #self.cCollection.insert_many(lRec)
            self.iInsCount += 1
            return self.iInsCount
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Insert Records Except:")
            print("MongoDB Insert Records Except:", e,rec)
            return -1
        return self.iInsCount

	#
	# upsert
    def upsertOne(self, dKey:dict, dRec:dict)->bool:
		#
        try:
            cRc = self.cCollection.update_one(dKey,dRec, upsert= True)
            return True
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Insert Records Except:")
            print("MongoDB Insert Records Except:", e, dRec)
            return False


    #
    # 特定レコードのカラム更新
    def updateOne(self, dKey:dict, dItems:dict)-> int:
        #
        try:
            cRc = self.cCollection.update_one(dKey, {'$set':dItems})
            return cRc.matched_count
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Insert Records Except:")
            print("MongoDB Insert Records Except:", e,dItems)
            return -1


    # データ削除
    def deleteOne(self, dKey:dict)->int:
        #
        cRsp = self.cCollection.delete_one(dKey)
        if cRsp.acknowledged:
            return cRsp.deleted_count
        return -1

    #
    # データ削除
    def deleteMany(self, dKey:dict)->int:
        #
        cRsp = self.cCollection.delete_many(dKey)
        if cRsp.acknowledged:
            return cRsp.deleted_count
        return -1
    

    #
    # Select&Get All
    def selectAll(self, dWhere:dict, dItems:dict)->list:
        #
        if dItems == {}:
            cRows = self.cCollection.find(dWhere)
        else:
            cRows = self.cCollection.find(dWhere, dItems)
        lRslt = []
        for row in cRows:
            lRslt.append(row)
        return lRslt
    

    #
    # Select
    def select(self, dWhere:dict, dItems={}, dOrder={})->pymongo.cursor.Cursor:
        #
        if dItems != {} and dOrder != {}:
            cRows = self.cCollection.find(dWhere, dItems).sort(dOrder)
        if dItems != {} and dOrder == {}:
            cRows = self.cCollection.find(dWhere, dItems)
        if dItems == {} and dOrder == {}:
            cRows = self.cCollection.find(dWhere)
        return cRows
    

    #
    # Select
    def selectOpt(self, dWhere:dict, dItems={}, dOrder={})->dict:
        #
        if dItems != {} and dOrder != {}:
            cRows = self.cCollectionOpt.find(dWhere, dItems).sort(dOrder)
        if dItems != {} and dOrder == {}:
            cRows = self.cCollectionOpt.find(dWhere, dItems)
        if dItems == {} and dOrder == {}:
            cRows = self.cCollectionOpt.find(dWhere)
        rec = cRows.next()
        #print("SelectOpt:", rec)
        return rec
    

    #
    # Fetch
    def next(self,cRows:pymongo.cursor.Cursor)->dict:
        #
        try:
            dRslt = cRows.next()
            return dRslt
        except Exception as e:
            self.cLog.ExceptionLog(e, "Next Err")
            return {}


    #
    # Group By/Order By
    def aggregate(self, lGroup:list)->pymongo.cursor.Cursor:
        #
        cCur = self.cCollection.aggregate(lGroup)
        return cCur
