from django.test import TestCase
from FindParking.views import distance

class DistanceFromAToB(TestCase):
    def test_distance_with_trivial_parameters(self):
        seattle = [47.621800, -122.350326]
        olympia = [47.041917, -122.893766]
        actual_istance = distance(seattle, olympia)
        expected_distance = 76.38661579954869
        self.assertEqual(expected_distance, actual_istance)
        
    def test_distance_with_predictable_output(self):
        pointA = [0.0, 0.0]
        pointB = [1.0, 1.0]
        distanceAB = distance(pointA, pointB)
        pointC = [0.0, 0.0]
        pointD = [-1.0, -1.0]
        distanceCD = distance(pointC, pointD)
        self.assertEqual(distanceAB, distanceCD)
        
    def test_distance_with_zero_values(self):
        pointA = [0.0, 0.0]
        pointB = [0.0, 0.0]
        actual_istance = distance(pointA, pointB)
        expected_distance = 0.0
        self.assertEqual(expected_distance, actual_istance)

class HomeViews(TestCase):
    def test_landing_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue('parkings' in response.content)
        self.assertTrue('addressForm' in response.content)
        self.assertTrue('newsFeed' in response.content)
        
    def test_nonexisting_url(self):
        response = self.client.get('/party')
        self.assertEqual(response.status_code, 404)
