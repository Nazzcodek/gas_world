from django.urls import path
from station_attendant.views import AttendantViewSet, AttendantLoginView

urlpatterns = [
    path('attendants/<uuid:station_id>', AttendantViewSet.as_view(
        actions={'get': 'list', 'post': 'create'}
        ),
        name='attendant-list-create'),
    path('attendants/<uuid:station_id>/<uuid:pk>', AttendantViewSet.as_view(
        actions={'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}
        ),
        name='attendant-detail'),
    path('attendant/login', AttendantLoginView.as_view(), name='attendant-login'),
]