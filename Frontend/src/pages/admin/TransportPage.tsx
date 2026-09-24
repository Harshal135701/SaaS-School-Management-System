import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bus,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  Car,
  Phone,
  User,
  Route,
  CheckCircle2,
  CircleOff,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

interface VehicleItem {
  id: string;
  franchiseId: string;
  vehicleNumber: string;
  vehicleType: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  status: string;
}

interface RouteItem {
  id: string;
  franchiseId: string;
  vehicleId: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  stops?: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  vehicle?: {
    id: string;
    vehicleNumber: string;
    vehicleType: string;
  };
}

export const TransportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'vehicles'>('routes');
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  const isTeacher = userStr ? ['TEACHER', 'HOD'].includes(JSON.parse(userStr)?.role) : false;
  console.log(isTeacher);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [routesRes, vehiclesRes] = await Promise.all([
        api.get('/franchise/transport-routes'),
        api.get('/franchise/vehicles'),
      ]);

      if (routesRes.data?.success && Array.isArray(routesRes.data.data)) {
        setRoutes(routesRes.data.data);
      } else {
        setRoutes([]);
      }

      if (vehiclesRes.data?.success && Array.isArray(vehiclesRes.data.data)) {
        setVehicles(vehiclesRes.data.data);
      } else {
        setVehicles([]);
      }
    } catch (err: any) {
      console.error('Error fetching transport data:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load transport records.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.status?.toLowerCase() === 'active'
      ).length,
    [vehicles]
  );

  const inactiveVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) =>
          vehicle.status?.toLowerCase() !== 'active'
      ).length,
    [vehicles]
  );

  const activeRoutes = useMemo(
    () =>
      routes.filter(
        (route) =>
          route.status?.toLowerCase() === 'active'
      ).length,
    [routes]
  );

  const filteredRoutes = routes.filter((route) => {
    const query = search.toLowerCase();

    return (
      route.routeName?.toLowerCase().includes(query) ||
      route.startPoint?.toLowerCase().includes(query) ||
      route.endPoint?.toLowerCase().includes(query) ||
      route.vehicle?.vehicleNumber?.toLowerCase().includes(query)
    );
  });

  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = search.toLowerCase();

    return (
      vehicle.vehicleNumber?.toLowerCase().includes(query) ||
      vehicle.driverName?.toLowerCase().includes(query) ||
      vehicle.vehicleType?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bus className="w-7 h-7 text-blue-600" />
            Transport Dashboard
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            View school vehicles, routes, drivers and transport schedules.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>

          <button
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card padding="md" className="border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total Vehicles
              </p>

              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {vehicles.length}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Registered vehicles
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card padding="md" className="border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total Routes
              </p>

              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {routes.length}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Registered routes
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Route className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card padding="md" className="border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Active Vehicles
              </p>

              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {activeVehicles}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Currently active
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card padding="md" className="border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Active Routes
              </p>

              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {activeRoutes}
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Currently active
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </Card>

      </div>

      {/* ADDITIONAL STATUS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500">
                Active Vehicles
              </p>

              <p className="text-lg font-extrabold text-slate-900">
                {activeVehicles}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <CircleOff className="w-5 h-5 text-slate-500" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500">
                Inactive Vehicles
              </p>

              <p className="text-lg font-extrabold text-slate-900">
                {inactiveVehicles}
              </p>
            </div>
          </div>
        </Card>

      </div>

      {/* TABS + SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">

          <button
            onClick={() => {
              setActiveTab('routes');
              setSearch('');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Routes ({routes.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('vehicles');
              setSearch('');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'vehicles'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vehicles ({vehicles.length})
          </button>

        </div>

        <div className="relative max-w-md w-full sm:w-72">

          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'routes'
                ? 'Search routes...'
                : 'Search vehicles...'
            }
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
          />

        </div>

      </div>

      {/* ROUTES */}
      {activeTab === 'routes' && (
        <>
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              Loading routes...
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-6">

              <Bus className="w-10 h-10 text-slate-300 mx-auto mb-2" />

              <p className="text-sm font-bold text-slate-700">
                No transport routes found
              </p>

              <p className="text-xs text-slate-400 mt-1">
                No route records are currently available.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {filteredRoutes.map((route) => (
                <Card
                  key={route.id}
                  hoverLift
                  padding="md"
                  className="flex flex-col justify-between space-y-3"
                >

                  <div>

                    <div className="flex items-start justify-between">

                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold uppercase tracking-wide border border-emerald-100">
                        {route.vehicle?.vehicleNumber || 'Vehicle'}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {route.status}
                      </span>

                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mt-3">
                      {route.routeName}
                    </h3>

                    <div className="space-y-2 mt-3 text-xs text-slate-600">

                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />

                        <span>
                          {route.startPoint} → {route.endPoint}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                        <span>
                          {route.departureTime} - {route.arrivalTime}
                        </span>
                      </div>

                      {route.stops && (
                        <div className="text-[11px] text-slate-400">
                          <strong>Stops:</strong> {route.stops}
                        </div>
                      )}

                    </div>

                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">

                    <span>
                      Vehicle Type:{' '}
                      <strong className="text-slate-700">
                        {route.vehicle?.vehicleType || 'N/A'}
                      </strong>
                    </span>

                    <span className="text-emerald-600 font-extrabold">
                      {route.status}
                    </span>

                  </div>

                </Card>
              ))}

            </div>
          )}
        </>
      )}

      {/* VEHICLES */}
      {activeTab === 'vehicles' && (
        <>
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              Loading vehicles...
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-6">

              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />

              <p className="text-sm font-bold text-slate-700">
                No vehicles found
              </p>

              <p className="text-xs text-slate-400 mt-1">
                No vehicle records are currently available.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  hoverLift
                  padding="md"
                  className="flex flex-col justify-between space-y-3"
                >

                  <div>

                    <div className="flex items-start justify-between">

                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wide border border-blue-100">
                        {vehicle.vehicleType}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {vehicle.status}
                      </span>

                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mt-3">
                      {vehicle.vehicleNumber}
                    </h3>

                    <div className="space-y-2 mt-3 text-xs text-slate-600">

                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                        <span>
                          Driver:{' '}
                          <strong className="text-slate-800">
                            {vehicle.driverName}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                        <span>
                          {vehicle.driverPhone}
                        </span>
                      </div>

                    </div>

                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">

                    <span>
                      Capacity: {vehicle.capacity} seats
                    </span>

                    <span className="text-emerald-600 font-extrabold text-[11px]">
                      {vehicle.status}
                    </span>

                  </div>

                </Card>
              ))}

            </div>
          )}
        </>
      )}

    </div>
  );
};