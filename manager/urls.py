from django.urls import path
from manager.views import ManagerViewSet, ManagerLoginView

urlpatterns = [
    path('manager/<uuid:station_id>', ManagerViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='manager-list-create'),

    path('manager/station/<uuid:station_id>',
         ManagerViewSet.as_view({'get': 'by_station'}),
         name='station_manager'),

    path('manager/<uuid:station_id>/<uuid:pk>', ManagerViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='manager-detail'),

    path('manager/<uuid:pk>/change_password', ManagerViewSet.as_view({
        'put': 'update_password'
    }), name='change-manager-password'),

    path('manager/login', ManagerLoginView.as_view(), name='manager-login'),
]