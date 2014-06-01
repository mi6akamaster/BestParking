from django.db import models

class HomePageNewsFeed(models.Model):
    info = models.TextField()
    title = models.CharField(max_length=45)
    def __unicode__(self):
        return str(self.title)

class Viewer(models.Model):
    email = models.CharField(max_length = 60)

class ParkingOwner(models.Model):
    email = models.CharField(max_length = 60)
    