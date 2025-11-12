import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, Edit, CheckCircle, MapPin, Truck, DollarSign, Route as RouteIcon } from 'lucide-react';

interface Route {
  id: number;
  route_sequence: number;
  license_plate: string;
  vehicle_type: string;
  total_distance: number;
  total_cost: number;
  stops: Array<{
    id: number;
    stop_sequence: number;
    stop_type: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
}

interface Plan {
  id: number;
  name: string;
  plan_date: string;
  origin_address: string;
  total_distance: number;
  total_cost: number;
  total_vehicles: number;
  status: string;
}

export default function PlanResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPlan();
      fetchRoutes();
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      const res = await axios.get(`/api/plans/${id}`);
      setPlan(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch plan:', error);
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await axios.get(`/api/routes/plan/${id}`);
      setRoutes(res.data);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const handleDownloadReport = (type: string) => {
    if (type === 'summary-pdf') {
      window.open(`/api/reports/plan-summary/${id}/pdf`, '_blank');
    } else if (type === 'cost-excel') {
      window.open(`/api/reports/cost-report/${id}/excel`, '_blank');
    } else if (type === 'performance-excel') {
      window.open(`/api/reports/performance/${id}/excel`, '_blank');
    } else if (type === 'performance-pdf') {
      window.open(`/api/reports/performance/${id}/pdf`, '_blank');
    }
  };

  const handleDownloadDriverOrder = (routeId: number) => {
    window.open(`/api/reports/driver-order/${routeId}/pdf`, '_blank');
  };

  const handleConfirmPlan = async () => {
    try {
      await axios.put(`/api/plans/${id}`, { status: 'confirmed' });
      alert('ยืนยันแผนการขนส่งเรียบร้อยแล้ว');
      fetchPlan();
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (loading) {
    return <div className="text-center py-12">กำลังโหลด...</div>;
  }

  if (!plan) {
    return <div className="text-center py-12">ไม่พบข้อมูลแผน</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{plan.name}</h1>
          <p className="text-gray-600 mt-1">วันที่: {plan.plan_date}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/plans/create')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <Edit size={18} />
            แก้ไขแผน
          </button>
          <button
            onClick={handleConfirmPlan}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle size={18} />
            ยืนยันแผน
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">จำนวนรถ</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{plan.total_vehicles || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Truck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ระยะทางรวม</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {plan.total_distance ? plan.total_distance.toFixed(2) : 0} กม.
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <RouteIcon className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ต้นทุนรวม</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {plan.total_cost ? plan.total_cost.toLocaleString() : 0} บาท
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <DollarSign className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">จุดเริ่มต้น</p>
              <p className="text-sm font-medium text-gray-800 mt-2 truncate max-w-[150px]">
                {plan.origin_address}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <MapPin className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Export Reports */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ส่งออกรายงาน</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDownloadReport('summary-pdf')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Download size={18} />
            สรุปแผนการขนส่ง (PDF)
          </button>
          <button
            onClick={() => handleDownloadReport('cost-excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={18} />
            รายงานต้นทุน (Excel)
          </button>
          <button
            onClick={() => handleDownloadReport('performance-excel')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Download size={18} />
            รายงานประสิทธิภาพ (Excel)
          </button>
          <button
            onClick={() => handleDownloadReport('performance-pdf')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Download size={18} />
            รายงานประสิทธิภาพ (PDF)
          </button>
        </div>
      </div>

      {/* Routes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">รายละเอียดเส้นทาง</h2>
        {routes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            ยังไม่มีเส้นทางที่ถูกวิเคราะห์ กรุณากลับไปสร้างแผนใหม่
          </div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      เส้นทางที่ {route.route_sequence}: {route.license_plate}
                    </h3>
                    <p className="text-gray-600 mt-1">{route.vehicle_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">ระยะทาง</p>
                    <p className="text-lg font-bold text-gray-800">{route.total_distance.toFixed(2)} กม.</p>
                    <p className="text-sm text-gray-500 mt-1">ต้นทุน</p>
                    <p className="text-lg font-bold text-green-600">{route.total_cost.toLocaleString()} บาท</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">ลำดับการเดินทาง</h4>
                  <button
                    onClick={() => handleDownloadDriverOrder(route.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <Download size={16} />
                    ดาวน์โหลดคำสั่งงาน
                  </button>
                </div>

                <div className="space-y-3">
                  {route.stops.map((stop) => (
                    <div key={stop.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                        {stop.stop_sequence}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-800">
                            {stop.stop_type === 'origin' ? 'จุดเริ่มต้น' : stop.name || stop.address}
                          </h5>
                          <span className={`px-2 py-1 rounded text-xs ${
                            stop.stop_type === 'origin' ? 'bg-blue-100 text-blue-700' :
                            stop.stop_type === 'delivery' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {stop.stop_type === 'origin' ? 'จุดเริ่มต้น' :
                             stop.stop_type === 'delivery' ? 'ส่งสินค้า' :
                             stop.stop_type === 'pickup' ? 'รับสินค้า' : stop.stop_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{stop.address}</p>
                        {stop.latitude && stop.longitude && (
                          <p className="text-xs text-gray-500 mt-1">
                            GPS: {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map placeholder */}
                <div className="mt-6 border rounded-lg bg-gray-100 h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MapPin size={48} className="mx-auto mb-2 text-gray-400" />
                    <p>แผนที่แสดงเส้นทาง</p>
                    <p className="text-sm">(พร้อมสำหรับเชื่อมต่อ Map Service)</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

