from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework import status, generics, permissions, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from owner.models import Owner
from owner.serializers import *
from owner.permissions import IsAuthenticatedOwner
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from station.models import Station
from service.token_utils import set_tokens_and_response
from rest_framework.decorators import action


class OwnerCreateView(generics.CreateAPIView):
    """This view provides create functionality for the Owner model"""
    permission_classes = [permissions.AllowAny]
    queryset = Owner.objects.all()
    serializer_class = CreateOwnerSerializer


class LoginView(TokenObtainPairView):
    """
    View for user login.

    This view handles the user login process.
    It validates the user's credentials,
    checks if the user is an owner,
    and generates tokens for authentication.

    Attributes:
        serializer_class (class):
        The serializer class used for token generation.

    Methods:
        post(request, *args, **kwargs):
        Handles the HTTP POST request for user login.

    """

    serializer_class = OwnerTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """
        Handles the HTTP POST request for user login.

        This method validates the user's credentials
        using the serializer, checks if the user is an owner,
        and generates tokens for authentication.
        If the user is an owner, it also stores the
        owner status and their stations in Redis with unique keys.

        Args:
            request (HttpRequest): The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: The HTTP response object.

        Raises:
            InvalidToken: If there is an error with the token.

        """

        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        # Retrieve the authenticated user
        user = serializer.validated_data['user']

        if user.is_owner:
            refresh = RefreshToken.for_user(user)

            # Store owner status and their stations in Redis with unique keys
            cache.set(f"is_owner_{user.id}", user.is_owner, timeout=3600)
            stations = Station.objects.filter(owner=user).values('id', 'name')
            for station in stations:
                cache.set(
                    f"owner_{user.id}_station_{station['id']}",
                    station['name'],
                    timeout=3600
                )

            return set_tokens_and_response(request, user, refresh)

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
    """
    A view for retrieving, updating, and deleting an Owner object.

    Inherits from generics.RetrieveUpdateDestroyAPIView, which provides
    the default implementation for retrieving, updating, and deleting
    a model instance.

    Attributes:
        queryset (QuerySet): The queryset of Owner objects.
        serializer_class (Serializer):
            The serializer class for Owner objects.
        permission_classes (tuple):
            The permission classes required for accessing this view.

    Methods:
        get_object:
            Retrieves the Owner object based on the provided primary key.
        perform_update:
            Performs the update operation on the Owner object.
        perform_destroy:
            Performs the delete operation on the Owner object.
    """

    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = (permissions.IsAuthenticated, IsAuthenticatedOwner,)

    def get_object(self):
        """
        Retrieves the Owner object based on the provided primary key.

        Returns:
            Owner: The retrieved Owner object.

        Raises:
            Http404: If the Owner object with the
            provided primary key does not exist.
        """
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        return obj

    def perform_update(self, serializer):
        """
        Performs the update operation on the Owner object.

        Args:
            serializer (Serializer):
                The serializer instance for the Owner object.
        """
        serializer.save()

    def perform_destroy(self, instance):
        """
        Performs the delete operation on the Owner object.

        Args:
            instance (Owner): The Owner object to be deleted.
        """
        instance.delete()


class OwnerUpdatePasswordView(views.APIView):
    """
    API view for updating the password of an owner.

    This view requires the user to be authenticated
    and the owner to be the authenticated user.

    Methods:
    - get_object(pk): Retrieves the owner
        object based on the provided primary key.
    - put(request, pk, format=None): Updates
        the password of the owner based on the provided data.

    Attributes:
    - permission_classes: A tuple of permission classes
        required for accessing this view.
    """

    permission_classes = (permissions.IsAuthenticated, IsAuthenticatedOwner)

    def get_object(self, pk):
        """
        Retrieves the owner object based on the provided primary key.

        Args:
        - pk: The primary key of the owner.

        Returns:
        - The owner object with the provided primary key.

        Raises:
        - Http404: If the owner with the provided primary key does not exist.
        """
        try:
            return Owner.objects.get(pk=pk)
        except Owner.DoesNotExist:
            raise get_object_or_404()

    def put(self, request, pk, format=None):
        """
        Updates the password of the owner based on the provided data.

        Args:
        - request: The HTTP request object.
        - pk: The primary key of the owner.
        - format: The format of the request data (default: None).

        Returns:
        - A response indicating the result of the password update.

        Raises:
        - None.
        """
        owner = self.get_object(pk)
        serializer = UpdatePasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(owner, serializer.validated_data)
            return Response(
                 {"success": "Password updated successfully"},
                 status=status.HTTP_200_OK
                 )
        return Response(
             serializer.errors,
             status=status.HTTP_400_BAD_REQUEST
             )
