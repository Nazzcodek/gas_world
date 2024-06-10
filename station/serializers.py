from rest_framework import serializers
from station.models import Station
from manager.serializers import ManagerSerializer
from station_attendant.serializers import AttendantSerializer


class StationSerializer(serializers.ModelSerializer):
    """This is the serializer class for the Station model"""
    manager = ManagerSerializer(read_only=True)
    attendants = AttendantSerializer(many=True, read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Station
        fields = '__all__'


class StationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            'name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'country'
            ]
        read_only_fields = ['id', 'owner']

    def validate(self, data):
        """
        Check that the address is unique for the owner.
        """
        owner = self.context['request'].user
        address = data['address']
        if Station.objects.filter(owner=owner, address=address).exists():
            raise serializers.ValidationError(
                "This address is already in use by this owner."
                )
        return data
