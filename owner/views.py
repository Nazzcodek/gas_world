from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from owner.models import Owner
from owner.serializers import *
from owner.permissions import IsAuthenticatedOwner
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from station.models import Station
from django.middleware.csrf import get_token


class OwnerCreateView(generics.CreateAPIView):
    """This view provides create functionality for the Owner model"""
    permission_classes = [permissions.AllowAny]
    queryset = Owner.objects.all()
    serializer_class = CreateOwnerSerializer



class LoginView(TokenObtainPairView):
    serializer_class = OwnerTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        
        # Retrieve the authenticated user
        user = serializer.validated_data['user']
        name = user.name

        if user.is_owner:
            refresh = RefreshToken.for_user(user)

            # Store owner status and their stations in Redis with unique keys
            cache.set(f"is_owner_{user.id}", user.is_owner, timeout=3600)
            stations = Station.objects.filter(owner=user).values('id', 'name')
            for station in stations:
                cache.set(f"owner_{user.id}_station_{station['id']}", station['name'], timeout=3600)

            response = HttpResponse()

            response.set_cookie(
                'access', 
                str(refresh.access_token), 
                httponly=True, 
                secure=False,  # Only set this if you're using HTTPS
                samesite='Lax'
            )

            response.set_cookie('csrftoken', get_token(request))

            response = Response({
                'name': name,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)

            return response
        else:
            return Response({
                "detail": "User is not an owner."
            }, status=status.HTTP_403_FORBIDDEN)
    

class OwnerListView(generics.ListAPIView):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = self.queryset
        return queryset.filter(id=self.request.user.id)


class OwnerRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = (permissions.IsAuthenticated, IsAuthenticatedOwner,)

    def get_object(self):
        """
        Returns the Owner object associated with the authenticated user.
        """
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset)
        return obj

    def perform_update(self, serializer):
        """
        Updates the object with the given serializer.
        """
        serializer.save()

    def perform_destroy(self, instance):
        """
        Deletes the given instance from the database.
        """
        instance.delete()
