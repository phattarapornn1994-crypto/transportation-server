import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Plan {
  id: number;
  name: string;
  plan_date: string;
  total_distance: number;
  total_cost: number;
  total_vehicles: number;
  status: string;
}

export default function Reports() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get('/api/plans');
      setPlans(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setLoading(false);
    }
  };

  const handleExport = async (planId: number, type: string, format: string) => {
    if (type === 'raw') {
      window.open(`/api/reports/export/${planId}/${format}`, '_blank');
    } else if (type === 'summary') {
      window.open(`/api/reports/plan-summary/${planId}/pdf`, '_blank');
    } else if (type === 'cost') {
      window.open(`/api/reports/cost-report/${planId}/excel`, '_blank');
    } else if (type === 'performance') {
      window.open(`/api/reports/performance/${planId}/${format}`, '_blank');
    }
  };

  const filteredPlans = plans.filter(plan => {
    if (!dateRange.start && !dateRange.end) return true;
    const planDate = new Date(plan.plan_date);
    if (dateRange.start && planDate < new Date(dateRange.start)) return false;
    if (dateRange.end && planDate > new Date(dateRange.end)) return false;
    return true;
  });

  const chartData = filteredPlans.map(plan => ({
    name: plan.name.substring(0, 15),
    cost: plan.total_cost || 0,
    distance: plan.total_distance || 0
  }));

  const statusData = [
    { name: 'พร้อมใช้งาน', value: plans.filter(p => p.status === 'optimized').length },
    { name: 'ยืนยันแล้ว', value: plans.filter(p => p.status === 'confirmed').length },
    { name: 'ร่าง', value: plans.filter(p => p.status === 'draft').length }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  const totalCost = filteredPlans.reduce((sum, plan) => sum + (plan.total_cost || 0), 0);
  const totalDistance = filteredPlans.reduce((sum, plan) => sum + (plan.total_distance || 0), 0);
  const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">รายงานและการวิเคราะห์</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">จำนวนแผน</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{filteredPlans.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ต้นทุนรวม</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalCost.toLocaleString()} บาท
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ระยะทางรวม</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalDistance.toFixed(2)} กม.
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ต้นทุนเฉลี่ย/กม.</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {avgCostPerKm.toFixed(2)} บาท
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">กราฟแสดงต้นทุนและระยะทาง</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#3b82f6" name="ต้นทุน (บาท)" />
              <Bar dataKey="distance" fill="#10b981" name="ระยะทาง (กม.)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">สถานะแผนการขนส่ง</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">กรองข้อมูล</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">รายการแผนการขนส่ง</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">ไม่พบข้อมูล</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อแผน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวนรถ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ระยะทาง</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ต้นทุน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/plans/${plan.id}/results`}
                        className="font-medium text-primary-600 hover:text-primary-800"
                      >
                        {plan.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{plan.plan_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{plan.total_vehicles || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {plan.total_distance ? plan.total_distance.toFixed(2) : 0} กม.
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {plan.total_cost ? plan.total_cost.toLocaleString() : 0} บาท
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        plan.status === 'optimized' ? 'bg-green-100 text-green-700' :
                        plan.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {plan.status === 'optimized' ? 'พร้อมใช้งาน' :
                         plan.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ร่าง'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExport(plan.id, 'summary', 'pdf')}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                          title="สรุปแผน (PDF)"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleExport(plan.id, 'cost', 'excel')}
                          className="text-green-600 hover:text-green-900 text-sm"
                          title="รายงานต้นทุน (Excel)"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleExport(plan.id, 'raw', 'excel')}
                          className="text-purple-600 hover:text-purple-900 text-sm"
                          title="ส่งออกข้อมูลดิบ (Excel)"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleExport(plan.id, 'performance', 'excel')}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                          title="รายงานประสิทธิภาพ (Excel)"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleExport(plan.id, 'performance', 'pdf')}
                          className="text-pink-600 hover:text-pink-900 text-sm"
                          title="รายงานประสิทธิภาพ (PDF)"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

