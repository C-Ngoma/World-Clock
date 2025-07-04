document.addEventListener('DOMContentLoaded', function() {
    // Default cities
    const defaultCities = [
        { name: "San Francisco", timezone: "America/Los_Angeles" },
        { name: "London", timezone: "Europe/London" },
        { name: "Tokyo", timezone: "Asia/Tokyo" },
        { name: "Berlin", timezone: "Europe/Berlin" }
    ];

    let cities = JSON.parse(localStorage.getItem('worldClockCities')) || defaultCities;
    let is24HourFormat = false;
    let isNightMode = false;

    // Initialize the clock
    function initClock() {
        renderAllClocks();
        setInterval(renderAllClocks, 1000);

        // Load settings from localStorage
        is24HourFormat = localStorage.getItem('timeFormat') === '24';
        isNightMode = localStorage.getItem('nightMode') === 'true';
        
        if (isNightMode) {
            document.body.classList.add('night-mode');
        }

        // Setup event listeners
        document.getElementById('toggleFormat').addEventListener('click', toggleTimeFormat);
        document.getElementById('toggleMode').addEventListener('click', toggleNightMode);
        document.getElementById('addCity').addEventListener('click', addNewCity);
    }

    // Render all clock cards
    function renderAllClocks() {
        const container = document.getElementById('clockContainer');
        container.innerHTML = '';

        cities.forEach(city => {
            const card = createClockCard(city);
            container.appendChild(card);
        });
    }

    // Create a single clock card
    function createClockCard(city) {
        const now = new Date();
        const options = { 
            timeZone: city.timezone,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: !is24HourFormat
        };
        
        const dateTimeStr = now.toLocaleString('en-US', options);
        const [dateStr, timeStr] = dateTimeStr.split(', ');
        const [time, ampm] = timeStr.split(' ');

        const card = document.createElement('div');
        card.className = 'clock-card';
        
        // Determine if it's day or night in this city
        const hours = now.toLocaleString('en-US', { 
            timeZone: city.timezone, 
            hour: 'numeric', 
            hour12: false 
        });
        const isNight = hours < 6 || hours >= 18;
        if (isNight) card.classList.add('night');

        card.innerHTML = `
            <div class="city-name">${city.name}</div>
            <div class="date">${dateStr}</div>
            <div class="time">${time}${!is24HourFormat ? `<span class="ampm">${ampm}</span>` : ''}</div>
            <div class="day-night-indicator"></div>
            <div class="weather">
                <span class="weather-icon">☀️</span>
                <span class="weather-temp">72°F</span>
            </div>
            <button class="delete-btn" data-city="${city.name}">×</button>
        `;

        // Add delete functionality
        card.querySelector('.delete-btn').addEventListener('click', function() {
            removeCity(city.name);
        });

        return card;
    }

    // Toggle between 12 and 24 hour format
    function toggleTimeFormat() {
        is24HourFormat = !is24HourFormat;
        localStorage.setItem('timeFormat', is24HourFormat ? '24' : '12');
        renderAllClocks();
    }

    // Toggle night mode
    function toggleNightMode() {
        isNightMode = !isNightMode;
        document.body.classList.toggle('night-mode');
        localStorage.setItem('nightMode', isNightMode);
    }

    // Add a new city
    function addNewCity() {
        const select = document.getElementById('citySelect');
        const cityName = select.value;
        
        if (!cityName) return;

        const timezones = {
            'New York': 'America/New_York',
            'London': 'Europe/London',
            'Tokyo': 'Asia/Tokyo',
            'Berlin': 'Europe/Berlin',
            'Sydney': 'Australia/Sydney',
            'Dubai': 'Asia/Dubai',
            'San Francisco': 'America/Los_Angeles'
        };

        if (!cities.some(city => city.name === cityName)) {
            cities.push({
                name: cityName,
                timezone: timezones[cityName]
            });
            saveCities();
            renderAllClocks();
        }
    }

    // Remove a city
    function removeCity(cityName) {
        cities = cities.filter(city => city.name !== cityName);
        saveCities();
        renderAllClocks();
    }

    // Save cities to localStorage
    function saveCities() {
        localStorage.setItem('worldClockCities', JSON.stringify(cities));
    }

    // Initialize the clock
    initClock();
});