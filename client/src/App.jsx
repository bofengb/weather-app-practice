import { Routes, Route } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import Weather from "./pages/Weather";
import { UserContextProvider } from "./context/UserContext";

// Set default base URL
axios.defaults.baseURL = "http://localhost:4000";
// Enable us to navigate between different URLs
axios.defaults.withCredentials = true;

function App() {
  return (
    <div className="h-screen">
      {/* <Navbar /> */}
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      <UserContextProvider>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/weather" element={<Weather />} />
        </Routes>
      </UserContextProvider>
    </div>
  );
}

export default App;
