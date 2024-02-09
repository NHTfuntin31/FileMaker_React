from models.models import Connections
from models.models import DjangoSession
from models.models import Userpriv
from models.models import RefererChecks
from models.models import ApiChecks
from ZZZHTS.RDB import RDB
from datetime import datetime
import django.db as djangoDB
class Approval:
    #
    
    
    class Connection:
        #
        # DupeCheck
        DUPE_NO_LOGIN = 0
        DUPE_SAME_SESSION = -1
        DUPE_OTHER_SESSION = -2
        
        def __init__(self):
            #
            pass
        
        def DupeCheck(self, sIP, sUserID, sSession) -> int:
            #
            recs = Connections.objects.filter(ip_address=sIP, user_id=sUserID)
            if len(recs) == 0:
                return self.DUPE_NO_LOGIN
            if recs[0].session_key == sSession:
                return self.DUPE_SAME_SESSION
            return self.DUPE_OTHER_SESSION
        
        def entryConnectons(self, sUserID:str, sIP:str, sSession:str, sToken:str) -> int:
            #
            rec = Connections()
            rec.user_id = sUserID
            rec.ip_address = sIP
            rec.session_key = sSession
            rec.csrf_token = sToken
            rec.login_time = datetime.now()
            rec.is_enabled = True
            try:
                rec.save()
            except djangoDB.DatabaseError:
                return False
            return True
        
        def delConnections(self, sSession: str) -> bool:
            #
            rec = Connections.objects.filter(session_key=sSession)
            if len(rec) == 0:
                return False
            for img in rec:
                img.delete()
            return True
            
        def cleanUp(self) -> int:
            #
            curdt = datetime.now()
            recs = DjangoSession.objects.filter(expire_date__lte=curdt)
            if len(recs) == 0:
                return 0
            for rec in recs:
                self.delConnections(rec.session_key)
                rec.delete()
            return len(recs)
    
    class UserVPrivilege:
        #
        class URLCheck:
            #
            API_FUNC_GET = 1
            API_FUNC_PUT = 2
            API_FUNC_POST = 4
            API_FUNC_DEL = 8
            #
            RefUrl = ""
            APIUrl = ""
            APIFunc = 0
            checkRef = False
            checkAPI = False
            #
            def __init__(self, ref_url:str, api_url:str, func:int):
                #
                if ref_url is None or ref_url == "":
                    pass
                else:
                    self.RefUrl = ref_url
                    self.checkRef = True
                if api_url is None or api_url == "":
                    pass
                else:
                    self.checkAPI = True
                    self.APIUrl = api_url
                    self.APIFunc = func
            
            def check(self):
                #
                if self.checkRef:
                    recs = RefererChecks.objects.filter()
                    
        #
        class Privilege:
            #
            UserID = ""
            PrivRecs = []
            
            def __init__(self, sUserID: str):
                #
                self.UserID = sUserID
            
            def getRecord(self, sOrgCD: str, sGroupCD: str):
                #
                now = datetime.now()
                PrivRecs = Userpriv.objects.filter(user_id=self.sUserID, org_cd=sOrgCD,
                                                   group_cd=sGroupCD, start_date__gte=now,
                                                   end_date__lte=now)
                if len(self.PrivRecs) == 0:
                    return None
                return PrivRecs
                    
        UserID = ""
        IP = ""
        SessionKey = ""
        Token = ""
        OrgCD = ""
        GroupCD = ""
        refURL = ""
        apiURL = ""
        apiFunc = 0
        UserPriv = None

        def __init__(self, sUserID:str, sIP:str, sSession:str, sToken:str, 
                     sOrgCD: str, sGroupCD: str,
                     ref_url:str, api_url:str, func:int):
            #
            self.UserID = sUserID
            self.UserPriv = self.Privilege(sUserID)
                
                
                
            
