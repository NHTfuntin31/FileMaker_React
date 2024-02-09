import sys
import time
import poplib
import email
from email.header import decode_header
import datetime
#
from . import Log


class Pop3MailRecv:
    #
    # メールクライアント
    cMailCli = None
    #
    sState = ""
    #
    cLog = None

    def __init__(self, sHost:str, sUser:str, sPass:str, cLog:Log):
        #
        self.sMailServer = sHost
        self.sMailUser = sUser
        self.sPass = sPass
        self.cLog = cLog


    #
    # Connect Server
    def connect(self)->bool:
        #
        try:
            self.cMailCli = poplib.POP3(self.sMailServer)
            self.sState = self.cMailCli.user(self.sMailUser)
            self.sState = self.cMailCli.pass_(self.sPass)
            return True
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "POP3認証エラー:"+str(e))
            print("POP3 認証エラー")
        return False
    

    #
    # disconnect Server
    def disconeect(self):
        #
        self.cMailCli.close()
        self.cMailCli = None
    

    #
    # メール総数取得
    def getMailCount(self)->int:
        #
        try:
            rslt = self.cMailCli.stat()[0]
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "POP3 件数取得エラー:"+str(e))
            print("POP3 件数取得エラー", e)
        return rslt
    

    #
    # メッセージ取得
    def getMessage(self, iIdx:int):
        #
        try:
            #print("IDX:",iIdx)
            content = self.cMailCli.retr(iIdx)[1]
            #print("content", type(content))
            msg = email.message_from_bytes(b'\r\n'.join(content))
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "POP3 content get except:"+str(e))
            print("POP3 content get ", e)
        return msg
    

    #
    # 返信者情報取得
    def getSender(self, msg)->str:
        #
        return self.getMailHeaderInfo(msg, 'from')
    

    #
    # メールタイトル取得
    def getTitle(self, msg)->str:
        #
        return self.getMailHeaderInfo(msg, 'subject')
    

    #
    # メールヘッダ取得
    def getMailHeaderInfo(self,msg, name)->str:
        #
        header = ''
        #
        if msg[name]:
            for tup in decode_header(str(msg[name])):
                if type(tup[0]) is bytes:
                    charset = tup[1]
                    if charset:
                        header += tup[0].decode(tup[1])
                    else:
                        header += tup[0].decode()
                elif type(tup[0]) is str:
                    header += tup[0]
        return header


    #
    # 受信日時取得
    def getRecvDate(self, msg)->datetime:
        #
        try:
            mdate = email.utils.parsedate(msg.get('date'))
            return datetime.datetime(mdate[0],mdate[1],mdate[2],
                                    mdate[3],mdate[4],mdate[5])
        except Exception as e:
            self.cLog.Logger.log(self.cLog.CRITICAL, "POP3 受信日時取得 except:"+str(e))
            print("POP3 受信日時取得 except:", e)


    #
    # 本文取得
    def getMessageBody(self, msg):
        #
        if msg.is_multipart() is True:
            rst = ""
            for part in msg.walk():
                payload = part.get_payload(decode=True)
                if payload is None:
                    continue
                charset = part.get_content_charset()
                if charset is not None:
                    payload = payload.decode(charset, "ignore")
                rst += str(payload)
            return rst
        else:
            charset = msg.get_content_charset()
            payload = msg.get_payload(decode=True)
            try:
                if payload:
                    if charset:
                        return payload.decode(charset)
                    else:
                        return payload.decode()
                else:
                    return ""
            except:
                return payload
            
