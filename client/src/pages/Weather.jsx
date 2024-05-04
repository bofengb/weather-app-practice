import { useContext, useEffect, useState } from "react";
import _ from "lodash";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const Weather = () => {
  const navigate = useNavigate();

  const [geoData, setGeoData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [changeCity, setChangeCity] = useState(true);

  const { user, ready } = useContext(UserContext);

  const apiKey = "bd5e378503939ddaee76f12ad7a97608";

  async function search(value) {
    try {
      const res = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${apiKey}`
      );

      const data = await res.json();
      if (data.cod === "400") {
        return null;
      } else {
        console.log(data);
        return data;
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSearchDebounce = _.debounce(async (value) => {
    setGeoData(await search(value));
  }, 700);

  async function handleChange(e) {
    handleSearchDebounce(e.target.value);
  }

  async function handleOnClick(lat, lon, name) {
    console.log(lat, lon, name);

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();

    const tempT = data.main.temp;
    const feelsLikeT = data.main.feels_like;
    const humidityT = data.main.humidity;
    const windT = data.wind.speed;
    const iconT = data.weather[0].icon;
    const weatherDataT = {
      temp: tempT,
      feelsLike: feelsLikeT,
      humidity: humidityT,
      wind: windT,
      icon: `https://openweathermap.org/img/wn/${iconT}@4x.png`,
      name: name,
    };

    setWeatherData(weatherDataT);
    setChangeCity(false);
  }

  useEffect(() => {
    console.log(weatherData);
  }, [weatherData]);

  function handleChangeCity(e) {
    setChangeCity(!changeCity);
  }

  // Jump to login page if not already logged in
  if (ready && !user) {
    console.log(user);
    // navigate('/login');
    return <Navigate to={"/login"} />;
  }

  const logout = async () => {
    const { data } = await axios.post("/logout");
    if (data) {
      toast.success("Logout Successful.");
    }
    navigate("/login");
  };

  return (
    <div>
      <header className="p-4 flex flex-row justify-end">
        {/* <Link to={"/weather"} */}
        <button
          onClick={logout}
          className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-4 mr-20 mt-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>

          <div className="bg-gray-500 text-white rounded-full border border-gray-500 overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 relative top-1"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {!!user && <div>{user?.username}</div>}
        </button>
      </header>
      <div className="w-full min-h-80 text-sm flex flex-col items-center">
        {changeCity && (
          <form className="w-full max-w-80 text-center py-5 font-bold text-base mt-20 pt-20">
            <input
              className="border-b-4 border-gray-300 text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 py-3 w-full bg-transparent"
              type="text"
              placeholder="Search city..."
              onChange={handleChange}
            ></input>
            <ul className="text-left p-1 flex flex-col gap-1">
              {geoData &&
                geoData.map((dataRecord, index) => {
                  return (
                    <li
                      className="bg-gray-100 cursor-pointer"
                      key={index}
                      data-lat={dataRecord.lat}
                      data-lon={dataRecord.lon}
                      data-name={dataRecord.name}
                      onClick={() => {
                        handleOnClick(
                          dataRecord.lat,
                          dataRecord.lon,
                          dataRecord.name
                        );
                      }}
                    >
                      {dataRecord.name}
                      <span className="text-gray-700">
                        {dataRecord.country}
                      </span>
                    </li>
                  );
                })}

              {/* <li className="bg-gray-100 cursor-pointer">
                Test 1<span className="text-gray-700">UK</span>
              </li>
              <li className="bg-gray-100 cursor-pointer">Test 2</li>
              <li className="bg-gray-100 cursor-pointer">Test 3</li>
              <li className="bg-gray-100 cursor-pointer">Test 4</li>
              <li className="bg-gray-100 cursor-pointer">Test 5</li> */}
            </ul>
          </form>
        )}

        {!changeCity && (
          <div className="w-full max-w-80 text-center py-5 font-bold text-base flex flex-col items-center">
            <img src={weatherData ? weatherData.icon : ""} alt="" />
            <h1 className="text-6xl mb-6">
              {weatherData ? weatherData.temp : ""}&#8451;
            </h1>
            <h2 className="text-3xl text-orange-500">
              {weatherData ? weatherData.name : ""}
            </h2>
            <button
              className="flex cursor-pointer w-30 justify-center rounded-3xl border border-transparent bg-blue-400 py-2 m-5 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-indigo-500"
              onClick={handleChangeCity}
            >
              Change City
            </button>
            <div className="flex flex-row grid-cols-3 gap-20">
              <div>
                <h3 className="text-xl uppercase">Wind</h3>
                <div className="text-3xl">
                  {weatherData ? weatherData.wind : ""}
                  <span className="text-gray-600 text-xs">km/h</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl uppercase text-nowrap">Feels Like</h3>
                <div className="text-3xl">
                  {weatherData ? weatherData.feelsLike : ""}
                  <span className="text-gray-600 text-xs">&#8451;</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl uppercase">Humidity</h3>
                <div className="text-3xl">
                  {weatherData ? weatherData.humidity : ""}
                  <span className="text-gray-600 text-xs">%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
