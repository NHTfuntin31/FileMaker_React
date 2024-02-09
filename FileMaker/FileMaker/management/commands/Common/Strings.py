import re


#
# サロゲート文字除去
def removeSurrogateChars(text:str )->str:
    surrogate_pattern = re.compile('[\ud800-\udfff]')
    cleaned_text = surrogate_pattern.sub('', text)
    return cleaned_text
