document.addEventListener('DOMContentLoaded', function() {
    // City database with timezones
    const cityDatabase = {
        "San Francisco": "America/Los_Angeles",
        "London": "Europe/London",
        "Tokyo": "Asia/Tokyo",
        "Berlin": "Europe/Berlin",
        "New York": "America/New_York",
        "Sydney": "Australia/Sydney",
        "Dubai": "Asia/Dubai",
        "Paris": "Europe/Paris",
        "Moscow": "Europe/Moscow",
        "Beijing": "Asia/Shanghai"
    };

    // Initialize with default cities
    let cities = JSON.parse(localStorage.getItem('worldClockCities')) || [
        { name: "San Francisco", timezone: cityDatabase["San Francisco"] },
        { name: "London", timezone: cityDatabase["London"] },
        { name: "Tokyo", timezone: cityDatabase["Tokyo"] }
    ];

    let is24HourFormat = localStorage.getItem('timeFormat') === '24';
    let isNightMode = localStorage.getItem('nightMode') === 'true';

    // Initialize the clock
    function initClock() {
        updateClockDisplay();
        setInterval(updateClockDisplay, 1000);

        // Apply saved settings
        if (isNightMode) document.body.classList.add('night-mode');
        
        // Event listeners
        document.getElementById('toggleFormat').addEventListener('click', toggleTimeFormat);
        document.getElementById('toggleMode').addEventListener('click', toggleNightMode);
        document.getElementById('addCity').addEventListener('click', addNewCity);
        
        // Populate city dropdown
        const select = document.getElementById('citySelect');
        Object.keys(cityDatabase).forEach(city => {
            if (!cities.some(c => c.name === city)) {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                select.appendChild(option);
            }
        });
    }

    // Update all clock displays
    function updateClockDisplay() {
        const container = document.getElementById('clockContainer');
        container.innerHTML = '';
        
        cities.forEach(city => {
            const card = createClockCard(city);
            container.appendChild(card);
        });
    }

    // Create a clock card for a city
    function createClockCard(city) {
        const now = new Date();
        const cityTime = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));
        
        // Date formatting
        const dateOptions = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        const dateStr = cityTime.toLocaleDateString('en-US', dateOptions);
        
        // Time formatting
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !is24HourFormat
        };
        let timeStr = cityTime.toLocaleTimeString('en-US', timeOptions);
        
        // For 24-hour format, remove AM/PM and ensure leading zeros
        if (is24HourFormat) {
            timeStr = timeStr.replace(/ AM| PM/, '');
            if (timeStr.length === 7) { // Handle cases like "9:15" -> "09:15"
                timeStr = '0' + timeStr;
            }
        }

        // Determine if it's day or night (6am-6pm = day)
        const hours = cityTime.getHours();
        const isDayTime = hours >= 6 && hours < 18;
        const weatherIcon = isDayTime ? '☀️' : '🌙';
        const temp = getRandomTemp(city.name); // Simulated weather data

        const card = document.createElement('div');
        card.className = `clock-card ${isDayTime ? '' : 'night'}`;
        card.innerHTML = `
            <div class="city-name">${city.name}</div>
            <div class="date">${dateStr}</div>
            <div class="time">${timeStr}</div>
            <div class="day-night-indicator"></div>
            <div class="weather">
                <span class="weather-icon">${weatherIcon}</span>
                <span class="weather-temp">${temp}°F</span>
            </div>
            <button class="delete-btn" data-city="${city.name}">×</button>
        `;

        card.querySelector('.delete-btn').addEventListener('click', () => removeCity(city.name));
        return card;
    }

    // Helper function for simulated weather data
    function getRandomTemp(cityName) {
        const baseTemps = {
            "San Francisco": 65,
            "London": 55,
            "Tokyo": 60,
            "Berlin": 50,
            "New York": 60,
            "Sydney": 70,
            "Dubai": 85,
            "Paris": 55,
            "Moscow": 45,
            "Beijing": 58
        };
        return baseTemps[cityName] + Math.floor(Math.random() * 10) - 5;
    }

    function toggleTimeFormat() {
        is24HourFormat = !is24HourFormat;
        localStorage.setItem('timeFormat', is24HourFormat ? '24' : '12');
        updateClockDisplay();
    }

    function toggleNightMode() {
        isNightMode = !isNightMode;
        document.body.classList.toggle('night-mode');
        localStorage.setItem('nightMode', isNightMode);
    }

    function addNewCity() {
        const cityName = document.getElementById('citySelect').value;
        if (cityName && cityDatabase[cityName] && !cities.some(c => c.name === cityName)) {
            cities.push({
                name: cityName,
                timezone: cityDatabase[cityName]
            });
            saveCities();
            updateClockDisplay();
        }
    }

    function removeCity(cityName) {
        cities = cities.filter(city => city.name !== cityName);
        saveCities();
        updateClockDisplay();
        
        // Add back to dropdown
        const select = document.getElementById('citySelect');
        const option = document.createElement('option');
        option.value = cityName;
        option.textContent = cityName;
        select.appendChild(option);
    }

    function saveCities() {
        localStorage.setItem('worldClockCities', JSON.stringify(cities));
    }

    initClock();
});