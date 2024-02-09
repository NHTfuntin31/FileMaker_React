
cli = poplib.POP3('ms526.kagoya.net')

# 認証
cli.user('a-shibano@linkstaff.co.jp')
cli.pass_('?1Dyq0,?C>4dM+')

# メールボックス内のメールの総数を取得
count = cli.stat()[0]
D:\Python\app\Common\Pop3Recv.py
D:\Python\app\Common\Pop3Send.py




for i in range(0,count):
  no = i + 1
  content = cli.retr(no)[1]
  msg = email.message_from_bytes(b'\r\n'.join(content))
  print(Mail.get_header(msg, 'from'))
  print(Mail.get_header(msg, 'subject'))
  print(Mail.get_date(msg))
  print(Mail.get_content(msg))
