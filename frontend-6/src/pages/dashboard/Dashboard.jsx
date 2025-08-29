import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, Home } from "lucide-react";
import { useEffect, useState } from "react";

import axios from "axios";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [temperatureData, setTemperatureData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemperatureData();
  }, []);

  // Metodo para obtener temperaturas y registro del backend
  const fetchTemperatureData = async () => {
    const accessToken = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_DB_MICRO_TEST}/query/data`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Temperature data:", response.data);
      setTemperatureData(response.data);
    } catch (error) {
      console.error("Error fetching temperature data:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">
                  {user?.name || user?.username}
                </span>
              </div>

              <button
                onClick={() => navigate("/settings")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user?.name || user?.username}!
          </h2>
          <p className="text-gray-600 mt-2">
            Has iniciado sesión correctamente en tu dashboard.
          </p>
        </div>

        {/* Card y contenido para muesta de temperaturas */}
      </main>
    </div>
  );
};

export default Dashboard;
