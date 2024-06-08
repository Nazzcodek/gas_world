from django.contrib.auth.backends import ModelBackend
from owner.models import Owner
from manager.models import Manager
from station_attendant.models import Attendant
from station.models import Station
from product.models import Pump
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from rest_framework_simplejwt.views import TokenRefreshView
from service.token_utils import set_tokens_and_response
from django.contrib.auth import get_user_model


class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = Owner.objects.get(email=email)
            if user.check_password(password):  
                return user  
        except Owner.DoesNotExist:
            pass

        try:
            user = Manager.objects.get(email=email)
            if user.check_password(password):
                return user  
        except Manager.DoesNotExist:
            pass

        try:
            user = Attendant.objects.get(email=email)
            if user.check_password(password):
                return user  
        except Attendant.DoesNotExist:
            pass

        return None


class CookieTokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = request.COOKIES.get('access')
        csrftoken = request.COOKIES.get('csrftoken')
        if token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        if csrftoken:
            request.META['HTTP_X_CSRFTOKEN'] = csrftoken
        response = self.get_response(request)
        return response
    


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh_token = request.data.get('refresh')
        
        if response.status_code == 200 and refresh_token:
            # Decode the refresh token to get the user
            refresh = RefreshToken(refresh_token)
            user_id = refresh.payload.get('user_id')
            User = get_user_model()
            user = User.objects.get(id=user_id)
            # Use the function to set cookies and return response
            return set_tokens_and_response(request, user, refresh)
        
        return response



class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()

            user_id = token['user_id']

            # Clear the cache for this user
            keys_to_clear = [
                f"is_manager_{user_id}",
                f"manager_station_{user_id}",
                f"is_attendant_{user_id}",
                f"attendant_station_{user_id}",
                f"attendant_{user_id}_pump_readings",
                f"is_owner_{user_id}",
            ]

            # Clear attendant and pump keys
            attendants = Attendant.objects.filter(station=user_id).values('id')
            for attendant in attendants:
                keys_to_clear.append(f"manager_{user_id}_attendant_{attendant['id']}")

            pumps = Pump.objects.filter(station=user_id).values('id')
            for pump in pumps:
                keys_to_clear.append(f"manager_{user_id}_pump_{pump['id']}")

            # Clear owner station keys
            stations = Station.objects.filter(owner=user_id).values('id')
            for station in stations:
                keys_to_clear.append(f"owner_{user_id}_station_{station['id']}")

            for key in keys_to_clear:
                cache.delete(key)

            return Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)