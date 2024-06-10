from django.urls import path
from station_attendant.views import *

app_name = 'station_attendant'

urlpatterns = [
    path('attendants/<uuid:station_id>', AttendantViewSet.as_view(
        actions={'get': 'list', 'post': 'create'}
        ),
        name='attendant-list-create'),

    path(
        'attendants/<uuid:station_id>/<uuid:pk>',
        AttendantViewSet.as_view(
            actions={
                'get': 'retrieve',
                'put': 'update',
                'delete': 'destroy',
                'patch': 'partial_update'
                }
            ),
        name='attendant-detail'
        ),

    path(
        'attendant/<uuid:pk>/change_password',
        AttendantViewSet.as_view({
            'put': 'update_password'
        }),
        name='change-attendant-password'),

    path('attendant/login',
         AttendantLoginView.as_view(),
         name='attendant-login'),
]
