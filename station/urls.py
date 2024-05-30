from django.urls import path
from station.views import StationViewSet

app_name = 'station'

urlpatterns = [
    path('stations', StationViewSet.as_view(
        actions={'get': 'list', 'post': 'create'}
        ),
        name='station-list-create'),
    path('stations/<uuid:pk>', StationViewSet.as_view(
        actions={'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}
        ),
        name='station-detail'),
]