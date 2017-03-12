
//initialize google map and add a marker showing location
function initMap() {
	var mapCenter = {lat: 40.805, lng: -73.965};
	var map = new google.maps.Map(document.getElementById('map'), {
		center: mapCenter,
		zoom: 12
	});
	var marker = new google.maps.Marker({
		position: mapCenter,
		map: map
	});
	var placeId = getPlaceId(mapCenter);
}

//use Google Places API to get restaurant's hours

function getPlaceId(mapCenter) {
	var placesKey = "AIzaSyDalFLB-OppwlIfavQl4BP1ofutoheImEo";
	var placesURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + mapCenter.lat + "," + mapCenter.lng + "&radius=100&type=restaurant&key=" + placesKey;
	$.get(placesURL, function(searchResult) {
		console.log(searchResult.placeId);
	});
}

//configure and initialize Firebase
 var config = {
    apiKey: "AIzaSyDy1g81QkpfZXgftjirh7HCom6ndRg_MD8",
    authDomain: "reservation-site-ce4c5.firebaseapp.com",
    databaseURL: "https://reservation-site-ce4c5.firebaseio.com",
    storageBucket: "reservation-site-ce4c5.appspot.com",
    messagingSenderId: "597068067688"
};
 
firebase.initializeApp(config);

var database = firebase.database();

//when a user submits form, check if data is valid, if yes, add to reservation list
$('form').on('submit', function(e) {
	e.preventDefault();
	var userName = $('#userName').val();
	var userDate = $('#resDate').val();
	if (validate(userName, userDate)) {
		$('#userName').val('').removeClass('error');
		$('#resDate').val('').removeClass('error');
		$('#error').remove();
		var reservationsRef = database.ref('reservations');
		reservationsRef.push({
			name: userName,
			date: userDate
		});
	} else {
		$('#userName').addClass('error');
		$('#resDate').addClass('error');
		$('#make-reservation').append('<p id="error">Please enter a valid name and date</p>');
	}
});

//when a user clicks on the trash can icon, delete the reservation on that line
$('#reservations').on('click', '.fa-trash-o', function(e) {
	e.preventDefault();
	var id = $(e.target).closest('tr').attr('id');
	var reservationId = database.ref('reservations/' + id);
	reservationId.remove();

});

database.ref('reservations').on("value", function(results) {
	var allReservations = results.val();
	var reservations = [];
	for (var item in allReservations) {
		var context = {
			name: allReservations[item].name,
			date: allReservations[item].date,
			reservationId: item
		};
		//get HTML from handlebars reservation template
		var source = $('#reservation-template').html();
		//compile handlebars template
		var template = Handlebars.compile(source);
		//pass data for this reservation (context) into the template
		var reservationElement = template(context);
		//push newly created element to array of reservations
		reservations.push(reservationElement);
	}
	//remove all reservations from DOM before appending items
	$('#reservationsList').empty();
	//append each reservation to the table of reservations in the DOM
	for (var i in reservations) {
		$('#reservationsList').append(reservations[i]);
	}

	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
	}
);


//function that verifies that valid data is entered. Returns true or false.
function validate(userName, date) {
	console.log('invoked');
	console.log('user: ' + userName.length + " Date: " + date.length);
	if (userName.length > 0 && date.length > 0) {
		return true;
	} else {
		return false;
	}
}

//set minimum date as today's date
function minDate() {
	var today = new Date().toISOString().split('T')[0];
	document.getElementById('resDate').setAttribute('min', today);
	document.getElementById('resDate').setAttribute('value', today);
}

minDate();
