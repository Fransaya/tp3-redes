import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Settings,
  Home,
  Thermometer,
  MapPin,
  Calendar,
  Wifi,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
        `${import.meta.env.VITE_DB_MICRO}/query/data`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Temperature data:", response.data);
      // Acceder a los datos desde response.data.data.rows
      setTemperatureData(response.data.data?.rows || []);
    } catch (error) {
      console.error("Error fetching temperature data:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Función para preparar datos del gráfico
  const prepareChartData = (data) => {
    return data
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((item, index) => ({
        id: item.id,
        temperature: parseFloat(item.temperature),
        temperatureC: parseFloat(
          (((item.temperature - 32) * 5) / 9).toFixed(1)
        ),
        time: new Date(item.timestamp).toLocaleDateString("es-ES", {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullTime: item.timestamp,
      }));
  };

  // Función personalizada para el tooltip del gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-lg font-semibold text-purple-600">
            {payload[0].value}°F ({data.temperatureC}°C)
          </p>
          <p className="text-xs text-gray-500">ID: {data.id}</p>
        </div>
      );
    }
    return null;
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para obtener el color de la temperatura
  const getTemperatureColor = (temp) => {
    if (temp < 0) return "text-blue-600";
    if (temp < 15) return "text-blue-500";
    if (temp < 25) return "text-green-500";
    if (temp < 35) return "text-yellow-500";
    return "text-red-500";
  };

  // Función para obtener el ícono del source
  const getSourceIcon = (source) => {
    if (source === "web") return <Wifi className="w-4 h-4" />;
    return <Thermometer className="w-4 h-4" />;
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

        {/* Sección de temperaturas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-purple-600" />
              <span>Registros de Temperatura</span>
            </h3>
            <button
              onClick={fetchTemperatureData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Actualizar
            </button>
          </div>

          {/* Gráfico de variación de temperaturas */}
          {temperatureData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-medium text-gray-900">
                  Variación de Temperatura
                </h4>
                <span className="text-sm text-gray-500">
                  ({temperatureData.length} registros)
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareChartData(temperatureData)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                      label={{
                        value: "Temperatura (°F)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex justify-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Temperatura en °F</span>
                  </div>
                  <span>•</span>
                  <span>Ordenado por tiempo</span>
                </div>
              </div>
            </div>
          )}

          {/* Grid de cards de temperatura */}
          {temperatureData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {temperatureData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header de la card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{item.city}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 text-xs">
                      {getSourceIcon(item.source)}
                      <span>{item.source}</span>
                    </div>
                  </div>

                  {/* Temperatura principal */}
                  <div className="text-center mb-4">
                    <div
                      className={`text-4xl font-bold ${getTemperatureColor(
                        item.temperature
                      )}`}
                    >
                      {item.temperature}°F
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {(((item.temperature - 32) * 5) / 9).toFixed(1)}°C
                    </div>
                  </div>

                  {/* Footer con fecha */}
                  <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>

                  {/* ID del registro (opcional, para debug) */}
                  <div className="text-xs text-gray-400 text-center mt-2">
                    ID: {item.id}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos de temperatura
              </h3>
              <p className="text-gray-500 mb-6">
                No se encontraron registros de temperatura disponibles.
              </p>
              <button
                onClick={fetchTemperatureData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Cargar datos
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
