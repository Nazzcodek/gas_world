from django.urls import path
from .views import ProductViewSet, PumpViewSet, PumpReadingViewSet

urlpatterns = [
    path('products', ProductViewSet.as_view(
        actions={'get': 'list', 'post': 'create'}
        ),
        name='product-list-create'),
    path('products/station/<uuid:station_id>', ProductViewSet.as_view({'get': 'by_station'}), name='products-by-station'), 
    path('products/<uuid:pk>', ProductViewSet.as_view(
        actions={'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}
        ),
        name='product-detail'),

    path('pumps', PumpViewSet.as_view(
        actions={'get': 'list', 'post': 'create'}
        ),
        name='pump-list-create'),
    path('pumps/station/<uuid:station_id>', PumpViewSet.as_view({'get': 'by_station'}), name='products-by-station'),
    path('pumps/<uuid:pk>', PumpViewSet.as_view(
        actions={'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}
        ),
        name='pump-detail'),

    path('pumpreadings', PumpReadingViewSet.as_view(
        actions={'get': 'list', 'post': 'create'}
        ),
        name='pumpreading-list-create'),
    path('pumpreadings/<uuid:pk>', PumpReadingViewSet.as_view(
        actions={'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}
        ),
        name='pumpreading-detail'),
]