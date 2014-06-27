from django.test import TestCase
from FindParking.models import ParkingMarker
from django.core.urlresolvers import reverse
        
class ModelsReturnFunctions(TestCase):
    def test_getLat_getLng(self):
        parking = ParkingMarker.objects.create(lat=55.12344, lng=32.44412)
        expectedLat = 55.12344
        actualLat = parking.get_lat()
        expectedLng = 32.44412
        actualLng = parking.get_lng()
        self.assertEqual(expectedLat, actualLat)
        self.assertEqual(expectedLng, actualLng)
        
class Landpage(TestCase):
    def test_find_parking(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue('parkings' in response.content)
        self.assertTrue('addressForm' in response.content)
        self.assertTrue('address' in response.content)
        self.assertTrue('lat' in response.content)
        self.assertTrue('lng' in response.content)
        self.assertTrue('features' in response.content)

    def test_nonexisting_url(self):
        response = self.client.get('/find')
        self.assertEqual(response.status_code, 404)
        
class AjaxRequestForParkings(TestCase):
    def test_ajax_trivial_data(self):
        response = self.client.get('/findparking/ajaxCall/42.69785377010348/23.319609063476502')
        self.assertEqual(response.status_code, 200)
        
    def test_ajax_with_zero_coordinates(self):
        response = self.client.get('/findparking/ajaxCall/0/0')
        self.assertEqual(response.status_code, 200)

    #from other project    
    def test_ajax_with_negative_coordinates(self):
        kwargs = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest',}
        url = reverse('ajax_call', args=['-1/-213'])
        response = self.client.get(url, **kwargs)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(url, '/ajaxCall/-1/-213')
        self.assertEqual(response.content, '[]')
        
    def test_ajax_with_trivial_coordinates(self):
        kwargs = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest',}
        url = reverse('ajax_call', args=['42.69753420/23.32075759'])
        response = self.client.get(url, **kwargs)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(url, '/ajaxCall/42.69753420/23.32075759')