import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Search, Loader } from 'lucide-react';

interface Customer {
  id: number;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface PlanItem {
  customer_id: number;
  customer?: Customer;
  quantity: number;
  weight: number;
  volume: number;
  delivery_type: string;
}

export default function PlanCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    plan_date: new Date().toISOString().split('T')[0],
    origin_address: '',
    origin_latitude: null as number | null,
    origin_longitude: null as number | null
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleAddCustomer = (customer: Customer) => {
    if (planItems.find(item => item.customer_id === customer.id)) {
      alert('ลูกค้านี้ถูกเพิ่มแล้ว');
      return;
    }

    setPlanItems([...planItems, {
      customer_id: customer.id,
      customer,
      quantity: 1,
      weight: 0,
      volume: 0,
      delivery_type: 'delivery'
    }]);
    setSearchQuery('');
  };

  const handleRemoveItem = (index: number) => {
    setPlanItems(planItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...planItems];
    updated[index] = { ...updated[index], [field]: value };
    setPlanItems(updated);
  };

  const handleSavePlan = async () => {
    if (!formData.name || !formData.plan_date) {
      alert('กรุณากรอกชื่อแผนและวันที่');
      return;
    }

    if (planItems.length === 0) {
      alert('กรุณาเพิ่มลูกค้าอย่างน้อย 1 รายการ');
      return;
    }

    setLoading(true);
    try {
      const items = planItems.map(item => ({
        customer_id: item.customer_id,
        quantity: item.quantity,
        weight: item.weight,
        volume: item.volume,
        delivery_type: item.delivery_type
      }));

      const res = await axios.post('/api/plans', {
        ...formData,
        items
      });

      setPlanId(res.data.id);
      setStep(3);
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!planId) return;

    setOptimizing(true);
    try {
      await axios.post(`/api/routes/optimize/${planId}`);
      navigate(`/plans/${planId}/results`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการวิเคราะห์เส้นทาง');
      setOptimizing(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">สร้างแผนการขนส่งใหม่</h1>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-3 font-medium">กรอกข้อมูลแผน</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step >= 2 ? 'bg-primary-600' : ''}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-3 font-medium">เลือกลูกค้า</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step >= 3 ? 'bg-primary-600' : ''}`} style={{ width: step >= 3 ? '100%' : '0%' }} />
          </div>
          <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-3 font-medium">วิเคราะห์เส้นทาง</span>
          </div>
        </div>
      </div>

      {/* Step 1: Plan Info */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลแผนการขนส่ง</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อแผน *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น แผนขนส่งประจำเดือน มกราคม 2024"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่ *
              </label>
              <input
                type="date"
                value={formData.plan_date}
                onChange={(e) => setFormData({ ...formData, plan_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จุดเริ่มต้น/คลังสินค้า *
              </label>
              <input
                type="text"
                value={formData.origin_address}
                onChange={(e) => setFormData({ ...formData, origin_address: e.target.value })}
                placeholder="ที่อยู่คลังสินค้าหรือจุดเริ่มต้น"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (พิกัด GPS)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.origin_latitude || ''}
                  onChange={(e) => setFormData({ ...formData, origin_latitude: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (พิกัด GPS)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.origin_longitude || ''}
                  onChange={(e) => setFormData({ ...formData, origin_longitude: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Customers */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Search and Add Customer */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">เลือกลูกค้า</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ค้นหาลูกค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {searchQuery && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleAddCustomer(customer)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium">{customer.code} - {customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.address}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan Items Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">รายการลูกค้า ({planItems.length})</h2>
            </div>
            {planItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                ยังไม่มีรายการลูกค้า กรุณาเพิ่มลูกค้าจากช่องค้นหาด้านบน
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ลูกค้า</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ปริมาณ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">น้ำหนัก (กก.)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ปริมาตร (ลบ.ม.)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {planItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <div className="font-medium">{item.customer?.code} - {item.customer?.name}</div>
                          <div className="text-sm text-gray-500">{item.customer?.address}</div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={item.weight}
                            onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            value={item.volume}
                            onChange={(e) => handleItemChange(index, 'volume', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={item.delivery_type}
                            onChange={(e) => handleItemChange(index, 'delivery_type', e.target.value)}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="delivery">ส่งสินค้า</option>
                            <option value="pickup">รับสินค้า</option>
                            <option value="both">ส่งและรับ</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleSavePlan}
              disabled={loading || planItems.length === 0}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกและวิเคราะห์เส้นทาง'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Optimizing */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Loader className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">กำลังวิเคราะห์และสร้างเส้นทาง</h2>
          <p className="text-gray-600 mb-6">กรุณารอสักครู่...</p>
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {optimizing ? 'กำลังวิเคราะห์...' : 'วิเคราะห์และสร้างเส้นทาง'}
          </button>
        </div>
      )}
    </div>
  );
}

