import { useContext, useState } from "react";
import LoginPart from "../components/LoginPart";
import axiox from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const Login = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const { setUser } = useContext(UserContext);

  const login = async (e) => {
    const { email, password } = userData;

    e.preventDefault();

    try {
      const { data } = await axiox.post("/login", {
        email,
        password,
      });

      if (data.error) {
        toast.error(data.error);
      } else {
        setUser(data);
        setUserData({});

        toast.success("Login Successful.");

        // Navigate to weather page
        navigate("/weather");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-full h-full min-h-full flex flex-col justify-center py-16 sm:px-6 lg:px-8 z-100 mf:h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-row justify-center space-x-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10 mt-6"
        >
          <path
            fillRule="evenodd"
            d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm5.03 4.72a.75.75 0 0 1 0 1.06l-1.72 1.72h10.94a.75.75 0 0 1 0 1.5H10.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Login
        </h1>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            <LoginPart userData={userData} setUserData={setUserData} />
          </div>
          <div className="flex flex-row gap-3 pt-8">
            <button
              className="flex cursor-pointer w-full justify-center rounded-md border border-transparent bg-blue-400 py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-indigo-500"
              onClick={(e) => {
                login(e);
                console.log(userData);
              }}
            >
              Login
            </button>
            <button
              className="flex cursor-pointer w-full justify-center rounded-md border border-transparent bg-blue-400 py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-indigo-500"
              onClick={(e) => {
                navigate("/register");
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
