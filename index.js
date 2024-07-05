const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config(); // Load environment variables from .env file

const apiKeyIpGeolocation = process.env.API_GEO;
const apiKeyWeather = process.env.API_WEATHER;

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';

  try {
    // Fetch client IP address
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const clientIp = ipResponse.data.ip;

    // Check if client IP is a loopback address
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
      throw new Error('Client IP is a loopback address.');
    }

    // Fetch geolocation data based on client IP
    const geoData = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKeyIpGeolocation}&ip=${clientIp}`);
    const city = geoData.data.city;

    if (!city) {
      throw new Error('City not found in geolocation data.');
    }

    // Fetch weather data based on city
    const weatherData = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyWeather}&units=metric`);
    const temp = Math.round(weatherData.data.main.temp);

    // Respond with JSON data
    res.json({
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}! The temperature is ${temp} degrees Celsius in ${city}`
    });
  } catch (error) {
    console.error('API Request Error:', error.message);
    res.status(500).json({
      message: 'An error occurred while processing your request.',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
