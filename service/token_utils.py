from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from django.middleware.csrf import get_token
from owner.models import Owner
from manager.models import Manager
from station_attendant.models import Attendant


def set_tokens_and_response(request, user, refresh):
    response = HttpResponse()
    response.set_cookie(
        'access',
        str(refresh.access_token),
        httponly=True,
        secure=False,
        samesite='Lax'
    )
    response.set_cookie(
        'refresh',
        str(refresh),
        httponly=True,
        secure=False,
        samesite='Lax'
    )
    response.set_cookie('csrftoken', get_token(request))

    if isinstance(user, Owner):
        station_ids = list(user.station_set.values_list('id', flat=True))
        response_data = {
            'name': user.name,
            'id': user.id,
            'station_ids': station_ids,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    elif isinstance(user, Manager) or isinstance(user, Attendant):
        station_id = user.station.id if user.station else None
        response_data = {
            'name': user.name,
            'id': user.id,
            'station_id': station_id,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    else:
        response_data = {
            'name': user.name,
            'id': user.id,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    response = Response(response_data, status=status.HTTP_200_OK)

    return response
