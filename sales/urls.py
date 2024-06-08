from django.urls import path
from sales.views import SalesView

sales_list = SalesView.as_view({
    'get': 'list',
})

sales_retrieve_update = SalesView.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
})

sales_by_station = SalesView.as_view({
    'get': 'by_station',
})

sales_by_pump = SalesView.as_view({
    'get': 'by_pump',
})

sales_by_attendant = SalesView.as_view({
    'get': 'by_attendant',
})

urlpatterns = [
    path('sales', sales_list, name='sales-list'),
    path('sales/<uuid:pk>', sales_retrieve_update, name='sales-detail'),
    path('sales/station/<uuid:station_id>', sales_by_station, name='sales-by-station'),
    path('sales/pump/<uuid:pump_id>', sales_by_pump, name='sales-by-pump'),
    path('sales/attendant/<uuid:attendant_id>', sales_by_attendant, name='sales-by-attendant'),
]
