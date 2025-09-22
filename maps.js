const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

const fetchRoute = async (start, end) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${end}&key=${apiKey}`
  );
  const data = await response.json();
  return data;
};

export default fetchRoute;
