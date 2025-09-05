import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
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
  const navigate = useNavigate();

  const [temperatureData, setTemperatureData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    recordsPerPage: 10,
    totalRecords: 0,
  });
  const [filters, setFilters] = useState({
    city: "",
    minTemp: "",
    maxTemp: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemperatureData(1);
  }, []);

  const fetchTemperatureData = async (page = 1) => {
    const accessToken = localStorage.getItem("authToken");
    setLoading(true);

    try {
      const params = {
        page,
        limit: pagination.recordsPerPage,
      };

      // agregar filtros solo si existen
      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.minTemp) params.minTemp = parseFloat(filters.minTemp);
      if (filters.maxTemp) params.maxTemp = parseFloat(filters.maxTemp);

      const response = await axios.get(
        `${import.meta.env.VITE_DB_MICRO}/query/data`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
        }
      );

      const data = response.data.data;
      setTemperatureData(data.records || []);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        recordsPerPage: data.pagination.recordsPerPage,
        totalRecords: data.pagination.totalRecords,
      });
    } catch (error) {
      console.error("Error fetching temperature data:", error);
      setTemperatureData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      fetchTemperatureData(newPage);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchTemperatureData(1); // resetear a página 1 al aplicar filtros
  };

  const handleClearFilters = () => {
    setFilters({
      city: "",
      minTemp: "",
      maxTemp: "",
    });
    // Fetch data without filters
    setTimeout(() => {
      fetchTemperatureData(1);
    }, 0);
  };

  const prepareChartData = (data) => {
    if (!data || data.length === 0) return [];

    return data
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((item, index) => ({
        id: item.id,
        temperature: parseFloat(item.temperature),
        temperatureC: parseFloat(
          (((item.temperature - 32) * 5) / 9).toFixed(1)
        ),
        time: new Date(item.timestamp).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullTime: item.timestamp,
        city: item.city,
        index: index,
      }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">
            {data.city} - {label}
          </p>
          <p className="text-lg font-semibold text-purple-600">
            {payload[0].value}°F ({data.temperatureC}°C)
          </p>
          <p className="text-xs text-gray-500">ID: {data.id}</p>
        </div>
      );
    }
    return null;
  };

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

  const getTemperatureColor = (temp) => {
    if (temp < 0) return "text-blue-600";
    if (temp < 15) return "text-blue-500";
    if (temp < 25) return "text-green-500";
    if (temp < 35) return "text-yellow-500";
    return "text-red-500";
  };

  const getSourceIcon = (source) =>
    source === "web" || source.includes("http") ? (
      <Wifi className="w-4 h-4" />
    ) : (
      <Thermometer className="w-4 h-4" />
    );

  // Función para mostrar solo bloques de 10 páginas
  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const start = Math.floor((current - 1) / 10) * 10 + 1;
    const end = Math.min(start + 9, total);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const chartData = prepareChartData(temperatureData);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user?.name || user?.username}!
          </h2>
          <p className="text-gray-600 mt-2">
            Has iniciado sesión correctamente en tu dashboard.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">Todas las ciudades</option>
              <option value="Rio de Janeiro">Rio de Janeiro</option>
              <option value="Berlin">Berlin</option>
              <option value="Shanghai">Shanghai</option>
            </select>
            <input
              type="number"
              name="minTemp"
              placeholder="Temp mínima (°F)"
              value={filters.minTemp}
              onChange={handleFilterChange}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="number"
              name="maxTemp"
              placeholder="Temp máxima (°F)"
              value={filters.maxTemp}
              onChange={handleFilterChange}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Aplicando..." : "Aplicar"}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Gráfico */}
        {temperatureData.length > 0 && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Tendencia de Temperaturas
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}°F`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#9333ea"
                    strokeWidth={3}
                    dot={{ fill: "#9333ea", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#7c3aed" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Grid de registros */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : temperatureData.length > 0 ? (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Registros de Temperatura
              </h3>
              <div className="text-sm text-gray-500">
                Mostrando {temperatureData.length} de {pagination.totalRecords}{" "}
                registros
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {temperatureData.map((item) => (
                <div
                  key={`${item.id}-${item.timestamp}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{item.city}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 text-xs">
                      {getSourceIcon(item.source)}
                      <span>
                        {item.source.includes("http") ? "API" : item.source}
                      </span>
                    </div>
                  </div>

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

                  <div className="flex items-center justify-center text-xs text-gray-500 space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>

                  <div className="text-xs text-gray-400 text-center mt-2">
                    ID: {item.id}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación mejorada */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-500">
                Página {pagination.currentPage} de {pagination.totalPages}
              </div>

              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1 || loading}
                  className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Primera
                </button>

                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || loading}
                  className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 rounded transition-colors disabled:cursor-not-allowed ${
                      pageNum === pagination.currentPage
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages || loading
                  }
                  className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>

                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={
                    pagination.currentPage === pagination.totalPages || loading
                  }
                  className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300 disabled:cursor-not-allowed text-sm"
                >
                  Última
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay datos de temperatura
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.city || filters.minTemp || filters.maxTemp
                ? "No se encontraron registros con los filtros aplicados."
                : "No se encontraron registros de temperatura disponibles."}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => fetchTemperatureData(1)}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Cargando..." : "Cargar datos"}
              </button>
              {(filters.city || filters.minTemp || filters.maxTemp) && (
                <button
                  onClick={handleClearFilters}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
