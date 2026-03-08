'use client';

import { useState } from 'react';
import { LogOut, ChevronRight, MapPin, Mail, Phone, Edit3, Store, HelpCircle, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateProfile({ name, city, zipCode, phone });
    setSaving(false);
    setEditOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (!user) return null;

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl font-bold text-brand-600">
            {user.name.charAt(0)}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
            Consumer
          </span>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {[
            { icon: MapPin, label: 'Location', value: user.city ? `${user.city}, ${user.zipCode || ''}` : 'Not set' },
            { icon: Mail, label: 'Email', value: user.email },
            { icon: Phone, label: 'Phone', value: user.phone || 'Not set' },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {[
            { icon: Edit3, label: 'Edit Profile', onClick: () => setEditOpen(true) },
            { icon: Bell, label: 'Notifications', onClick: () => {} },
            { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
          ].map(({ icon: Icon, label, onClick }, i) => (
            <button
              key={label}
              onClick={onClick}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-gray-400" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-700 text-left">{label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Switch to provider */}
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Store size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Have food to share?</p>
              <p className="text-xs text-gray-500 mt-0.5">Switch to a provider account and list your surplus</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl shadow-card hover:bg-red-50 text-red-500 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
            <LogOut size={14} className="text-red-400" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-3">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="ZIP Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button fullWidth onClick={handleSave} loading={saving} className="mt-2">
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
}
