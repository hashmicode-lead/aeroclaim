export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string; // ISO-2
  lat: number;
  lon: number;
  tz: string; // IANA
}

const IST = "Asia/Kolkata";

export const AIRPORTS: Airport[] = [
  // India
  { iata: "DEL", name: "Indira Gandhi International", city: "Delhi", country: "IN", lat: 28.5562, lon: 77.1, tz: IST },
  { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "IN", lat: 19.0896, lon: 72.8656, tz: IST },
  { iata: "BLR", name: "Kempegowda International", city: "Bengaluru", country: "IN", lat: 13.1986, lon: 77.7066, tz: IST },
  { iata: "MAA", name: "Chennai International", city: "Chennai", country: "IN", lat: 12.9941, lon: 80.1709, tz: IST },
  { iata: "CCU", name: "Netaji Subhas Chandra Bose International", city: "Kolkata", country: "IN", lat: 22.6547, lon: 88.4467, tz: IST },
  { iata: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", country: "IN", lat: 17.2403, lon: 78.4294, tz: IST },
  { iata: "COK", name: "Cochin International", city: "Kochi", country: "IN", lat: 10.152, lon: 76.4019, tz: IST },
  { iata: "AMD", name: "Sardar Vallabhbhai Patel International", city: "Ahmedabad", country: "IN", lat: 23.0772, lon: 72.6347, tz: IST },
  { iata: "PNQ", name: "Pune International", city: "Pune", country: "IN", lat: 18.5822, lon: 73.9197, tz: IST },
  { iata: "GOI", name: "Goa International (Dabolim)", city: "Goa", country: "IN", lat: 15.3808, lon: 73.8314, tz: IST },
  { iata: "GOX", name: "Manohar International (Mopa)", city: "Goa", country: "IN", lat: 15.7304, lon: 73.8655, tz: IST },
  { iata: "JAI", name: "Jaipur International", city: "Jaipur", country: "IN", lat: 26.8242, lon: 75.8122, tz: IST },
  { iata: "LKO", name: "Chaudhary Charan Singh International", city: "Lucknow", country: "IN", lat: 26.7606, lon: 80.8893, tz: IST },
  { iata: "GAU", name: "Lokpriya Gopinath Bordoloi International", city: "Guwahati", country: "IN", lat: 26.1061, lon: 91.5859, tz: IST },
  { iata: "TRV", name: "Thiruvananthapuram International", city: "Thiruvananthapuram", country: "IN", lat: 8.4821, lon: 76.9201, tz: IST },
  { iata: "IXC", name: "Chandigarh International", city: "Chandigarh", country: "IN", lat: 30.6735, lon: 76.7885, tz: IST },
  { iata: "PAT", name: "Jay Prakash Narayan International", city: "Patna", country: "IN", lat: 25.5913, lon: 85.088, tz: IST },
  { iata: "BBI", name: "Biju Patnaik International", city: "Bhubaneswar", country: "IN", lat: 20.2444, lon: 85.8178, tz: IST },
  { iata: "SXR", name: "Sheikh ul-Alam International", city: "Srinagar", country: "IN", lat: 33.9871, lon: 74.7742, tz: IST },
  { iata: "IXB", name: "Bagdogra International", city: "Siliguri", country: "IN", lat: 26.6812, lon: 88.3286, tz: IST },
  { iata: "VNS", name: "Lal Bahadur Shastri International", city: "Varanasi", country: "IN", lat: 25.4524, lon: 82.8593, tz: IST },
  { iata: "NAG", name: "Dr. Babasaheb Ambedkar International", city: "Nagpur", country: "IN", lat: 21.0922, lon: 79.0472, tz: IST },
  { iata: "IDR", name: "Devi Ahilya Bai Holkar", city: "Indore", country: "IN", lat: 22.7218, lon: 75.8011, tz: IST },
  { iata: "CCJ", name: "Calicut International", city: "Kozhikode", country: "IN", lat: 11.1368, lon: 75.9553, tz: IST },
  { iata: "IXE", name: "Mangaluru International", city: "Mangaluru", country: "IN", lat: 12.9613, lon: 74.8901, tz: IST },
  { iata: "VTZ", name: "Visakhapatnam International", city: "Visakhapatnam", country: "IN", lat: 17.7212, lon: 83.2245, tz: IST },
  { iata: "CJB", name: "Coimbatore International", city: "Coimbatore", country: "IN", lat: 11.03, lon: 77.0434, tz: IST },
  { iata: "IXR", name: "Birsa Munda", city: "Ranchi", country: "IN", lat: 23.3143, lon: 85.3217, tz: IST },
  { iata: "ATQ", name: "Sri Guru Ram Dass Jee International", city: "Amritsar", country: "IN", lat: 31.7096, lon: 74.7973, tz: IST },
  { iata: "BDQ", name: "Vadodara", city: "Vadodara", country: "IN", lat: 22.3362, lon: 73.2263, tz: IST },
  { iata: "RPR", name: "Swami Vivekananda", city: "Raipur", country: "IN", lat: 21.1804, lon: 81.7388, tz: IST },
  { iata: "DED", name: "Jolly Grant", city: "Dehradun", country: "IN", lat: 30.1897, lon: 78.1803, tz: IST },
  { iata: "IXZ", name: "Veer Savarkar International", city: "Port Blair", country: "IN", lat: 11.6412, lon: 92.7297, tz: IST },
  { iata: "IXM", name: "Madurai", city: "Madurai", country: "IN", lat: 9.8345, lon: 78.0934, tz: IST },
  { iata: "TRZ", name: "Tiruchirappalli International", city: "Tiruchirappalli", country: "IN", lat: 10.7654, lon: 78.7097, tz: IST },
  { iata: "UDR", name: "Maharana Pratap", city: "Udaipur", country: "IN", lat: 24.6177, lon: 73.8961, tz: IST },
  { iata: "BHO", name: "Raja Bhoj", city: "Bhopal", country: "IN", lat: 23.2875, lon: 77.3374, tz: IST },
  { iata: "STV", name: "Surat International", city: "Surat", country: "IN", lat: 21.1141, lon: 72.7418, tz: IST },
  { iata: "IXL", name: "Kushok Bakula Rimpochee", city: "Leh", country: "IN", lat: 34.1359, lon: 77.5465, tz: IST },
  { iata: "IXJ", name: "Jammu", city: "Jammu", country: "IN", lat: 32.6891, lon: 74.8374, tz: IST },
  // International
  { iata: "DXB", name: "Dubai International", city: "Dubai", country: "AE", lat: 25.2532, lon: 55.3657, tz: "Asia/Dubai" },
  { iata: "AUH", name: "Zayed International", city: "Abu Dhabi", country: "AE", lat: 24.433, lon: 54.6511, tz: "Asia/Dubai" },
  { iata: "SHJ", name: "Sharjah International", city: "Sharjah", country: "AE", lat: 25.3286, lon: 55.5172, tz: "Asia/Dubai" },
  { iata: "DOH", name: "Hamad International", city: "Doha", country: "QA", lat: 25.2731, lon: 51.6081, tz: "Asia/Qatar" },
  { iata: "MCT", name: "Muscat International", city: "Muscat", country: "OM", lat: 23.5933, lon: 58.2844, tz: "Asia/Muscat" },
  { iata: "BAH", name: "Bahrain International", city: "Manama", country: "BH", lat: 26.2708, lon: 50.6336, tz: "Asia/Bahrain" },
  { iata: "KWI", name: "Kuwait International", city: "Kuwait City", country: "KW", lat: 29.2266, lon: 47.9689, tz: "Asia/Kuwait" },
  { iata: "RUH", name: "King Khalid International", city: "Riyadh", country: "SA", lat: 24.9576, lon: 46.6988, tz: "Asia/Riyadh" },
  { iata: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "SA", lat: 21.6796, lon: 39.1565, tz: "Asia/Riyadh" },
  { iata: "SIN", name: "Changi", city: "Singapore", country: "SG", lat: 1.3644, lon: 103.9915, tz: "Asia/Singapore" },
  { iata: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "MY", lat: 2.7456, lon: 101.7072, tz: "Asia/Kuala_Lumpur" },
  { iata: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "TH", lat: 13.69, lon: 100.7501, tz: "Asia/Bangkok" },
  { iata: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "HK", lat: 22.308, lon: 113.9185, tz: "Asia/Hong_Kong" },
  { iata: "CMB", name: "Bandaranaike International", city: "Colombo", country: "LK", lat: 7.1808, lon: 79.8841, tz: "Asia/Colombo" },
  { iata: "KTM", name: "Tribhuvan International", city: "Kathmandu", country: "NP", lat: 27.6966, lon: 85.3591, tz: "Asia/Kathmandu" },
  { iata: "DAC", name: "Hazrat Shahjalal International", city: "Dhaka", country: "BD", lat: 23.8433, lon: 90.3978, tz: "Asia/Dhaka" },
  { iata: "MLE", name: "Velana International", city: "Malé", country: "MV", lat: 4.1918, lon: 73.529, tz: "Indian/Maldives" },
  { iata: "LHR", name: "Heathrow", city: "London", country: "GB", lat: 51.47, lon: -0.4543, tz: "Europe/London" },
  { iata: "FRA", name: "Frankfurt", city: "Frankfurt", country: "DE", lat: 50.0379, lon: 8.5622, tz: "Europe/Berlin" },
  { iata: "CDG", name: "Charles de Gaulle", city: "Paris", country: "FR", lat: 49.0097, lon: 2.5479, tz: "Europe/Paris" },
  { iata: "AMS", name: "Schiphol", city: "Amsterdam", country: "NL", lat: 52.3105, lon: 4.7683, tz: "Europe/Amsterdam" },
  { iata: "IST", name: "Istanbul", city: "Istanbul", country: "TR", lat: 41.2753, lon: 28.7519, tz: "Europe/Istanbul" },
  { iata: "JFK", name: "John F. Kennedy International", city: "New York", country: "US", lat: 40.6413, lon: -73.7781, tz: "America/New_York" },
  { iata: "EWR", name: "Newark Liberty International", city: "Newark", country: "US", lat: 40.6895, lon: -74.1745, tz: "America/New_York" },
  { iata: "SFO", name: "San Francisco International", city: "San Francisco", country: "US", lat: 37.6213, lon: -122.379, tz: "America/Los_Angeles" },
  { iata: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "CA", lat: 43.6777, lon: -79.6248, tz: "America/Toronto" },
  { iata: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "AU", lat: -33.9399, lon: 151.1753, tz: "Australia/Sydney" },
  { iata: "MEL", name: "Melbourne Tullamarine", city: "Melbourne", country: "AU", lat: -37.669, lon: 144.841, tz: "Australia/Melbourne" },
  { iata: "NRT", name: "Narita International", city: "Tokyo", country: "JP", lat: 35.772, lon: 140.3929, tz: "Asia/Tokyo" },
  { iata: "ICN", name: "Incheon International", city: "Seoul", country: "KR", lat: 37.4602, lon: 126.4407, tz: "Asia/Seoul" },
];

const BY_CODE = new Map(AIRPORTS.map((a) => [a.iata, a]));

export function getAirport(code: string | undefined | null): Airport | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.trim().toUpperCase());
}

export const AIRLINES: Record<string, string> = {
  "6E": "IndiGo",
  AI: "Air India",
  IX: "Air India Express",
  QP: "Akasa Air",
  SG: "SpiceJet",
  "9I": "Alliance Air",
  S5: "Star Air",
  UK: "Vistara (now Air India)",
  I5: "AIX Connect (now Air India Express)",
  G8: "Go First",
  EK: "Emirates",
  QR: "Qatar Airways",
  EY: "Etihad Airways",
  FZ: "flydubai",
  G9: "Air Arabia",
  WY: "Oman Air",
  GF: "Gulf Air",
  KU: "Kuwait Airways",
  SV: "Saudia",
  SQ: "Singapore Airlines",
  TR: "Scoot",
  MH: "Malaysia Airlines",
  AK: "AirAsia",
  TG: "Thai Airways",
  CX: "Cathay Pacific",
  UL: "SriLankan Airlines",
  LH: "Lufthansa",
  BA: "British Airways",
  AF: "Air France",
  KL: "KLM",
  TK: "Turkish Airlines",
  VS: "Virgin Atlantic",
  UA: "United Airlines",
  AC: "Air Canada",
  QF: "Qantas",
  JL: "Japan Airlines",
  NH: "ANA",
};
