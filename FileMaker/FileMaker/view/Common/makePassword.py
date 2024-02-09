from django.contrib.auth.hashers import make_password

def set_password(sRawPassword:str)->str:
    return make_password(sRawPassword)
