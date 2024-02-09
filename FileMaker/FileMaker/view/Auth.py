# import request
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from models.models import Connections


class apilogin(APIView):
    def post(self, request):
        username = request.GET.get('username', '1')
        password = request.GET.get('password', '2')
        print(username, password)
        # Basic認証
        user = authenticate(request, username=username, password=password)
        # 接続元IP取得
        # 'HTTP_X_FORWARDED_FOR'ヘッダを参照して転送経路のIPアドレスを取得する。
        forwarded_addresses = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded_addresses:
            # 'HTTP_X_FORWARDED_FOR'ヘッダがある場合: 転送経路の先頭要素を取得する。
            client_addr = forwarded_addresses.split(',')[0]
        else:
            # 'HTTP_X_FORWARDED_FOR'ヘッダがない場合: 直接接続なので'REMOTE_ADDR'ヘッダを参照する。
            client_addr = request.META.get('REMOTE_ADDR')
        print("Session:", request.session.session_key)
        print("IP", client_addr)
        if user is not None:
            login(request, user)
            print("Session:", request.session.session_key)
            print("Token:", request.META.get('CSRF_COOKIE', None))
            token = user.get_session_auth_hash()
            return Response({"Token": token}, status=status.HTTP_200_OK)
        else:
            return Response({"UnAuthorized"}, status=status.HTTP_401_UNAUTHORIZED)


class apilogout(APIView):
    def post(self, request):
        user = request.user
        print(user.__dict__)
        logout(request)
        return Response({"Bye"}, status=status.HTTP_200_OK)


def checkUser(userId: str) -> bool:
    recs = Connections.objects.filter(user_id=userId)
    if recs.count() == 0:
        return False
    return True
    