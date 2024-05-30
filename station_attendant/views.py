from django.core.cache import cache
from django.http import HttpResponse
from rest_framework import viewsets, status, permissions
from station_attendant.models import Attendant
from station_attendant.serializers import AttendantSerializer, AttendantCreateSerializer, AttendantTokenObtainPairSerializer
from owner.permissions import IsAuthenticatedManager, IsAuthenticatedAttendant
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.exceptions import PermissionDenied
from product.models import PumpReading


class AttendantViewSet(viewsets.ModelViewSet):
    queryset = Attendant.objects.all()
    serializer_class = AttendantSerializer

    def get_permissions(self):
        if self.action in ['list', 'create']:
            return [IsAuthenticatedManager()]  # Only station managers can create or list attendants
        elif self.action in ['update', 'partial_update']:
            return [permissions.OR(IsAuthenticatedManager(), IsAuthenticatedAttendant())]
        elif self.action == 'destroy':
            return [IsAuthenticatedManager()]  # Only station managers can delete attendants
        else:  # retrieve
            return [permissions.OR(IsAuthenticatedManager(), IsAuthenticatedAttendant())]

    def get_serializer_class(self):
        if self.action == 'create':
            return AttendantCreateSerializer
        return AttendantSerializer

    def get_queryset(self):
        station_id = self.kwargs.get('station_id')
        if self.action in ['list', 'retrieve'] and station_id:
            return Attendant.objects.filter(station_id=station_id)
        return Attendant.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"detail": "Attendant deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    def handle_exception(self, exc):
        if isinstance(exc, PermissionDenied):
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        return super().handle_exception(exc)


class AttendantLoginView(TokenObtainPairView):
    serializer_class = AttendantTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        
        # Retrieve the authenticated user
        user = serializer.validated_data['user']
        name = user.name
        
        if user.is_attendant:
            refresh = RefreshToken.for_user(user)
            # Store both is_attendant status and station_id in Redis
            cache.set(f"is_attendant_{user.id}", user.is_attendant, timeout=3600)
            cache.set(f"attendant_station_{user.id}", user.station_id, timeout=3600)

            # Save last 10 pump readings assigned to this attendant in Redis
            pump_readings = PumpReading.objects.filter(attendant=user).order_by('-timestamp')[:10]
            pump_reading_ids = [pr.id for pr in pump_readings]
            cache.set(f"attendant_{user.id}_pump_readings", pump_reading_ids, timeout=3600)

            response = HttpResponse()

            response.set_cookie(
                'access', 
                str(refresh.access_token), 
                httponly=True, 
                secure=False,  # Only set this if you're using HTTPS
                samesite='Lax'
            )

            response = Response({
                'name': name,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)

            return response
        else:
            return Response({
                "detail": "User is not an attendant."
            }, status=status.HTTP_403_FORBIDDEN)
