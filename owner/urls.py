from django.urls import path
from owner.views import (
    OwnerCreateView,
    LoginView,
    OwnerListView,
    OwnerUpdatePasswordView,
    OwnerRetrieveUpdateDestroyView
)

urlpatterns = [
    path('owner', OwnerCreateView.as_view(), name='owner-create'),
    path('owner/login', LoginView.as_view(), name='login'),
    path('owners', OwnerListView.as_view(), name='owner-list'),
    path('owner/<uuid:pk>',
         OwnerRetrieveUpdateDestroyView.as_view(),
         name='owner-detail'),
    path('owner/<uuid:pk>/change_password',
         OwnerUpdatePasswordView.as_view(),
         name='change-owner-password'),
]
