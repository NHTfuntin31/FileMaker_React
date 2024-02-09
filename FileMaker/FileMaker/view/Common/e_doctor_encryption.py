import hmac
import hashlib
import math
import base64
#
# e-doctorパスワード符号化
# p:符号化対象パスワード
# s:soltキー
# c:繰り返し
# kl:Key長
# a:暗号化方式
def pbkdf2(p, s, c, kl, a='sha256'):
   
    hl = len(hashlib.new(a).digest())
    kb = math.ceil(kl / hl)
    dk = b''
    for block in range(1, kb + 1):
        ib = b = hmac.new(p, s + block.to_bytes(4, 'big'), a).digest()
        for _ in range(1, c):
           b = hmac.new(p, b, a).digest()
           ib = bytes(x ^ y for x, y in zip(ib, b))
       
        dk += ib
    return dk[:kl]

user_input = input('Enter your password hare: ')
password = "6809Akira".encode("utf-8")
salt = b'put_your_salt_here'
iterations = 10000
key_length = 32  

result = pbkdf2(password, salt, iterations, key_length)
base64_encoded_result = base64.b64encode(result)
print(base64_encoded_result.decode('utf-8'))
