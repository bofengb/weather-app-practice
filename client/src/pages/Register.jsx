import { useState } from "react";
import SignUpPart from "../components/SignUpPart";
import axiox from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // Build an object that contains all properties
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const registration = async (e) => {
    const { username, email, password } = userData;

    e.preventDefault();

    try {
      const { data } = await axiox.post("/register", {
        username,
        email,
        password,
      });

      if (data.error) {
        toast.error(data.error);
      } else {
        setUserData({});

        toast.success("Registration Successful.");

        // Navigate to login page
        navigate("/login");
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
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clipRule="evenodd"
          />
        </svg>

        <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign Up
        </h1>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div>
            {/* Prop drilling: 
            (1) UseContext: Pass down states into components; 
            (2) Drill Props variables. */}
            <SignUpPart userData={userData} setUserData={setUserData} />
          </div>
          <div className="flex flex-row gap-3 pt-8">
            <button
              className="flex cursor-pointer w-full justify-center rounded-md border border-transparent bg-blue-400 py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-indigo-500"
              onClick={(e) => {
                registration(e);
                console.log(userData);
              }}
            >
              Sign Up
            </button>
            <button
              className="flex cursor-pointer w-full justify-center rounded-md border border-transparent bg-blue-400 py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-indigo-500"
              onClick={(e) => {
                navigate("/login");
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
