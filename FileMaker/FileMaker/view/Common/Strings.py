import re
import datetime


#
# サロゲート文字除去
def removeSurrogateChars(text:str )->str:
    surrogate_pattern = re.compile('[\ud800-\udfff]')
    cleaned_text = surrogate_pattern.sub('', text)
    return cleaned_text


#
# 時間帯情報生成
def makeTimeZone(sFromTime:str, sToTime:str)->list:
    #
    try:
        dtFrom = datetime.datetime.strptime(sFromTime,"%H:%M:%S")
        dtTo = datetime.datetime.strptime(sToTime,"%H:%M:%S")
        sFrom = dtFrom.strftime("%H:%M:%S")
        sTo = dtTo.strftime("%H:%M:%S")
    except Exception as e:
        print("Err:",e)
        return []
    tzl = "0"
    tzc = "0"
    tzr = "0"
    if sFrom >= "18:00":
        tzr = "1"
    if sFrom >= "13:00":
        tzc = "1"
    if sFrom >= "06:00":
        tzl = "1"
    tz = tzl + tzc + tzr
    return [tz, sFrom, sTo]
    
    