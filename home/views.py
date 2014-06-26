# -*- coding: utf-8 -*- 
from django.template import RequestContext
from django.contrib.sites.models import get_current_site
from django.shortcuts import render_to_response
from home.forms import LocationForm, SubscribeForm, GetHomeParking
from FindParking.models import ParkingMarker, ParkingFeatures, PaymentMethod
from home.models import HomePageNewsFeed
from django.contrib.sites.models import Site
from home.models import Viewer, ParkingOwner
from django.db import IntegrityError
import math

def home(request):  
    """
    function that take a request from the website
    and if request is GET then returns html with a form containing base values for 
    some fields: fromHour, toHour, fromPeriod, toPeriod;
    if POST then takes the latitude and longitude coordinates of the address that the user has written
    as well as the address, then make SQL requests for near parkings and their features
    finally returns html with selected parkings 
    """
    if request.method == 'GET':
        return landing_page(request)
    else:
        if 'idParking' in request.POST:
            return fast_choice_parkings()  
        elif 'subsribeForm' in request.POST:
            return subscribe_user(request)
        elif 'addressForm' in request.POST:     
            return search_for_location(request)

def landing_page(request):
    subscribe_form = SubscribeForm()
    get_home_parking = GetHomeParking()
    address_form = LocationForm()
    parkings = ParkingMarker.objects.filter(onHomePage=True)#has to take parkings for homepage
    news_feed = HomePageNewsFeed.objects.all()
    context = {'getHomeParking':get_home_parking,'addressForm':address_form,'subscribeForm':subscribe_form,
               'parkings':parkings, 'newsFeed':news_feed, 'domain':get_current_site(request).domain}
    return render_to_response('home.html', context, context_instance=RequestContext(request))

def fast_choice_parkings(request):
    """
    renders the view when a parking from the quick bar (carousel) is selected
    on landing page (index.html)
    """
    subscribe_form = SubscribeForm()
    address_form = LocationForm()
    get_home_parking = GetHomeParking(request.POST)
    
    if get_home_parking.is_valid():
        parking_id = get_home_parking.cleaned_data['id']
        parkings = ParkingMarker.objects.filter(onHomePage=True);
        features = [ParkingFeatures.objects.get(id=parking.features_id) for parking in parkings]
        paymentMethods = [PaymentMethod.objects.get(id=parking.paymentMethod_id) for parking in parkings]
        chosen_parking = ParkingMarker.objects.get(id=parking_id)
        lat = chosen_parking.lat
        lng = chosen_parking.lng
        address = chosen_parking.address;
        context = {'addressForm':address_form,'subscribeForm':subscribe_form,'parkings':parkings,
                   'chosenParking':chosen_parking,'features':features, 'paymentMethods':paymentMethods,
                            'address':address, 'lat':lat, 'lng':lng, 'domain':Site.objects.get_current().domain}
        return render_to_response('findparking.html', context, context_instance=RequestContext(request))
    else:
        subscribe_form = SubscribeForm();
        address_form = LocationForm()
        get_home_parking = GetHomeParking()
        parkings = ParkingMarker.objects.filter(onHomePage=True);#has to take parkings for homepage
        news_feed = HomePageNewsFeed.objects.all()
        context = {'getHomeParking':get_home_parking,'addressFrom':address_form,'subscribeForm':subscribe_form,
                   'parkings':parkings,'newsFeed':news_feed, 'domain':Site.objects.get_current().domain}
        return render_to_response('home.html', context, context_instance=RequestContext(request))

def subscribe_user(request):
    """
    renders the view when user is subscribing by email
    on landing page (index.html)
    """
    subscribe_form = SubscribeForm(request.POST)
    address_form = LocationForm()
    get_home_parking = GetHomeParking()
    try:
        if subscribe_form.is_valid():
            email = subscribe_form.cleaned_data['email']
            is_parkingowner = subscribe_form.cleaned_data['is_parkingowner']
            if is_parkingowner == True:
                to_add = ParkingOwner.objects.create(email = email)
                to_add.save()
                        #ParkingOwner.objects.
                        #ParkingOwner.save()
                        #send email
            else:
                to_add = Viewer.objects.create(email = email)
                to_add.save()
                        #send email
            parkings = ParkingMarker.objects.filter(onHomePage=True);#has to take parkings for homepage
            news_feed = HomePageNewsFeed.objects.all();
            context = {'message':"Благодарим Ви!",'openSubscribe':"openAndRefresh",'getHomeParking':get_home_parking,
                        'addressForm':address_form,'subscribeForm':subscribe_form,'parkings':parkings,'newsFeed':news_feed,
                         'domain':Site.objects.get_current().domain}
            return render_to_response('home.html', context, context_instance=RequestContext(request))
        else:
            parkings = ParkingMarker.objects.filter(onHomePage=True)#has to take parkings for homepage
            news_feed = HomePageNewsFeed.objects.all();
            context = {'message':"Въведете валиден адрес!",'openSubscribe':"shouldOpen",'getHomeParking':get_home_parking,
                       'addressForm':address_form,'subscribeForm':subscribe_form,'parkings':parkings,'newsFeed':news_feed,
                        'domain':Site.objects.get_current().domain}
            return render_to_response('home.html', context, context_instance=RequestContext(request))
    except IntegrityError:
        parkings = ParkingMarker.objects.filter(onHomePage=True);#has to take parkings for homepage
        news_feed = HomePageNewsFeed.objects.all()
        context = {'message':"Адресът вече е въведен!",'openSubscribe':"shouldOpen",'getHomeParking':get_home_parking,
                   'addressForm':address_form,'subscribeForm':subscribe_form,'parkings':parkings,'newsFeed':news_feed,
                    'domain':Site.objects.get_current().domain}
        return render_to_response('home.html', context, context_instance=RequestContext(request))

def search_for_location(request):
    """
    handles the request for a particular location from the seach bar
    """
    subscribe_form = SubscribeForm()   
    getHomeParking = GetHomeParking()
    address_form = LocationForm(request.POST)
    
    if address_form.is_valid():
        latAddress = address_form.cleaned_data['lat']
        lngAddress = address_form.cleaned_data['lng']
        address = address_form.cleaned_data['address']
        parkings = [parking for parking in ParkingMarker.objects.all()
                             if distance([parking.lat, parking.lng], [latAddress, lngAddress]) < 1]
        features = [ParkingFeatures.objects.get(id=parking.features_id) for parking in parkings]
        payment_methods = [PaymentMethod.objects.get(id=parking.paymentMethod_id) for parking in parkings];
        context = {'addressForm':address_form,'subscribeForm':subscribe_form, 'parkings':parkings, 'features':features,
                            'paymentMethods':payment_methods, 'address':address, 'lat':latAddress, 'lng':lngAddress,
                             'domain':Site.objects.get_current().domain}
        return render_to_response('findparking.html', context , context_instance=RequestContext(request))
    else:
        parkings = ParkingMarker.objects.all()#has to take parkings for homepage
        news_feed = HomePageNewsFeed.objects.all()
        return render_to_response('home.html',
                                  {'getHomeParking':getHomeParking,'addressForm':address_form,
                                   'subscribeForm':subscribe_form, 'parkings':parkings,'newsFeed':news_feed,
                                    'domain':Site.objects.get_current().domain},
                                    context_instance=RequestContext(request))

def distance(origin, destination):
    """
    function that calculates and returns the distance between two points
    where each point has two values - latitude and longitude
    """
    lat1, lon1 = origin
    lat2, lon2 = destination
    radius = 6371  # km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    d = radius * c

    return d
