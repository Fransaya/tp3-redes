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
  Info,
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
  Legend,
} from "recharts";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [temperatureData, setTemperatureData] = useState([]);
  const [chartData, setChartData] = useState([]);
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
  const [chartLoading, setChartLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 🏙️ Configuración de ciudades para el gráfico
  const CITIES = {
    "Rio de Janeiro": {
      color: "#23d300ff",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    Berlin: {
      color: "#0068caff",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
    Shanghai: {
      color: "#fa2424ff",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
  };

  useEffect(() => {
    fetchTemperatureData(1);
    fetchChartData();
  }, []);

  // 🔧 FUNCIÓN CORREGIDA para preparar datos del gráfico
  const prepareChartData = (allData) => {
    if (!allData || allData.length === 0) return [];

    const startDate = new Date("2025-09-07T00:00:00");
    const now = new Date();

    console.log("🔍 Raw data received:", allData.length, "records");

    // 1️⃣ Aplanar datos si es necesario
    const flatData = Array.isArray(allData) ? allData.flat() : allData;

    // 2️⃣ Filtrar y limpiar datos
    const filteredData = flatData
      .filter((item) => {
        const ts = new Date(item.timestamp);
        return ts >= startDate && ts <= now && item.temperature != null;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log("🔍 Filtered data:", filteredData.length, "records");

    // 3️⃣ Identificar ciudades por patrones de temperatura o propiedad city
    const identifyCityByTemperature = (temp, item) => {
      // Primero intentar usar la propiedad city si existe
      if (item.city) return item.city;

      // Fallback: identificar por temperatura
      // const tempFloat = parseFloat(temp);
      // if (tempFloat === 27.1) return "Rio de Janeiro";
      // if (tempFloat === 17.2) return "Berlin";
      // if (tempFloat === 26.0) return "Shanghai";

      // // Fallback adicional por rangos
      // if (tempFloat > 25) return "Rio de Janeiro";
      // if (tempFloat < 20) return "Berlin";
      // return "Shanghai";
    };

    // 4️⃣ Agrupar por timestamp (redondeando a minutos)
    const groupedData = {};

    filteredData.forEach((item) => {
      const timestamp = new Date(item.timestamp);
      // Redondear a minutos para agrupar mediciones cercanas
      const roundedTime = new Date(timestamp);
      roundedTime.setSeconds(0, 0);
      const timeKey = new Date(item.timestamp);

      if (!groupedData[timeKey]) {
        groupedData[timeKey] = {
          time: roundedTime.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          fullTime: roundedTime.toISOString(),
          timestamp: timeKey,
        };
      }

      // Identificar ciudad y agregar temperatura
      const city = identifyCityByTemperature(item.temperature, item);
      groupedData[timeKey][city] = parseFloat(item.temperature);
    });

    // 5️⃣ Convertir a array y ordenar
    const result = Object.values(groupedData).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    console.log("📊 Chart data prepared:", result.length, "time points");
    console.log("📊 Sample data:", result.slice(0, 3));
    return result;
  };

  // Función para obtener datos del gráfico
  const fetchChartData = async () => {
    const accessToken = localStorage.getItem("authToken");
    setChartLoading(true);

    try {
      const startDate = "2025-09-07T00:00:00";
      const endDate = new Date().toISOString();

      const response = await axios.get(
        `http://localhost:3001/query/data`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            limit: 1000,
            startDate: startDate,
            endDate: endDate,
            ...(filters.city.trim() && { city: filters.city.trim() }),
            ...(filters.minTemp && { minTemp: parseFloat(filters.minTemp) }),
            ...(filters.maxTemp && { maxTemp: parseFloat(filters.maxTemp) }),
          },
        }
      );

      const data = response.data.data;
      const processedChartData = prepareChartData(data.records || []);
      console.log("processedChartData", processedChartData);
      setChartData(processedChartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchTemperatureData = async (page = 1) => {
    const accessToken = localStorage.getItem("authToken");
    setLoading(true);

    try {
      const params = {
        page,
        limit: pagination.recordsPerPage,
      };

      if (filters.city.trim()) params.city = filters.city.trim();
      if (filters.minTemp) params.minTemp = parseFloat(filters.minTemp);
      if (filters.maxTemp) params.maxTemp = parseFloat(filters.maxTemp);

      const response = await axios.get(
        `http://localhost:3001/query/data`,
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
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    toast.success("Sesión cerrada correctamente");
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
    fetchTemperatureData(1);
    fetchChartData();
  };

  const handleClearFilters = () => {
    setFilters({
      city: "",
      minTemp: "",
      maxTemp: "",
    });
    setTimeout(() => {
      fetchTemperatureData(1);
      fetchChartData();
    }, 0);
  };

  // 🎨 Tooltip mejorado para el gráfico
  const CustomTooltipChart = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {label}
          </p>
          {payload.map((entry) => (
            <p
              key={entry.dataKey}
              className="text-sm flex items-center justify-between"
            >
              <span className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
                {entry.dataKey}:
              </span>
              <span className="font-semibold ml-2 flex items-center">
                <Thermometer className="w-3 h-3 mr-1" />
                {entry.value?.toFixed(1)}°C
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Estadísticas rápidas para el gráfico
  const getStats = () => {
    if (chartData.length === 0) return null;

    const stats = {};
    Object.keys(CITIES).forEach((city) => {
      const temps = chartData.map((d) => d[city]).filter((t) => t != null);
      if (temps.length > 0) {
        stats[city] = {
          min: Math.min(...temps),
          max: Math.max(...temps),
          avg: temps.reduce((a, b) => a + b, 0) / temps.length,
          count: temps.length,
        };
      }
    });
    return stats;
  };

  const stats = getStats();

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

  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const start = Math.floor((current - 1) / 10) * 10 + 1;
    const end = Math.min(start + 9, total);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={2000} />
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

      {/* Confirmación de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              ¿Seguro que quieres cerrar sesión?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  confirmLogout();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Temp mínima (°C)"
              value={filters.minTemp}
              onChange={handleFilterChange}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="number"
              name="maxTemp"
              placeholder="Temp máxima (°C)"
              value={filters.maxTemp}
              onChange={handleFilterChange}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={handleApplyFilters}
              disabled={loading || chartLoading}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || chartLoading ? "Aplicando..." : "Aplicar"}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading || chartLoading}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* 🚀 GRÁFICO MEJORADO */}
        <div className="mb-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header del gráfico */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-xl font-bold flex items-center">
                <TrendingUp className="w-6 h-6 mr-3" />
                Comparación de Temperaturas por Ciudad
              </h3>
              <div className="flex items-center space-x-4 text-blue-100">
                {chartData.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {chartData.length} mediciones desde 7 Sep 2025
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-xs bg-white/20 px-3 py-1 rounded-full">
                  <span>Total registros: {temperatureData.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          {stats && Object.keys(stats).length > 0 ? (
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats).map(([city, stat]) => {
                  const cityConfig = CITIES[city];
                  return (
                    <div
                      key={city}
                      className={`${cityConfig.bgColor} p-4 rounded-lg`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-semibold ${cityConfig.textColor}`}
                        >
                          {city}
                        </span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cityConfig.color }}
                        ></div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Promedio:</span>
                          <span
                            className={`font-medium ${cityConfig.textColor}`}
                          >
                            {stat.avg.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rango:</span>
                          <span
                            className={`font-medium ${cityConfig.textColor}`}
                          >
                            {stat.min.toFixed(1)}°C - {stat.max.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mediciones:</span>
                          <span
                            className={`font-medium ${cityConfig.textColor}`}
                          >
                            {stat.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            !chartLoading &&
            chartData.length === 0 && (
              <div className="p-6 border-b border-gray-100">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Datos en procesamiento
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Se detectaron registros, pero no se pudieron procesar
                        para el gráfico. Revise la consola para más detalles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Área del gráfico */}
          <div className="p-6">
            {chartLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Cargando datos de temperatura...
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Obteniendo mediciones más recientes
                  </p>
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 80,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}°C`}
                      domain={["dataMin - 2", "dataMax + 2"]}
                    />
                    <Tooltip content={<CustomTooltipChart />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                    />

                    {/* Lines for each city */}
                    {Object.entries(CITIES).map(([city, config]) => (
                      <Line
                        key={city}
                        type="monotone"
                        dataKey={city}
                        stroke={config.color}
                        strokeWidth={3}
                        dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: config.color, strokeWidth: 2 }}
                        connectNulls={false}
                        name={city}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Thermometer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">
                    No hay datos disponibles para el gráfico
                  </h4>
                  <p className="text-gray-400 max-w-md">
                    No se encontraron mediciones de temperatura desde el 7 de
                    septiembre de 2025.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Verifique la estructura de los datos o la conexión con la
                    fuente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid de registros (mantener igual) */}
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
                      className={`text-4xl font-bold`}
                      style={{
                        color: CITIES[item.city]?.color || "#6b7280", // fallback a gris si no hay ciudad
                      }}
                    >
                      {item.temperature}°C
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

            {/* Paginación */}
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
