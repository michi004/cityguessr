var map = L.map('map').setView([51.1657, 10.4515], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

class City {
    constructor(name, population, latlng) {
        this.name = name;
        this.population = population;
        this.latlng = latlng;
      }
}

let cities = [];
let wrongGuesses = 0; // Counter für falsche Versuche
let currentCity = cities[Math.floor(Math.random() * cities.length)];
document.getElementById("curCity").innerHTML = currentCity.name;

function readValue() {
    let number =  document.getElementById('numberInput');

    const select = document.querySelector('.select');
    const selectedValue = select.options[select.selectedIndex].value;
    
    //delete button
    const element = document.getElementById('dropDownCountrySelect');
    if (element) {
        element.remove();
    }

    //create List of cities
    fetch('sorted_cities.csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n');
        const countryRows = rows.filter(row => row.split(',')[6] == selectedValue).slice(0, parseFloat(number.value));
        const citiesData = countryRows.map(row => {
            const [name, , lat, lng, , , , , , population] = row.split(',');
            return new City(name, population, {lat: parseFloat(lat), lng: parseFloat(lng)});
        });

        currentCity = citiesData[Math.floor(Math.random() * cities.length)];
        document.getElementById("curCity").innerHTML = currentCity.name;
        filterCitiesWithin10km(citiesData);
        generateCities(citiesData);
    });
}


function distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius der Erde in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Entfernung in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function filterCitiesWithin10km(cities) {
    for (let i = 0; i < cities.length - 1; i++) {
        for (let j = i + 1; j < cities.length; j++) {
            const city1 = cities[i];
            const city2 = cities[j];
            console.log(city1.name, city2.name);
            const d = distance(
                city1.latlng.lat,
                city1.latlng.lng,
                city2.latlng.lat,
                city2.latlng.lng
            );
            //cut the cities from the list
            if (d < 10) {
                cities.splice(j, 1);
                j--;
            }
        }
    }
    return cities;
}

//city guess game loop
function generateCities(cities){
    for (let i = 0; i < cities.length; i++) {
        let c = cities[i];
        let marker = L.marker(c.latlng).addTo(map);
        marker.on('click', function(e) {
            if (c.name === currentCity.name) {
                console.log("Richtig!");
                cities.splice(cities.indexOf(currentCity), 1);
                map.removeLayer(marker);
                wrongGuesses = 0; // Reset the wrong guesses
                if (cities.length != 0){
                    currentCity = cities[Math.floor(Math.random() * cities.length)];
                    document.getElementById("curCity").innerHTML = currentCity.name;
                } else {
                    //game ends
                    //restart
                    //select new country 
                }
            } else {
                wrongGuesses++;
                if (wrongGuesses >= 3) {
                    highlightCity(currentCity.latlng); // Gesuchte Stadt rot markieren
                }
            }
        });
    }
}

// Funktion, um die gesuchte Stadt rot zu markieren
function highlightCity(latlng) {
    L.circle(latlng, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 5000 // Radius in Metern
    }).addTo(map);
}
