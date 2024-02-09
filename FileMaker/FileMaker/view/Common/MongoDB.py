import pymongo
from django.conf import settings
import json
#
import collections  # From Python standard library.
import bson
from bson.codec_options import CodecOptions
from . import Log

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
    cLog = None
    #
    # 検索系
    cRows = None
    #
    # DB/Collection接続まで行う。
    def __init__(self, cLog):
        #
        self.dConVales = settings.EXT_DATABASE['MongoDB']
        #print("Mongo Config:", self.dConVales,"**", self.dConVales['Auth'])
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
        self.cLog = cLog
    
    #
    #
    def close(self):
        self.cClient.close()

    #
    # Collection指定
    def selectCollection(self, sCollection:str):
        #
        if self.cClient == None:
            return False
        try:
            #print("MongoDB Select Collection", sCollection)
            cCollection = self.cDB[sCollection]
            #print("cCollection:", self.cCollection)
            return cCollection
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Select Collection Except:")
            print("MongoDB Select Collection Except:", e)
            return None


    #
    # レコード登録を1件行う
    def insert(self, cClollecton, dRec:dict)->bool:
        #
        try:
            #print("Mongo Insert:", dRec)
            self.cCollection.insert_one(dRec)
            return True
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Insert Record Except:")
            print("MongoDB Insert Record Except:", e)
            return False

    #
    # レコード登録をｎ件行う
    def insertBulk(self, cClollecton, lRec:list)->int:
        #
        #print("Bulk Records:", lRec)
        if lRec == None or len(lRec) == 0:
            return -1
        try:
            iCount = 0
            for rec in lRec:
                cClollecton.insert_one(rec)
                iCount += 1
                #print("Rec:", rec)
            #self.cCollection.insert_many(lRec)
            return iCount
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Insert Records Except:")
            print("MongoDB Insert Records Except:", e,rec)
            return iCount
        return iCount

	#
	# upsert
    def upsertOne(self, cCollection, dKey:dict, dRec:dict)->bool:
		#
        try:
            cRc = cCollection.update_one(dKey,dRec, upsert= True)
            return True
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Insert Records Except:")
            print("MongoDB Insert Records Except:", e, dRec)
            return False


    #
    # 特定レコードのカラム更新
    def updateOne(self, cCollection, dKey:dict, dItems:dict)-> int:
        #
        try:
            cRc = cCollection.update_one(dKey, {'$set':dItems})
            return cRc.matched_count
        except Exception as e:
            self.cLog.ExceptionLog(e, "MongoDB Insert Records Except:")
            print("MongoDB Insert Records Except:", e,dItems)
            return -1


    # データ削除
    def deleteOne(self, cCollection, dKey:dict)->int:
        #
        cRsp = cCollection.delete_one(dKey)
        if cRsp.acknowledged:
            return cRsp.deleted_count
        return -1

    #
    # データ削除
    def deleteMany(self, cCollection, dKey:dict)->int:
        #
        cRsp = cCollection.delete_many(dKey)
        if cRsp.acknowledged:
            return cRsp.deleted_count
        return -1
    

    #
    # Select&Get All
    def selectAll(self, cCollection, dWhere:dict, dItems:dict)->list:
        #
        if dItems == {}:
            cRows = cCollection.find(dWhere)
        else:
            cRows = cCollection.find(dWhere, dItems)
        lRslt = []
        for row in cRows:
            lRslt.append(row)
        return lRslt
    

    #
    # Select
    def select(self, cCollection, dWhere:dict, dItems={}, dOrder={})->pymongo.cursor.Cursor:
        #
        if dItems != {} and dOrder != {}:
            cRows = cCollection.find(dWhere, dItems).sort(dOrder)
        if dItems != {} and dOrder == {}:
            cRows = cCollection.find(dWhere, dItems)
        if dItems == {} and dOrder == {}:
            cRows = cCollection.find(dWhere)
        return cRows
    

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
    def aggregate(self, cCollection, lGroup:list)->pymongo.cursor.Cursor:
        #
        cCur = cCollection.aggregate(lGroup)
        return cCur
