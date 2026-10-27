import { useState, useMemo, useEffect, useRef } from 'react';
import {
  User, Briefcase, ShieldCheck, Edit3, CheckCircle2,
  Save, CreditCard, AlertCircle, Users, Search, ChevronDown,
  Camera, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeIdCard from '../../components/EmployeeIdCard';
import api from '../../services/api';

export default function ManagerProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'employment' | 'compliance' | 'all_employees'
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directory, setDirectory] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(user?.id || 'IA-MG-001');
  const avatarInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'David',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : 'Chen',
    fullName: user?.name ? user.name.toUpperCase() : 'DAVID CHEN',
    employeeId: user?.id || 'IA-MG-001',
    email: user?.corporateEmail || 'manager@intelliattend.com',
    loginEmail: user?.loginEmail || user?.email || 'manager.intelliattend@gmail.com',
    phone: user?.phone || '9876543211',
    emergencyPhone: user?.emergencyPhone || '9876543299',
    emergencyContactName: user?.emergencyContactName || 'Operations Lead',
    designation: user?.designation || 'LEAD ENGINEERING & DELIVERY DIRECTOR',
    department: user?.department || 'Engineering & Technology',
    manager: user?.manager || 'Client Administrator',
    doj: user?.doj || '12-04-2024',
    bloodGroup: user?.bloodGroup || 'B+',
    address: user?.address || 'Hill View Enclave, Banjara Hills, Hyderabad, TS 500034',
    dob: user?.dob || '22-09-1988',
    gender: user?.gender || 'Male',
    workLocation: user?.workLocation || 'Hyderabad Campus (On-site)',
    employmentType: user?.employmentType || 'Full-time Permanent',
    shift: user?.shift || 'General Day (09:00 AM - 06:30 PM)',
    panNumber: user?.panNumber || 'BNMKL9876P',
    bankAccount: user?.bankAccount || '•••• •••• 1029 (ICICI Bank)',
    pfNumber: user?.pfNumber || 'PF/HYD/10927711',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    avatarUrl: user?.avatarUrl || '',
    company: 'IntelliAttend Technologies',
  });

  useEffect(() => {
    // 1. Fetch live user profile from Neon PostgreSQL
    api.get(`/users/profile/${user?.id || 'IA-MG-001'}`)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setProfileData(res.data.data);
          setSelectedEmpId(res.data.data.employeeId || res.data.data.id);
        }
      })
      .catch(err => console.error('Error fetching live manager profile:', err));

    // 2. Fetch live directory from Neon PostgreSQL
    api.get('/users/directory')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setDirectory(res.data.data);
        }
      })
      .catch(err => console.error('Error fetching directory:', err));
  }, [user?.id]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
      fullName: field === 'firstName' || field === 'lastName'
        ? `${field === 'lastName' ? value : prev.lastName} ${field === 'firstName' ? value : prev.firstName}`.toUpperCase()
        : prev.fullName,
    }));
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await api.put('/users/profile', profileData);
      if (res.data?.success && res.data?.data) {
        setProfileData(res.data.data);
        if (updateUser) updateUser(res.data.data);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user?.id || profileData.employeeId);
      const res = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data?.url) {
        setProfileData(prev => ({ ...prev, avatar: res.data.url, avatarUrl: res.data.url }));
        if (updateUser) updateUser({ avatar: res.data.url, avatarUrl: res.data.url });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const displayedEmployee = useMemo(() => {
    const isSelf = selectedEmpId === profileData.employeeId || selectedEmpId === (user?.id || 'IA-MG-001');
    if (isSelf) {
      return {
        name: profileData.fullName,
        designation: profileData.designation,
        employeeId: profileData.employeeId,
        email: profileData.email,
        phone: profileData.phone,
        emergencyPhone: profileData.emergencyPhone,
        doj: profileData.doj,
        bloodGroup: profileData.bloodGroup,
        avatar: profileData.avatarUrl || profileData.avatar,
        company: profileData.company,
      };
    }
    const found = directory.find(e => e.employeeId === selectedEmpId || e.id === selectedEmpId);
    if (found) {
      return {
        name: found.name,
        designation: found.designation,
        employeeId: found.employeeId || found.id,
        email: found.corporateEmail || found.email,
        phone: found.phone,
        emergencyPhone: found.emergencyPhone,
        doj: found.doj,
        bloodGroup: found.bloodGroup,
        avatar: found.avatarUrl || found.avatar,
        company: found.company || 'IntelliAttend Technologies',
      };
    }
    return {
      name: profileData.fullName,
      designation: profileData.designation,
      employeeId: profileData.employeeId,
      email: profileData.email,
      phone: profileData.phone,
      emergencyPhone: profileData.emergencyPhone,
      doj: profileData.doj,
      bloodGroup: profileData.bloodGroup,
      avatar: profileData.avatarUrl || profileData.avatar,
      company: profileData.company,
    };
  }, [selectedEmpId, profileData, directory, user?.id]);

  const filteredDirectory = useMemo(() => {
    if (!directorySearch.trim()) return directory;
    const q = directorySearch.toLowerCase();
    return directory.filter(
      emp =>
        (emp.name && emp.name.toLowerCase().includes(q)) ||
        (emp.designation && emp.designation.toLowerCase().includes(q)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
        (emp.department && emp.department.toLowerCase().includes(q))
    );
  }, [directorySearch, directory]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Manager Profile & Team Employee ID Cards
          </h1>
          <p className="font-body mt-1 text-xs text-slate-500">
            View your leadership profile, corporate credentials, and official team digital ID badges
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab !== 'all_employees' && (
            isEditing ? (
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saveLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                <span>Edit Profile</span>
              </button>
            )
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span className="font-semibold">Manager profile updated successfully in Neon PostgreSQL!</span>
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-teal-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: ID Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-bold text-xs text-slate-900 truncate">
                  {selectedEmpId === (user?.id || 'IA-MG-001') ? 'My Leadership ID Badge' : `${displayedEmployee.name}'s ID Card`}
                </span>
              </div>

              {/* Quick Select Employee */}
              <div className="relative">
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 pr-6 cursor-pointer hover:bg-slate-100 transition appearance-none"
                >
                  <option value={profileData.employeeId}>
                    {profileData.fullName} ({profileData.employeeId})
                  </option>
                  {directory.filter(e => e.employeeId !== profileData.employeeId && e.id !== profileData.employeeId).map(emp => (
                    <option key={emp.employeeId || emp.id} value={emp.employeeId || emp.id}>
                      {emp.name} ({emp.employeeId || emp.id})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>

            <EmployeeIdCard employee={displayedEmployee} showActions={true} />
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Leadership Overview', icon: User },
              { id: 'employment', label: 'Department & Shifts', icon: Briefcase },
              { id: 'compliance', label: 'Statutory & Payroll', icon: CreditCard },
              { id: 'all_employees', label: 'Active Organization Badges', icon: Users, badge: directory.length },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap',
                    isActive
                      ? 'border-teal-500 text-slate-900 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-teal-600' : 'text-slate-400')} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={clsx(
                      'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                      isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-teal-50/50 border border-teal-200/70">
                  <div className="relative group">
                    <img
                      src={profileData.avatarUrl || profileData.avatar || '/avatar_rahul.png'}
                      alt={profileData.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                      onError={(e) => { e.target.src = '/avatar_rahul.png'; }}
                    />
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      title="Upload Avatar to Cloudinary"
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    </button>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">{profileData.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{profileData.designation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-teal-800 border border-teal-200">
                        {profileData.employeeId}
                      </span>
                      <span className="text-[11px] text-slate-500">{profileData.department}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manager Login Email</label>
                    <p className="p-2.5 rounded-xl bg-slate-50 text-slate-600 font-mono text-[11px]">{profileData.loginEmail || profileData.email}</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Corporate Work Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-mono text-[11px]">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.emergencyPhone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.bloodGroup}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.bloodGroup}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Work Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.workLocation}
                        onChange={(e) => handleInputChange('workLocation', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.workLocation}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.address}</p>
                    )}
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'employment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employment Classification</span>
                  <p className="font-extrabold text-sm text-slate-900 mt-0.5">{profileData.employmentType}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Shift</span>
                  <p className="font-bold text-slate-900 mt-0.5">{profileData.shift}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports To</span>
                  <p className="font-bold text-slate-900 mt-0.5">{profileData.manager}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Joining</span>
                  <p className="font-bold text-slate-900 mt-0.5">{profileData.doj}</p>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Statutory registrations, bank accounts, and compliance tokens synchronized with PostgreSQL.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN Identity</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{profileData.panNumber}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PF / Provident Fund Identifier</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{profileData.pfNumber}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Credit Account</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{profileData.bankAccount}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'all_employees' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search employee by name, ID, or designation..."
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {filteredDirectory.map((emp) => {
                    const empIdentifier = emp.employeeId || emp.id;
                    const isSelected = selectedEmpId === empIdentifier;
                    return (
                      <div
                        key={empIdentifier}
                        onClick={() => setSelectedEmpId(empIdentifier)}
                        className={clsx(
                          'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left group hover:shadow-md',
                          isSelected
                            ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={emp.avatarUrl || emp.avatar || '/avatar_rahul.png'}
                            alt={emp.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs flex-shrink-0"
                            onError={(e) => {
                              e.target.src = '/avatar_rahul.png';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-teal-700 transition truncate">
                              {emp.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                              {emp.designation}
                            </p>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mt-1 inline-block">
                              {empIdentifier}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={clsx(
                            'px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex-shrink-0 transition',
                            isSelected ? 'bg-slate-900 text-teal-300 shadow-xs' : 'bg-slate-100 text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-800'
                          )}
                        >
                          {isSelected ? 'Viewing' : 'View ID'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}