import time
import poplib
import email
from email.header import decode_header

# ヘッダ情報取得
def get_header(msg, name):
    header = ''
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

# 受信日時
def get_date(msg):
    mdate = email.utils.parsedate(msg.get('date'))
    return time.strftime('%Y/%m/%d %H:%M:%S', mdate)

# body情報
def get_content(msg):
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
