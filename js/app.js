initialLoc = [{
        title: 'Gotham Bar and Grill',
        location: {
            lat: 40.734207,
            lng: -73.993699
        }
    },
    {
        title: 'Le Bernardin',
        location: {
            lat: 40.7615691,
            lng: -73.9839935
        }
    },
    {
        title: 'Jean-Georges',
        location: {
            lat: 40.7690691,
            lng: -73.9837488
        }
    },
    {
        title: 'Aquagrill',
        location: {
            lat: 40.7253464,
            lng: -74.0038696
        }
    },
    {
        title: 'Bouley',
        location: {
            lat: 40.716969,
            lng: -74.008958
        }
    },
    {
        title: 'Gramercy Tavern',
        location: {
            lat: 40.7384555,
            lng: -73.9906951
        }
    }
];

var map;

var Location = function(data) {
    var self = this;

    this.title = data.title;
    this.location = data.location;
    this.lat = data.location.lat;
    this.long = data.location.lng;

    // locations are visible by default
    this.visible = ko.observable(true);

    this.largeInfowindow = new google.maps.InfoWindow({maxWidth: 265});

    // Wikipedia AJAX request goes here
    var wikiUrl = 'http://en.Wikipedia.org/w/api.php?action=opensearch&search=' + self.title + '&format=json&callback=wikiCallback'

    var wikiRequestTimeout = setTimeout(function() {
        $wikiElem.text("failed to get wikipedia resources");
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
    }).done(function(response) {
        // fetching response and storing relevant data in variables
        self.article = response[2][0];
        self.alink = response[3][0];

        self.contentString = '<div class="info-window-content"><div class="title"><b>' + self.title + "</b></div>" +
            '<div class="content">' + self.article + "</div>" +
            '<div class="content"><a href="' + self.alink + '">' + self.alink + "</a></div>";

        // setting content of infoWindow
        self.largeInfowindow.setContent(self.contentString);

        clearTimeout(wikiRequestTimeout);
    });

    // new marker for location
    this.marker = new google.maps.Marker({
        map: map,
        position: self.location,
        title: self.title,
        animation: google.maps.Animation.DROP
    });

    // animation and opens infowindow on click
    this.marker.addListener('click', function() {
        self.togglebounce(this);
        self.populateInfoWindow(this, self.largeInfowindow);
    });

    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    // toggle bounce marker when clicked
    this.togglebounce = function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            // added timeout for bounce
            setTimeout(function() { marker.setAnimation(null); }, 750);
        }
    };

    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

            // Open the infowindow on the correct marker.
            infowindow.open(map, marker);
        }
    };

    this.animate = function(loc) {
        google.maps.event.trigger(self.marker, 'click');
    };

};

var ViewModel = function() {
    var self = this;

    // user query
    this.search = ko.observable("");

    // observable array containing Location Objects
    this.locList = ko.observableArray([]);

    initialLoc.forEach(function(locItem) {
        self.locList.push(new Location(locItem));
    });

    // filtering list
    this.filteredList = ko.computed(function() {
        var filter = self.search().toLowerCase();
        if (!filter) {
            self.locList().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locList();
        } else {
            return ko.utils.arrayFilter(self.locList(), function(locationItem) {
                var string = locationItem.title.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

};

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13
    });

};

function errorHandling() {
    alert("Google Maps has failed to load. Please try again later.");
}

function startApp() {
    initMap();
    ko.applyBindings(new ViewModel());
}