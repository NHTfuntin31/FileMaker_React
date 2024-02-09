"""
URL configuration for FileMaker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from FileMaker.view.zip import AddressFromZip
from FileMaker.view.LinkAuth import Login, Logout, Ping, ChangePass
#from FileMaker.view.Hospital import FindHospital, HostpitalArea, HospitalMarket
from FileMaker.view.ScheduleBook import ScheduleBook
from FileMaker.view.ScheduleBook import Masters

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/addresses/zip', AddressFromZip.as_view(), name='cls-v'),
    #path('api/login', Login.as_view(), name='cls-v'),
    # å†å¿ä«óùån LinkQuth.py(Django AuthÉxÅ[ÉX)
    path('api/login', Login.as_view()),
    path('api/logout', Logout.as_view(), name='cls-v'),
    path('api/change', ChangePass.as_view()),
    path('api/ping', Ping.as_view(), name='cls-v'),
    # à»â∫ÅAã∆ñ±ån
    # êVïaâ@ÉäÉXÉg HospitalList.py(îpé~)
    #path('api/find_hospital', FindHospital.as_view),
    #path('api/hospital_area', HostpitalArea.as_view),
    #path('api/hospital_market', HospitalMarket.as_view),
    #
    # e-doctorã@î\ägí£
    path('api/mypage/schedule', ScheduleBook.as_view()),
    path('api/mypage/schedule/master', Masters.as_view())
]
