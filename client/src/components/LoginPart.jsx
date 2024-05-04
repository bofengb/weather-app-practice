import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";

const LoginPart = ({ userData, setUserData }) => {
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  // Password visibility handler
  const handlePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="mt-1">
        <label className="block font-medium text-gray-500 pb-2">Email</label>
        <input
          onChange={(e) => {
            setUserData({ ...userData, email: e.target.value });
          }}
          value={userData.email}
          type="email"
          id="email"
          className="block h-14 w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Password */}
      <div className="mt-1 relative">
        <label className="block font-medium text-gray-500 pb-2">Password</label>
        <input
          onChange={(e) => {
            setUserData({ ...userData, password: e.target.value });
          }}
          value={userData.password}
          type={passwordVisibility ? "text" : "password"}
          id="password"
          className="block h-14 w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500"
        />
        <div className="text-2xl absolute top-11 right-5 cursor-pointer">
          {passwordVisibility === false ? (
            <AiFillEyeInvisible onClick={handlePasswordVisibility} />
          ) : (
            <AiFillEye onClick={handlePasswordVisibility} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPart;
