# -*- coding: utf-8 -*- 
from django.template import RequestContext
from django.shortcuts import render_to_response, HttpResponse
from home.forms import LocationForm, SubscribeForm
from home.models import Viewer, ParkingOwner
from FindParking.models import ParkingMarker, ParkingFeatures, PaymentMethod
from django.contrib.sites.models import Site
from home.views import distance
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from itertools import chain

def find_parking(request):  
    """
    function that take a request from the website
    and if request is GET then returns html with a form containing base values for 
    some fields: fromHour, toHour, fromPeriod, toPeriod;
    if POST then takes the latitude and longitude coordinates of the address that the user has written
    as well as the address, then make SQL requests for near parkings and their features
    finally returns html with selected parkings 
    """
    if request.method == 'GET':
        return load_map_with_parkings(request)
    else:
        if 'subsribeForm' in request.POST:
            return subscribe_user(request)
        elif 'addressForm' in request.POST:
            return search_for_location(request)

def load_map_with_parkings(request):
    """
    renders map with certain coordinates when /findparking gets hit
    loads parkings around that point(lat, lng)
    """
    subscribe_form = SubscribeForm()
    address_from = LocationForm()
    address_lat = 42.697838
    address_lng = 23.321669
    address = 'София'
    parkings = ParkingMarker.objects.filter(city__exact='София')
    features = [ParkingFeatures.objects.get(id=parking.features_id) for parking in parkings]
    payment_methods = [PaymentMethod.objects.get(id=parking.paymentMethod_id) for parking in parkings];
    context = {'addressForm':address_from,'subscribeForm':subscribe_form,'loadDefaultParkings':"defaultSofia",
               'parkings':parkings, 'features':features, 'paymentMethods':payment_methods,
                'address':address, 'lat':address_lat, 'lng':address_lng, 'domain':Site.objects.get_current().domain}
    return render_to_response('findparking.html', context, context_instance=RequestContext(request))

def subscribe_user(request):
    """
    renders view when user is subscibing by email
    """
    subscribe_form = SubscribeForm(request.POST);
    address_from = LocationForm()

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
            context = {'message':"Благодарим Ви!",'openSubscribe':"openAndRefresh", 'addressForm':address_from,
                       'subscribeForm':subscribe_form, 'domain':Site.objects.get_current().domain}
            return render_to_response('findparking.html', context, context_instance=RequestContext(request))
        context = {'message':"Въведете валиден адрес!",'openSubscribe':"shouldOpen",'addressForm':address_from,
                   'subscribeForm':subscribe_form, 'domain':Site.objects.get_current().domain}
        return render_to_response('findparking.html', context, context_instance=RequestContext(request))
    except IntegrityError:
        context = {'message':"Адресът вече е въведен!",'openSubscribe':"shouldOpen",'addressForm':address_from,
                   'subscribeForm':subscribe_form, 'domain':Site.objects.get_current().domain}
        return render_to_response('findparking.html', context, context_instance=RequestContext(request))

def search_for_location(request):
    """
    handles request from search bar when user looks for location
    """
    subscribe_form = SubscribeForm()
    address_form = LocationForm(request.POST)
    if address_form.is_valid():
        address_lat = address_form.cleaned_data['lat']
        address_lng = address_form.cleaned_data['lng']
        address = address_form.cleaned_data['address']
        parkings = [parking for parking in ParkingMarker.objects.all() if distance([parking.lat, parking.lng], [address_lat, address_lng]) < 1]
        features = [ParkingFeatures.objects.get(id=parking.features_id) for parking in parkings]
        payment_methods = [PaymentMethod.objects.get(id=parking.paymentMethod_id) for parking in parkings];
        context = {'addressForm':address_form,'subscribeForm':subscribe_form, 'parkings':parkings, 'features':features,
                    'paymentMethods':payment_methods,'address':address, 'lat':address_lat, 'lng':address_lng,
                     'domain':Site.objects.get_current().domain}
        return render_to_response('findparking.html', context , context_instance=RequestContext(request))
    else:
        return render_to_response('findparking.html', {'addressForm':address_form,'subscribeForm':subscribe_form,
                                 'domain':Site.objects.get_current().domain} , context_instance=RequestContext(request))

@csrf_exempt     
def ajax_call(request, latlng):
    lat = float(latlng.split('/')[0])
    lng = float(latlng.split('/')[1])
    parkings_as_string = [str(parking.id) +"&"+ str(parking.name) +"&"+ str(parking.address) +"&"+ 
                          str(parking.lat) +"&"+ str(parking.lng) +"&" +
                          str(distance([parking.lat, parking.lng], [lat, lng])) +"&"+ str(parking.image) +"&"+
                          str(parking.capacity) +"&"+ str(parking.workFrom) +"&"+ str(parking.workTo) +"&"+
                          str(parking.pricePerHour) +"&"+ str(parking.paymentMethod) +"&"+ str(parking.features) +"@"
                          for parking in ParkingMarker.objects.all()
                          if distance([parking.lat, parking.lng], [float(lat), float(lng)]) < 0.5]
    parkings_as_string.append("<>")
    features = [ParkingFeatures.objects.get(id=parking.features_id) for parking in ParkingMarker.objects.all()
                 if distance([parking.lat, parking.lng], [float(lat), float(lng)]) < 0.5]
    features_as_string = [str(feature.elCars) +"&"+ str(feature.security) +"&"+ str(feature.valet) +"&"+ str(feature.discount)
                           +"&"+ str(feature.SUV) +"&"+ str(feature.motor) +"&"+ str(feature.carwash) +"&"+ str(feature.handicap)
                           +"&"+ str(feature.personnel) +"&"+ str(feature.indoor) +"&"+ str(feature.id) + "@"
                           for feature in features]
    features_as_string.append("<>")
    payment_methods = [PaymentMethod.objects.get(id=parking.paymentMethod_id) for parking in ParkingMarker.objects.all()
                        if distance([parking.lat, parking.lng], [float(lat), float(lng)]) < 0.5];
    pmethods_as_string = [str(method.parkingmeter) +"&"+ str(method.creditcard) +"&"+ str(method.cash) + "@" for method in payment_methods]
    return HttpResponse(parkings_as_string + features_as_string + pmethods_as_string, content_type='text/plain')

@csrf_exempt     
def ajax_call2(request, latlng):
    if request.is_ajax():
        lat = float(latlng.split('/')[0])
        lng = float(latlng.split('/')[1])
        
        parkings = [parking for parking in ParkingMarker.objects.all()
                                if distance([parking.lat, parking.lng], [float(lat), float(lng)]) < 0.5]
        
        methods = [PaymentMethod.objects.get(id=parking.paymentMethod_id) for parking in ParkingMarker.objects.all() 
                                if distance([parking.lat, parking.lng], [float(lat), float(lng)]) < 0.5]
        
        features = [ParkingFeatures.objects.get(id=parking.features_id) for parking in ParkingMarker.objects.all() 
                                if distance([parking.lat, parking.lng], [float(lat), float(lng)]) < 0.5]
        
        combined = list(chain(parkings, methods, features))
        data = serializers.serialize("json", combined)
        return HttpResponse(data, content_type="application/json; charset=utf-8")
    else:
        return HttpResponse("Error", content_type="text/html; charset=utf-8")
















