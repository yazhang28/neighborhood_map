initialLoc = [{
        title: 'Daniel',
        location: {
            lat: 40.7667738,
            lng: -73.9697909
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
        title: 'Blue Hill',
        location: {
            lat: 40.7320465,
            lng: -74.0018572
        }
    },
    {
        title: 'Eleven Madison Park',
        location: {
            lat: 40.741726,
            lng: -73.9893617
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

    this.largeInfowindow = new google.maps.InfoWindow();

    // new marker for location
    this.marker = new google.maps.Marker({
        map: map,
        position: self.location,
        title: self.title,
        animation: google.maps.Animation.DROP
    });

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
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
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
        console.log(filter);
        console.log('bla')
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

function startApp() {
    initMap();
    ko.applyBindings(new ViewModel());
}