function ajaxCall(lat, lng) {
	$.ajax({
		url : 'ajaxCall/' + lat + "/" + lng + "/",
		type : 'get', //this is the default though, you don't actually need to always mention it
		dataType : 'html',
		beforeSend : function() {
			$('#map').append("<img id='loadGif' style='position:absolute;margin:230px 0 0 330px;z-index:9000;' src='/static/imgs/ajax-loader.gif' />");
		},
		success : function(data) {
			$('#loadGif').remove();
			clearLocations();
			parkings = [];
			markers = [];
			parseAjaxParkings(data);
			displayFoundParkings(parkings);
			for (var i = 0, len = parkings.length; i < len; i++) {
				createMarker(parkings[i], i);
			}
			displayNumberOfFoundParkings(parkings);
		},
	});
}

function parseAjaxParkings(ajaxData) {
	var ajaxParkings = ajaxData.split('@');
	for (var i = 0, len = ajaxParkings.length; i < len; i++) {
		var parking = ajaxParkings[i].split('&');
		var currentParking = new Object();
		currentParking.id = parseInt(parking[0]);
		currentParking.name = parking[1];
		currentParking.address = parking[2];
		currentParking.lat = parseFloat(parking[3]);
		currentParking.lng = parseFloat(parking[4]);
		currentParking.distance = parseFloat(parking[5]);
		currentParking.image = parking[6];
		currentParking.capacity = parseFloat(parking[7]);
		currentParking.workFrom = parseFloat(parking[8]);
		currentParking.workTo = parseFloat(parking[9]);
		currentParking.pricePerHour = parseFloat(parking[10]);
		currentParking.paymentmethod = parseFloat(parking[11]);
		currentParking.features = parseFloat(parking[12]);
		// alert(currentParking.id+"/"+currentParking.name+"/"+currentParking.address+"/"+currentParking.lat+"/"+currentParking.lng+"/"+
		// currentParking.distance+"/"+currentParking.image+"/"+currentParking.capacity+"/"+currentParking.workFrom+"/"+currentParking.workTo+"/"+
		//  currentParking.pricePerHour+"/"+currentParking.paymentmethod+"/"+currentParking.features+"/");
		parkings.push(currentParking);
	};
}


$('#location').bind("keyup keypress", function(e) {
	var code = e.keyCode || e.which;
	if (code == 13) {
		e.preventDefault();
		return false;
	}
});
//hrome onenter event
$('#id_address').keydown(function(event) {
	var keypressed = event.keyCode || event.which;
	if (keypressed == 13) {
		getCoords();
	}
});

var map;
var markers = [];
var locationSelect;
var geocoder = new google.maps.Geocoder();
var ib;
var parkings = [];
var features = [];
var paymentMethods = [];
var allParkings = [];
var handlers = [];
var address;
var markerCenter;

// sorts parkings by price in ascending or descending order
function sortParkingsByPrice() {
	if (parkings.length > 0) {
		if (document.getElementById('price').className == "nonsorted" || document.getElementById('price').className == "descend") {
			allParkings = parkings;
			allParkings.sort(function(a, b) {
				return a.pricePerHour - b.pricePerHour;
			});
			document.getElementById('price').className = "ascend";
			filterParkingsAndDisplay(allParkings);
		} else {
			allParkings = parkings;
			allParkings.sort(function(a, b) {
				return b.pricePerHour - a.pricePerHour;
			});
			document.getElementById('price').className = "descend";
			filterParkingsAndDisplay(allParkings);
		}
	}
}

// sorts parkings by distance in ascending or descending order
function sortParkingsByDistance() {
	if (parkings.length > 0) {
		if (document.getElementById('distance').className == "nonsorted" || document.getElementById('distance').className == "descend") {
			allParkings = parkings;
			allParkings.sort(function(a, b) {
				return a.distance - b.distance;
			});
			document.getElementById('distance').className = "ascend";
			filterParkingsAndDisplay(allParkings);
		} else {
			allParkings = parkings;
			allParkings.sort(function(a, b) {
				return b.distance - a.distance;
			});
			document.getElementById('distance').className = "descend";
			filterParkingsAndDisplay(allParkings);
		}
	}
}

// event when filter image is clicked on, changes the image
function makeTick(self) {
	if (self.className == "ticked")
		self.className = "unticked";
	else
		self.className = "ticked";
	if (parkings.length > 0) {
		allParkings = parkings;
		filterParkingsAndDisplay(allParkings);
	}
}

// return the right feature object by given id and features list
function getFeature(featureId, features) {
	for (var i = 0; i < features.length; i++) {
		if (features[i].id == featureId)
			return features[i];
	};
}

// filters the parkings
function filterParkingsAndDisplay(allParkings) {
	if (document.getElementById('elcars').className == "ticked")//parking.features returns features.id
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).elCars == "True");
		});
	if (document.getElementById('security').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).security == "True");
		});
	if (document.getElementById('personnel').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).personnel == "True");
		});
	if (document.getElementById('suv').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).SUV == "True");
		});
	if (document.getElementById('indoor').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).indoor == "True");
		});
	if (document.getElementById('valet').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).valet == "True");
		});
	if (document.getElementById('carwash').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).carwash == "True");
		});
	if (document.getElementById('handicap').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).handicap == "True");
		});
	if (document.getElementById('discount').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).discount == "True");
		});
	if (document.getElementById('motor').className == "ticked")
		allParkings = allParkings.filter(function(parking) {
			return (getFeature(parking.features, features).motor == "True");
		});
	displayFoundParkings(allParkings);
	distinguishUnfilteredParkings(allParkings);
	displayNumberOfFoundParkings(allParkings);
}

// when being filtered parkings change their markers' image and content
// remove second part of (markers[i].labelContent != "<p>N/A</p>" && markers[i].labelContent != "") when filling all info
function distinguishUnfilteredParkings(parkings) {
	for (var i = 0, len = markers.length; i < len; i++) {
		var isNotParkings = true;

		for (var j = 0, lent = parkings.length; j < lent; j++) {
			if (markers[i].lat == parkings[j].lat) {
				isNotParkings = false;
				break;
			}
		}
		if (markers[i].labelContent != "<p>N/A</p>" && markers[i].labelContent != "") {
			if (isNotParkings) {
				if (handlers[i].isEmpty != null || handlers[i].isEmpty == undefined)
					google.maps.event.removeListener(handlers[i]);
				markers[i].icon = "/static/imgs/parkingPointerBlurred.png";
				markers[i].setMap(map);
				handlers[i].isEmpty = true;
			} else {
				if (handlers[i].isEmpty == true) {
					addClickListener(markers[i], i, getParking(markers[i].position.lat()));
					markers[i].icon = "/static/imgs/parkingPointer.png";
					markers[i].setMap(map);
					handlers[i].isEmpty = null;
				}
			}
		}
	}
}

// returns the right parking by given latitude
function getParking(lat) {
	for (var i = 0, len = parkings.length; i < len; i++) {
		if (lat == parkings[i].lat)
			return parkings[i];
	};
}

function clearFilteredParkings() {
	document.getElementById('filteredParkings').innerHTML = '';
}

// by given parking returns its equvalent marker
function getMarkerOfParking(parking) {
	for (var i = 0, len = markers.length; i < len; i++) {
		if (markers[i].position.lat() == parking.lat)
			return markers[i];
	};
}

// renders parking info on screen
// remove second part (checkIfParkingWorks(parkings[i]) && parkings[i].pricePerHour != 0)
function displayFoundParkings(parkings) {
	clearFilteredParkings();
	for (var i = 0, len = parkings.length; i < len; i++) {
		if (checkIfParkingWorks(parkings[i]) && parkings[i].pricePerHour != 0) {
			calcPrice(parkings[i]);
			var parkingDiv = document.createElement('div');
			parkingDiv.className = 'filteredParking';
			var image = "<img src='/media/" + parkings[i].image + "'" + " class='parkingImage'>";
			var parkingPrice = parkings[i].price;
			var parkingDistance = (Math.round(parkings[i].distance * 10) / 10).toFixed(1);
			if (parkingPrice < 10 && parkingDistance < 10) {
				var price = "<span class='price'>" + parkingPrice + "</span>";
				var distance = "<span class='distance' >" + parkingDistance + "</span>";
			} else {
				var price = "<span class='smallPrice'>" + parkingPrice + "</span>";
				var distance = "<span class='smallDistance' >" + parkingDistance + "</span>";
			}
			var currency = "<span class='currency'>лв</span>";
			var km = "<span class='km'>км</span>";
			parkingDiv.innerHTML = image + price + distance + currency + km;
			var address = document.createElement('p');
			address.className = 'address';
			address.innerHTML = parkings[i].address;
			var separator = document.createElement('div');
			separator.className = 'separator';
			document.getElementById("filteredParkings").appendChild(parkingDiv);
			document.getElementById("filteredParkings").appendChild(address);
			document.getElementById("filteredParkings").appendChild(separator);

			addOnclick(parkingDiv, i, parkings);
		}
	}

}

// add onclick event on parking
function addOnclick(parking, i, parkings) {
	parking.addEventListener('click', function() {
		showMarkerWindow(parkings[i], getMarkerOfParking(parkings[i]));
	}, false);
}

// retrievs all paymentMethods
function parsePaymentMethods(arr) {

	{% for method in paymentMethods %}
	var loadPMethod = new Object();
	loadPMethod.parkingmeter = "{{method.parkingmeter}}";
	loadPMethod.creditcard = "{{method.creditcard}}";
	loadPMethod.cash = "{{method.cash}}";
	arr.push(loadPMethod);
	{% endfor %}
}

// retrievs all Features
function parseFeatures(arr) {
	{% for feature in features %}
	var loadFeature = new Object();
	loadFeature.elCars = "{{feature.elCars}}";
	loadFeature.security = "{{feature.security}}";
	loadFeature.valet = "{{feature.valet}}";
	loadFeature.discount = "{{feature.discount}}";
	loadFeature.SUV = "{{feature.SUV}}";
	loadFeature.motor = "{{ feature.motor }}";
	loadFeature.carwash = "{{ feature.carwash }}";
	loadFeature.handicap = "{{ feature.handicap }}";
	loadFeature.personnel = "{{ feature.personnel }}";
	loadFeature.indoor = "{{ feature.indoor }}";
	loadFeature.id = "{{ feature.id }}";
	arr.push(loadFeature);
	{% endfor %}

}

// refresh all markers
function clearLocations() {
	ib.close();
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers.length = 0;
}

// executes on page onload
function load() {
	var input = (document.getElementById('id_address'));
	var searchBox = new google.maps.places.SearchBox((input));
	map = new google.maps.Map(document.getElementById("map"), {
		center : new google.maps.LatLng(42.7000, 23.3333),
		zoom : 4,
		mapTypeId : 'roadmap',
		mapTypeControlOptions : {
			style : google.maps.MapTypeControlStyle.DROPDOWN_MENU
		}
	});
	ib = new InfoBox();
	colorNavElement();
	if (document.getElementById('id_address').value == "")
		setDate();
	readOnly();
	checkForSubscribe();
	parseParkings(parkings);
	parseFeatures(features);
	parsePaymentMethods(paymentMethods);
	searchLocations();
	displayNumberOfFoundParkings(parkings);
	setFocus();
	google.maps.event.addListener(map, 'dragend', function() {
		ajaxCall(map.getCenter().lat(), map.getCenter().lng());
		markerCenter.setMap(null);
		markerCenter = new google.maps.Marker({
			map : map,
			draggable : true,
			position : new google.maps.LatLng(map.getCenter().lat(), map.getCenter().lng())
		});
		google.maps.event.addListener(markerCenter, 'dragend', function() {
			ajaxCall(markerCenter.position.lat(), markerCenter.position.lng());
			map.setCenter(new google.maps.LatLng(markerCenter.position.lat(), markerCenter.position.lng()));
		});
	});
}

// get address latitude and longitude or precalculates the parking prices
function getCoords() {
	if (!checkForProperTimeDuration()) {
		alert("Часът на излизане не може да предхожда часа на влизане, а престоят е минимум за 1 час!");
	} else {

		address = document.getElementById("id_address").value;

		geocoder.geocode({
			address : address
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				document.getElementById('id_lat').value = results[0].geometry.location.lat();
				document.getElementById('id_lng').value = results[0].geometry.location.lng();
				document.getElementById('submitButton').click();
			}
		});

	}
}

// defines if there is a place that matches the address
function searchLocations() {
	if ("{{chosenParking}}" != "") {
		searchLocationsNear();
		return;
	} else if ("{{defaultSofia}}" == "defaultSofia") {
		searchLocationsNear();
		return;
	} else {
		address = document.getElementById('id_address').value;
	}

	geocoder.geocode({
		address : address
	}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			searchLocationsNear();
		} else {
			map.setZoom(12);
		}
	});

}

// finds locations near the address
function searchLocationsNear() {
	if (parkings.length != 0)
		clearLocations();
	displayFoundParkings(parkings);
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0, len = parkings.length; i < len; i++) {
		createMarker(parkings[i], i);
		bounds.extend(new google.maps.LatLng(parseFloat(parkings[i].lat), parseFloat(parkings[i].lng)));
	}
	if ("{{chosenParking}}" == "") {
		lat = "{{lat}}";
		lng = "{{lng}}";
		map.setCenter(new google.maps.LatLng(lat, lng));
	} else {
		lat = "{{chosenParking.lat}}";
		lng = "{{chosenParking.lng}}";
		map.setCenter(new google.maps.LatLng(lat, lng));
	}

	markerCenter = new google.maps.Marker({
		map : map,
		draggable : true,
		position : new google.maps.LatLng(lat, lng)
	});
	displayNumberOfFoundParkings(parkings);
	map.setZoom(16);

	if ("{{chosenParking}}" != "")
		triggerWindowForChosenParking("{{chosenParking.lat}}", "{{chosenParking.lng}}");
}

//remove last else and previous else-if -> only else when filling all info
function triggerWindowForChosenParking(lat, lng) {
	for (var i = 0, len = parkings.length; i < len; i++) {
		if (lat == parkings[i].lat) {
			if (markers[i].icon == "/static/imgs/parkingPointer.png" || markers[i].icon == "/static/imgs/parkingPointerBlurred.png") {
				showMarkerWindow(parkings[i], markers[i]);
				break;
			} else if (markers[i].icon == "/static/imgs/parkingPointerBlurredNA.png") {
				showMarkerWindowNA(parkings[i], markers[i]);
				break;
			} else {
				showMarkerWindowNoInfo(parkings[i], markers[i]);
				break;
			}
		}
	};
}

// get the length of parkings that are active
function getParkingsLength() {
	var number = 0;
	for (var i = 0, len = markers.length; i < len; i++) {
		if (markers[i].icon == "/static/imgs/parkingPointer.png")
			number++;
	}
	return number;
}

// renders parking length
function displayNumberOfFoundParkings(parkings) {
	document.getElementById('numberOfParkings').innerHTML = '';
	var length = getParkingsLength();
	if (length == 1)
		var number = "<div>" + "<span style='color:rgb(27,162,217);font-size:18px'>" + length + "</span>" + " паркинг" + "</div>";
	else
		var number = "<div>" + "<span style='color:rgb(27,162,217);font-size:18px'>" + length + "</span>" + " паркинга" + "</div>";
	document.getElementById('numberOfParkings').innerHTML = number;
}

// returns payment method on given id and methods list
function getPaymentMethod(methodId, methods) {
	for (var i = 0, len = methods.length; i < len; i++) {
		if (methods[i].id == methodId)
			return methods[i];
	};
}

// selects proper font-size for rendering price info
function checkPriceSize(price) {
	if (price < 100)
		return "<div style='float:left;width:130px;'><span id='windowPrice'>Цена</span><span id='lv'>лв</span><span id='displayedPrice'>" + price + " </span></div>";
	else
		return "<div style='float:left;width:130px;'><span id='windowPrice'>Цена</span><span id='lv'>лв</span><span id='displayedSmallPrice'>" + price + " </span></div>";
}

// selects proper font-size for rendering distance info
function checkDistanceSize(distance) {
	if (distance < 100)
		return "<div style='float:left;width:130px;'><span id='windowDistance'>Разст</span><span id='windowKm'>км</span><span id='displayedDistance'>" + distance + "</span></div>";
	else
		return "<div style='float:left;width:130px;'><span id='windowDistance'>Разст</span><span id='windowKm'>км</span><span id='displayedSmallDistance'>" + distance + "</span></div>";
}

// selects proper font-size for rendering address info
function checkAddressSize(address) {
	if (address.length < 65)
		return "<div style='width:230px;'><div id='windowAddress'>" + address + "</div></div>";
	else
		return "<div style='width:230px;'><div id='windowSmallAddress'>" + address + "</div></div>";
}

// checks if parking works during the selected time frame
function checkIfParkingWorks(parking) {
	var fromHour = parseInt(document.getElementById('id_fromHour').value);
	var toHour = parseInt(document.getElementById('id_toHour').value);
	var fromPeriod = parseInt(document.getElementById('id_fromPeriod').value);
	var toPeriod = parseInt(document.getElementById('id_toPeriod').value);

	var arrival = fromHour + (fromPeriod / 100);
	var departure = toHour + (toPeriod / 100);

	if (arrival >= (parseFloat(parking.workFrom)).toFixed(2) && arrival <= (parseFloat(parking.workTo)).toFixed(2) && departure <= (parseFloat(parking.workTo)).toFixed(2) && departure >= (parseFloat(parking.workFrom)).toFixed(2))
		return true;
	return false;
}

// create marker on map and there are two types, one for active parkings and one for those that do not work
// during the selected hours
function createMarker(parking, i) {
	if (parking.pricePerHour != 0) {
		if (checkIfParkingWorks(parking)) {
			calcPrice(parking);
			var marker = new MarkerWithLabel({
				position : new google.maps.LatLng(parseFloat(parking.lat), parseFloat(parking.lng)),
				draggable : false,
				map : map,
				labelVisible : true,
				icon : "/static/imgs/parkingPointer.png",
				labelContent : "<p>" + parking.price + " " + "<span class='spanlv'>лв</span>" + "</p>",
				labelAnchor : new google.maps.Point(30, 33),
				labelClass : "labels", // the CSS class for the label
			});
			marker.lat = parking.lat;
			addClickListener(marker, i, parking);
			markers.push(marker);
		} else {
			var marker = new MarkerWithLabel({
				position : new google.maps.LatLng(parseFloat(parking.lat), parseFloat(parking.lng)),
				draggable : false,
				map : map,
				labelVisible : true,
				icon : "/static/imgs/parkingPointerBlurredNA.png",
				labelContent : "<p>N/A</p>",
				labelAnchor : new google.maps.Point(30, 33),
				labelClass : "labels", // the CSS class for the label
			});
			marker.lat = parking.lat;
			addClickListener(marker, i, parking);
			markers.push(marker);
		}
	} else {
		var marker = new MarkerWithLabel({
			position : new google.maps.LatLng(parseFloat(parking.lat), parseFloat(parking.lng)),
			draggable : false,
			map : map,
			labelVisible : true,
			icon : "/static/imgs/parkingPointerNoInfo.png",
			labelContent : "",
			labelAnchor : new google.maps.Point(30, 33),
			labelClass : "labels", // the CSS class for the label
		});
		marker.lat = parking.lat;
		addClickListener(marker, i, parking);
		markers.push(marker);
	}
}

// add proper onclick events depending on active or nonactive parking
function addClickListener(marker, i, parking) {
	if (marker.icon == "/static/imgs/parkingPointer.png" || marker.icon == "/static/imgs/parkingPointerBlurred.png")
		handlers[i] = google.maps.event.addListener(marker, 'click', function() {
			showMarkerWindow(parking, marker);
		});
	else if (marker.icon == "/static/imgs/parkingPointerBlurredNA.png")
		handlers[i] = google.maps.event.addListener(marker, 'click', function() {
			showMarkerWindowNA(parking, marker);
		});
	else
		handlers[i] = google.maps.event.addListener(marker, 'click', function() {
			showMarkerWindowNoInfo(parking, marker);
		});
}

// calculating price for the selected time frame
function calcPrice(parking) {
	var fromHour = parseInt(document.getElementById('id_fromHour').value);
	var toHour = parseInt(document.getElementById('id_toHour').value);
	var fromPeriod = parseInt(document.getElementById('id_fromPeriod').value);
	var toPeriod = parseInt(document.getElementById('id_toPeriod').value);

	var dateFrom = document.getElementById('id_fromDate').value.split('/');
	var monthFrom = parseInt(dateFrom[0]) - 1;
	var dayFrom = parseInt(dateFrom[1]);
	var yearFrom = parseInt(dateFrom[2]);

	var dateTo = document.getElementById('id_toDate').value.split('/');
	var monthTo = parseInt(dateTo[0]) - 1;
	var dayTo = parseInt(dateTo[1]);
	var yearTo = parseInt(dateTo[2]);

	starttime = (new Date(yearFrom, monthFrom, dayFrom, fromHour, fromPeriod, 0)).getTime();
	endtime = (new Date(yearTo, monthTo, dayTo, toHour, toPeriod, 0)).getTime();

	var time = parseInt(((endtime - starttime ) / 3600000));
	if (Math.abs(((endtime / 3600000) - (starttime / 3600000))) % 1 != 0)
		time++;
	parking.price = (parking.pricePerHour * time).toFixed(1);
}

// used to precalculate prices when there is new time frame on the same address
/*
function preCalculatePrices() {
clearLocations();
for (var i = 0, len = parkings.length; i < len; i++) {
createMarker(parkings[i], i);
};
displayFoundParkings(parkings);
displayNumberOfFoundParkings(parkings);
}*/

// add proper values to latitude to fit the map depending on the zoom level
function getDistance(zoom) {
	switch (zoom) {
		case 5:
			return 1.5;
		case 6:
			return 0.9;
		case 7:
			return 0.5;
		case 8:
			return 0.3;
		case 9:
			return 0.2;
		case 10:
			return 0.1;
		case 11:
			return 0.05;
		case 12:
			return 0.02;
		case 13:
			return 0.01;
		case 14:
			return 0.006;
		case 15:
			return 0.0026;
		case 16:
			return 0.0015;
		case 17:
			return 0.0007;
		case 18:
			return 0.00032;
		case 19:
			return 0.00018;
		case 20:
			return 0.00009;
		case 21:
			return 0.000045;
	}
}

function hasCapacity(capacity) {
	if (capacity > 0)
		return capacity;
	else
		return "--";
}

// information window for active parkings that is shown on clicking a marker
//<span id='displayedPercentage'>" + "--" + "</span> needs api + formula to calculate percentage
function showMarkerWindow(parking, marker) {
	var html = checkAddressSize(parking.address) + "<div id='imgAndPrice'><img class='windowImage' src='/media/" + parking.image + "' style='float:left;'>" + checkPriceSize(parking.price) + checkDistanceSize((Math.round(parking.distance * 10) / 10).toFixed(1)) + "<div style='float:left;width:130px;'><span id='windowCapacity'>Места</span>" + "<span id='displayedCapacity'>" + hasCapacity(parking.capacity) + "</span></div>" + "</div style='float:left;'>" + "<div style='float:left;width:260px;'><span id='workHours'>Работно време</span><span id='displayedHours'>" + (parseFloat(parking.workFrom)).toFixed(2) + " - " + (parseFloat(parking.workTo)).toFixed(2) + "</span></div>" + "<div style='float:left;width:260px;'><span id='capacityPercentage'>Свободни места</span><span id='displayedPercentage'>" + "--" + "</span></div>" + //shte e procent
	"<div style='float:left;width:260px;'><span id='paymentMethod'>Онлайн плащане</span><span id='displayedMethod'>" + getPaymentMethod(parking.paymentMethod, paymentMethods).creditcard + "</span></div>";
	map.setCenter(new google.maps.LatLng(parking.lat + getDistance(map.zoom), parking.lng));
	var boxText = document.createElement("div");
	boxText.style.cssText = "background: url('/static/imgs/infoSheet.png') no-repeat;width:271px;height:242px;position:relative;top:-275px;left:80px;";
	boxText.innerHTML = html;
	var myOptions = {
		content : boxText,
		disableAutoPan : false,
		maxWidth : 0,
		pixelOffset : new google.maps.Size(-140, 0),
		zIndex : null,
		boxStyle : {
			height : "0px",
			width : "0px",
		},
		closeBoxMargin : "-270px -345px 2px 2px",
		closeBoxURL : "/static/imgs/close.png",
		infoBoxClearance : new google.maps.Size(1, 1),
		isHidden : false,
		pane : "floatPane",
		enableEventPropagation : false
	};
	ib.setOptions(myOptions);
	ib.open(map, marker);
}

// information window for nonactive parkings that is shown on clicking a marker
function showMarkerWindowNA(parking, marker) {
	var html = "<div style='line-height:40px;margin:0 10px 0 10px;font-size:16px;'>Паркингът не работи през указаното от вас време!</div>";
	map.setCenter(new google.maps.LatLng(parking.lat + getDistance(map.zoom), parking.lng));
	var boxText = document.createElement("div");
	boxText.style.cssText = "background: url('/static/imgs/infoSheet.png') no-repeat;width:271px;height:242px;position:relative;top:-275px;left:80px;";
	boxText.innerHTML = html;
	var myOptions = {
		content : boxText,
		disableAutoPan : false,
		maxWidth : 0,
		pixelOffset : new google.maps.Size(-140, 0),
		zIndex : null,
		boxStyle : {
			height : "0px",
			width : "0px",
		},
		closeBoxMargin : "-270px -345px 2px 2px",
		closeBoxURL : "/static/imgs/close.png",
		infoBoxClearance : new google.maps.Size(1, 1),
		isHidden : false,
		pane : "floatPane",
		enableEventPropagation : false
	};
	ib.setOptions(myOptions);
	ib.open(map, marker);
}

// remove after filling info
function showMarkerWindowNoInfo(parking, marker) {
	var html = "<div style='font-size:16px;margin:0 10px 0 10px;line-height:40px'>Адрес: " + parking.address + "</div><div style='line-height:40px;margin:0 10px 0 10px;font-size:16px;'>Предстои да добавим допълнително информация!</div>";
	map.setCenter(new google.maps.LatLng(parking.lat + getDistance(map.zoom), parking.lng));
	var boxText = document.createElement("div");
	boxText.style.cssText = "background: url('/static/imgs/infoSheet.png') no-repeat;width:271px;height:242px;position:relative;top:-260px;left:80px;";
	boxText.innerHTML = html;
	var myOptions = {
		content : boxText,
		disableAutoPan : false,
		maxWidth : 0,
		pixelOffset : new google.maps.Size(-140, 0),
		zIndex : null,
		boxStyle : {
			height : "0px",
			width : "0px",
		},
		closeBoxMargin : "-255px -345px 2px 2px",
		closeBoxURL : "/static/imgs/close.png",
		infoBoxClearance : new google.maps.Size(1, 1),
		isHidden : false,
		pane : "floatPane",
		enableEventPropagation : false
	};
	ib.setOptions(myOptions);
	ib.open(map, marker);
}

window.onload = load();
