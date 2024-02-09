import re
import dns.resolver
import socket
import smtplib

#
# メールアドレスの存在チェックを行う
# 対象となるドメイン・メールアドレス問い合わせまで一貫して行う
#
class Mailaddress:
    #
    sMailAddress = ""
    sMXRecord = ""
    #mail_address
    RSLT_OK = 0
    RSLT_ERR_INPUT = -1
    RSLT_ERR_DOMAIN = -2
    RSLT_ERR_NO_ADDRESS = -3
    RSLT_ERR_OTHER = -4
    #
    def __init__(self):
        pass

    #
    # ドメインチェック
    def checekDomain(self, sMail:str)->int:
        #
        self. sMailAddress = sMail
        # パターンチェック
        match = re.match('[A-Za-z0-9._+]+@[A-Za-z]+.[A-Za-z]', self. sMailAddress)
        if match == None:
            return self.RSLT_ERR_INPUT
        # ドメインチェック
        mail_domain = re.search("(.*)(@)(.*)", self. sMailAddress).group(3) # ドメイン部分の取り出し
        try:
            records  = dns.resolver.query(mail_domain, 'MX')
            mxRecord = records[0].exchange
            self.MXRecord = str(mxRecord)
            print(mxRecord)
        except Exception as e:
            print('None of DNS query names exist')
            return self.RSLT_ERR_DOMAIN
        return self.RSLT_OK
    
    #
    # メールアドレス実在チェック
    def checkAddress(self)->int:
        #
        local_host = socket.gethostname()
        #
        server = smtplib.SMTP(timeout=5)
        server.set_debuglevel(0)
        #
        try:
            server.connect(self.MXRecord)
            server.helo(local_host)
            server.mail('test@example.com')
            code, message = server.rcpt(str(self. sMailAddress))
            server.quit()
            if code == 250:
                print('Address exists') # 250 OK
                return self.RSLT_OK
            else:
                print('Address does not exists')
                return self.RSLT_ERR_NO_ADDRESS
        except Exception as e:
            print(e)
            return self.RSLT_ERR_OTHER
        