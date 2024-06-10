from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.permissions import OR
from rest_framework.decorators import action
from manager.models import Manager
from manager.serializers import *
from owner.permissions import IsStationOwner, IsAuthenticatedManager
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.exceptions import PermissionDenied
from product.models import Pump
from station_attendant.models import Attendant
from service.token_utils import set_tokens_and_response


class ManagerViewSet(viewsets.ModelViewSet):
    queryset = Manager.objects.all()
    serializer_class = ManagerSerializer

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            return [IsStationOwner()]
        elif self.action in ['update', 'partial_update', 'retrieve']:
            return [OR(IsStationOwner(), IsAuthenticatedManager())]
        else:
            return [OR(IsStationOwner(), IsAuthenticatedManager())]

    def get_serializer_class(self):
        if self.action == 'create':
            return ManagerCreateSerializer
        return ManagerSerializer

    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            station_id = self.kwargs.get('station_id')
            if station_id:
                return Manager.objects.filter(station=station_id)
        return Manager.objects.all()

    @action(detail=True, methods=['put'])
    def update_password(self, request, pk=None):
        manager = self.get_object()
        serializer = ManagerCreateSerializer(
            manager,
            data=request.data,
            partial=True
            )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": "Password updated successfully"},
                status=status.HTTP_200_OK
                )
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
                )

    @action(detail=False, methods=['get'])
    def by_station(self, request, station_id=None):
        manager = self.get_queryset().filter(station=station_id).first()
        if manager:
            serializer = self.get_serializer(manager)
            return Response(serializer.data)
        else:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND
                )

    def handle_exception(self, exc):
        if isinstance(exc, PermissionDenied):
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN
                )
        return super().handle_exception(exc)


# manager login
class ManagerLoginView(TokenObtainPairView):
    serializer_class = ManagerTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        # Retrieve the authenticated user
        user = serializer.validated_data['user']

        if user.is_manager:
            refresh = RefreshToken.for_user(user)
            cache.set(f"is_manager_{user.id}", user.is_manager, timeout=3600)
            cache.set(
                f"manager_station_{user.id}",
                user.station_id,
                timeout=3600
                )

            attendants = Attendant.objects.filter(
                station=user.station_id
                ).values('id', 'name')

            for attendant in attendants:
                cache.set(
                    f"manager_{user.id}_attendant_{attendant['id']}",
                    attendant['name'],
                    timeout=3600
                    )

            # Save all pumps for the manager's
            # station in Redis with unique keys
            pumps = Pump.objects.filter(station=user.station_id).values(
                'id', 'name'
                )
            for pump in pumps:
                cache.set(
                    f"manager_{user.id}_pump_{pump['id']}",
                    pump['name'], timeout=3600
                    )

            return set_tokens_and_response(request, user, refresh)

        else:
            return Response({
                "detail": "User is not a manager."
            }, status=status.HTTP_403_FORBIDDEN)
