import React, { useCallback, useEffect, useState } from 'react';
import {
  Bus,
  Plus,
  Search,
  RefreshCw,
  X,
  Trash2,
  Clock,
  MapPin,
  Car,
  Phone,
  User
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const [routeForm, setRouteForm] = useState({
    vehicleId: '',
    routeName: '',
    startPoint: '',
    endPoint: '',
    stops: '',
    departureTime: '',
    arrivalTime: '',
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    vehicleType: 'BUS',
    capacity: '30',
    driverName: '',
    driverPhone: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [routesRes, vehiclesRes] = await Promise.all([
        api.get('/franchise/transport-routes').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/franchise/vehicles').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (routesRes.data?.success && Array.isArray(routesRes.data.data)) {
        setRoutes(routesRes.data.data);
      }
      if (vehiclesRes.data?.success && Array.isArray(vehiclesRes.data.data)) {
        setVehicles(vehiclesRes.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching transport data:', err);
      setError('Failed to load transport records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.vehicleId || !routeForm.routeName || !routeForm.startPoint || !routeForm.endPoint || !routeForm.departureTime || !routeForm.arrivalTime) {
      setError('All route fields including times and vehicle are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.post('/franchise/transport-routes', {
        vehicleId: routeForm.vehicleId,
        routeName: routeForm.routeName.trim(),
        startPoint: routeForm.startPoint.trim(),
        endPoint: routeForm.endPoint.trim(),
        stops: routeForm.stops.trim() || undefined,
        departureTime: routeForm.departureTime,
        arrivalTime: routeForm.arrivalTime,
      });

      setIsRouteModalOpen(false);
      setRouteForm({ vehicleId: '', routeName: '', startPoint: '', endPoint: '', stops: '', departureTime: '', arrivalTime: '' });
      await fetchData();
    } catch (err: any) {
      console.error('Error creating route:', err);
      setError(err.response?.data?.message || 'Failed to create route.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.vehicleNumber || !vehicleForm.driverName || !vehicleForm.driverPhone) {
      setError('Vehicle number, driver name and phone are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.post('/franchise/vehicles', {
        vehicleNumber: vehicleForm.vehicleNumber.trim(),
        vehicleType: vehicleForm.vehicleType,
        capacity: parseInt(vehicleForm.capacity, 10) || 20,
        driverName: vehicleForm.driverName.trim(),
        driverPhone: vehicleForm.driverPhone.trim(),
      });

      setIsVehicleModalOpen(false);
      setVehicleForm({ vehicleNumber: '', vehicleType: 'BUS', capacity: '30', driverName: '', driverPhone: '' });
      await fetchData();
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      setError(err.response?.data?.message || 'Failed to create vehicle.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async (r: RouteItem) => {
    if (!window.confirm(`Delete route "${r.routeName}"?`)) return;
    try {
      await api.delete(`/franchise/transport-routes/${r.id}`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete route.');
    }
  };

  const handleDeleteVehicle = async (v: VehicleItem) => {
    if (!window.confirm(`Delete vehicle "${v.vehicleNumber}"?`)) return;
    try {
      await api.delete(`/franchise/vehicles/${v.id}`);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.routeName.toLowerCase().includes(search.toLowerCase()) ||
      r.startPoint.toLowerCase().includes(search.toLowerCase()) ||
      r.endPoint.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.driverName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bus className="w-7 h-7 text-blue-600" />
            School Transport & Fleets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage school buses, vans, pickup routes, drivers, and schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Refresh transport"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {activeTab === 'routes' ? (
            <button
              onClick={() => setIsRouteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Route
            </button>
          ) : (
            <button
              onClick={() => setIsVehicleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'routes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Routes ({routes.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'vehicles' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
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
            placeholder={activeTab === 'routes' ? 'Search routes...' : 'Search vehicles...'}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ROUTES TAB */}
      {activeTab === 'routes' && (
        loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading routes...</div>
        ) : filteredRoutes.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-6">
            <Bus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No transport routes defined</p>
            <p className="text-xs text-slate-400 mt-1">
              {vehicles.length === 0 ? 'First add a vehicle in the Vehicles tab, then create routes.' : 'Click "Add Route" to establish student transit routes.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map((r) => (
              <Card key={r.id} hoverLift padding="md" className="flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-extrabold uppercase tracking-wide border border-emerald-100">
                      {r.vehicle?.vehicleNumber || 'Vehicle'}
                    </span>
                    <button
                      onClick={() => handleDeleteRoute(r)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Delete Route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-3">{r.routeName}</h3>
                  <div className="space-y-1 mt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{r.startPoint} → {r.endPoint}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{r.departureTime} - {r.arrivalTime}</span>
                    </div>
                    {r.stops && (
                      <p className="text-[11px] text-slate-400 mt-1">Stops: {r.stops}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Status: <strong className="text-emerald-600">{r.status}</strong></span>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* VEHICLES TAB */}
      {activeTab === 'vehicles' && (
        loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading vehicles...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 p-6">
            <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No vehicles found</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Vehicle" to register your school buses and vans.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((v) => (
              <Card key={v.id} hoverLift padding="md" className="flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wide border border-blue-100">
                      {v.vehicleType}
                    </span>
                    <button
                      onClick={() => handleDeleteVehicle(v)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-3">{v.vehicleNumber}</h3>
                  <div className="space-y-1 mt-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Driver: <strong className="text-slate-800">{v.driverName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{v.driverPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Capacity: {v.capacity} seats</span>
                  <span className="text-emerald-600 font-extrabold text-[11px]">{v.status}</span>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* CREATE ROUTE MODAL */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Add Transport Route</h2>
              <button onClick={() => setIsRouteModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Vehicle *</label>
                <select
                  value={routeForm.vehicleId}
                  onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 bg-white font-medium"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber} ({v.vehicleType}) - Driver: {v.driverName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Route Name *</label>
                <input
                  type="text"
                  value={routeForm.routeName}
                  onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                  placeholder="e.g. Route 4 - North Suburbs"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Start Point *</label>
                  <input
                    type="text"
                    value={routeForm.startPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                    placeholder="e.g. Central Station"
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">End Point *</label>
                  <input
                    type="text"
                    value={routeForm.endPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, endPoint: e.target.value })}
                    placeholder="e.g. School Campus"
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Departure Time *</label>
                  <input
                    type="time"
                    value={routeForm.departureTime}
                    onChange={(e) => setRouteForm({ ...routeForm, departureTime: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Arrival Time *</label>
                  <input
                    type="time"
                    value={routeForm.arrivalTime}
                    onChange={(e) => setRouteForm({ ...routeForm, arrivalTime: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Intermediate Stops</label>
                <input
                  type="text"
                  value={routeForm.stops}
                  onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })}
                  placeholder="e.g. Stop A, Stop B, Stop C"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRouteModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE VEHICLE MODAL */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Add Vehicle</h2>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  value={vehicleForm.vehicleNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                  placeholder="e.g. MH-12-AB-1234"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Vehicle Type *</label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 bg-white font-medium"
                  >
                    <option value="BUS">BUS</option>
                    <option value="VAN">VAN</option>
                    <option value="MINI_BUS">MINI BUS</option>
                    <option value="CAR">CAR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Capacity (Seats) *</label>
                  <input
                    type="number"
                    min="1"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Driver Name *</label>
                <input
                  type="text"
                  value={vehicleForm.driverName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Driver Phone *</label>
                <input
                  type="text"
                  value={vehicleForm.driverPhone}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
