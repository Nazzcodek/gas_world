from django.urls import path
from .views import OwnerCreateView, LoginView, OwnerListView, OwnerRetrieveUpdateDestroyView

urlpatterns = [
    path('owner', OwnerCreateView.as_view(), name='owner-create'),
    path('owner/login', LoginView.as_view(), name='login'),
    path('owners', OwnerListView.as_view(), name='owner-list'),
    path('owners/<uuid:id>', OwnerRetrieveUpdateDestroyView.as_view(), name='owner-detail'),
]