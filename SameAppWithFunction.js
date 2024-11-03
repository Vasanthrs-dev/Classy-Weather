import { useEffect, useState } from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

function App() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cityName, setCityName] = useState("");

  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes,
  } = weather;

  useEffect(
    function () {
      const controller = new AbortController();
      async function getWeather() {
        try {
          if (location.length < 3) {
            setWeather({});
            setCityName("");
            return;
          }
          setIsLoading(true);
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          const { latitude, longitude, country_code, timezone, name } =
            data.results.at(0);
          setCityName(name);
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherData = await weatherRes.json();
          console.log(weatherData);
          setWeather(weatherData.daily);
          return () => {
            controller.abort();
          };
        } catch (err) {
          console.error(err);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }

      getWeather();
    },
    [location]
  );

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col">
        <h1>Function Weather</h1>
        <input
          className="border border-black"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {isLoading && <p>Loading...</p>}
        <ul className="flex gap-5">
          <h1>{cityName}</h1>
          {dates &&
            !isLoading &&
            dates.map((date, i) => (
              <Weather
                key={date}
                max={max.at(i)}
                min={min.at(i)}
                codes={codes.at(i)}
                dates={dates.at(i)}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}

function Weather({ max, min, codes, dates }) {
  return (
    <li>
      <p>{getWeatherIcon(codes)}</p>
      <p>{formatDay(dates)}</p>
      <p>
        {max}&deg;C &mdash; {min}&deg;C
      </p>
    </li>
  );
}
export default App;
