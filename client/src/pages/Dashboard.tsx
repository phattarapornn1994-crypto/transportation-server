import { Link } from 'react-router-dom';
import { Users, Truck, Route, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    plans: 0,
    totalCost: 0
  });

  const [recentPlans, setRecentPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentPlans();
  }, []);

  const fetchStats = async () => {
    try {
      const [customersRes, vehiclesRes, plansRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/vehicles'),
        axios.get('/api/plans')
      ]);

      const totalCost = plansRes.data.reduce((sum: number, plan: any) => sum + (plan.total_cost || 0), 0);

      setStats({
        customers: customersRes.data.length,
        vehicles: vehiclesRes.data.length,
        plans: plansRes.data.length,
        totalCost
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentPlans = async () => {
    try {
      const res = await axios.get('/api/plans');
      setRecentPlans(res.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch recent plans:', error);
    }
  };

  const chartData = recentPlans.map(plan => ({
    name: plan.name.substring(0, 10),
    cost: plan.total_cost || 0,
    distance: plan.total_distance || 0
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">แดชบอร์ด</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/customers" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ลูกค้า</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.customers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </Link>

        <Link to="/vehicles" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">รถขนส่ง</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.vehicles}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Truck className="text-green-600" size={24} />
            </div>
          </div>
        </Link>

        <Link to="/plans/create" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">แผนการขนส่ง</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.plans}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Route className="text-purple-600" size={24} />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">ต้นทุนรวม</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalCost.toLocaleString()} บาท
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
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

        {/* Recent Plans */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">แผนการขนส่งล่าสุด</h2>
          <div className="space-y-3">
            {recentPlans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">ยังไม่มีแผนการขนส่ง</p>
            ) : (
              recentPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}/results`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{plan.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{plan.plan_date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      plan.status === 'optimized' ? 'bg-green-100 text-green-700' :
                      plan.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.status === 'optimized' ? 'พร้อมใช้งาน' :
                       plan.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ร่าง'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

