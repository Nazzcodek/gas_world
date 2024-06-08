from django.urls import path
from .views import PitViewSet, PitReadingViewSet

urlpatterns = [
    path('pits', PitViewSet.as_view(
        actions={'get': 'list', 'post': 'create'}
        ),
        name='pit-list-create'),
    path('pits/station/<uuid:station_id>', PitViewSet.as_view({'get': 'by_station'}), name='pits-by-station'),
    path('pits/product/<uuid:product_id>', PitViewSet.as_view({'get': 'by_product'}), name='pits-by-product'),
    path('pits/<uuid:pk>', PitViewSet.as_view(
        actions={'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}
        ),
        name='Pit-detail'),

    path('pitreadings/pit/<uuid:pit_id>', PitReadingViewSet.as_view(
        actions={'post': 'create'}
        ),
        name='pitreading-list-create'),
    path('pitreadings/station/<uuid:station_id>', PitReadingViewSet.as_view({'get': 'by_station'}), name='readings-by-station'),
    path('pitreadings/pump/<uuid:pump_id>', PitReadingViewSet.as_view({'get': 'by_pump'}), name='readings-by-pump'),
    path('pitreadings/pit-get/<uuid:pit_id>', PitReadingViewSet.as_view({'get': 'by_pit'}), name='readings-by-pit'),
    path('pitreadings/<uuid:pk>', PitReadingViewSet.as_view(
        actions={'get': 'retrieve', 'put': 'update', 'delete': 'destroy', 'patch': 'partial_update'}
        ),
        name='pitreading-detail'),
]