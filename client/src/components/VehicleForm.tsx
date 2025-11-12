import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface Vehicle {
  id?: number;
  license_plate: string;
  vehicle_type: string;
  capacity_weight: number | null;
  capacity_volume: number | null;
  ownership_type: string;
  cost_per_km: number | null;
  status: string;
}

interface VehicleFormProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export default function VehicleForm({ vehicle, onClose }: VehicleFormProps) {
  const [formData, setFormData] = useState<Vehicle>({
    license_plate: '',
    vehicle_type: '',
    capacity_weight: null,
    capacity_volume: null,
    ownership_type: '',
    cost_per_km: null,
    status: 'available'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (vehicle?.id) {
        await axios.put(`/api/vehicles/${vehicle.id}`, formData);
      } else {
        await axios.post('/api/vehicles', formData);
      }
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? parseFloat(value) : null
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {vehicle ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ทะเบียนรถ *
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทรถ *
              </label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">เลือกประเภท</option>
                <option value="รถกระบะ">รถกระบะ</option>
                <option value="รถตู้">รถตู้</option>
                <option value="รถบรรทุก 4 ล้อ">รถบรรทุก 4 ล้อ</option>
                <option value="รถบรรทุก 6 ล้อ">รถบรรทุก 6 ล้อ</option>
                <option value="รถบรรทุก 10 ล้อ">รถบรรทุก 10 ล้อ</option>
                <option value="รถพ่วง">รถพ่วง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความจุน้ำหนัก (กก.)
              </label>
              <input
                type="number"
                step="0.01"
                name="capacity_weight"
                value={formData.capacity_weight || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความจุปริมาตร (ลบ.ม.)
              </label>
              <input
                type="number"
                step="0.01"
                name="capacity_volume"
                value={formData.capacity_volume || ''}
                onChange={handleNumberChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทความเป็นเจ้าของ *
              </label>
              <select
                name="ownership_type"
                value={formData.ownership_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">เลือกประเภท</option>
                <option value="company">บริษัท</option>
                <option value="contractor">รับจ้าง</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ต้นทุนต่อกิโลเมตร (บาท) *
              </label>
              <input
                type="number"
                step="0.01"
                name="cost_per_km"
                value={formData.cost_per_km || ''}
                onChange={handleNumberChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="available">พร้อมใช้งาน</option>
              <option value="in_use">ใช้งานอยู่</option>
              <option value="maintenance">ซ่อมบำรุง</option>
              <option value="unavailable">ไม่พร้อมใช้งาน</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

