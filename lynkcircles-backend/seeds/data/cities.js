// Approximate city centers. Jitter each worker by ±0.05° so they
// don't all stack on the same pin in geo queries.

export const CITIES = {
  mumbai:    { city: "Mumbai",    state: "Maharashtra",    lat: 19.076, lng: 72.877 },
  pune:      { city: "Pune",      state: "Maharashtra",    lat: 18.520, lng: 73.857 },
  bengaluru: { city: "Bengaluru", state: "Karnataka",      lat: 12.972, lng: 77.594 },
  delhi:     { city: "New Delhi", state: "Delhi",          lat: 28.612, lng: 77.231 },
  gurgaon:   { city: "Gurugram",  state: "Haryana",        lat: 28.459, lng: 77.027 },
  ahmedabad: { city: "Ahmedabad", state: "Gujarat",        lat: 23.022, lng: 72.572 },
  surat:     { city: "Surat",     state: "Gujarat",        lat: 21.170, lng: 72.831 },
  hyderabad: { city: "Hyderabad", state: "Telangana",      lat: 17.385, lng: 78.486 },
  chennai:   { city: "Chennai",   state: "Tamil Nadu",     lat: 13.082, lng: 80.270 },
  jaipur:    { city: "Jaipur",    state: "Rajasthan",      lat: 26.912, lng: 75.787 },
  indore:    { city: "Indore",    state: "Madhya Pradesh", lat: 22.720, lng: 75.857 },
};

export const jitter = (n, max = 0.05) => n + (Math.random() * 2 - 1) * max;

export const cityCoords = (key) => {
  const c = CITIES[key];
  return { lat: jitter(c.lat), lng: jitter(c.lng) };
};
