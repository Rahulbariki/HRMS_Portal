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

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'employment' | 'compliance' | 'all_employees'
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [directory, setDirectory] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(user?.id || 'IA-CA-001');
  const avatarInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Client',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : 'Administrator',
    fullName: user?.name ? user.name.toUpperCase() : 'CLIENT ADMINISTRATOR',
    employeeId: user?.id || 'IA-CA-001',
    email: user?.corporateEmail || 'clientadmin@intelliattend.com',
    loginEmail: user?.loginEmail || user?.email || 'clientadmin.intelliattend@gmail.com',
    phone: user?.phone || '9876543212',
    emergencyPhone: user?.emergencyPhone || '9876543288',
    emergencyContactName: user?.emergencyContactName || 'Corporate HR Desk',
    designation: user?.designation || 'CLIENT ADMINISTRATOR & OPERATIONS DIRECTOR',
    department: user?.department || 'Human Resources & Executive Admin',
    manager: user?.manager || 'Bariki Rahul (Super Admin)',
    doj: user?.doj || '15-02-2024',
    bloodGroup: user?.bloodGroup || 'A-',
    address: user?.address || 'Plot 42, Jubilee Hills, Hyderabad, TS 500033',
    dob: user?.dob || '10-03-1990',
    gender: user?.gender || 'Female',
    workLocation: user?.workLocation || 'Corporate HQ, Hyderabad',
    employmentType: user?.employmentType || 'Corporate Executive Admin',
    shift: user?.shift || 'General Executive Hours',
    panNumber: user?.panNumber || 'ERTY56789X',
    bankAccount: user?.bankAccount || '•••• •••• 6610 (HDFC Bank)',
    pfNumber: user?.pfNumber || 'PF/HYD/10920008',
    avatar: user?.avatar || 'CA',
    avatarUrl: user?.avatarUrl || '',
    company: 'IntelliAttend Technologies',
  });

  useEffect(() => {
    // 1. Fetch live user profile from Neon PostgreSQL
    api.get(`/users/profile/${user?.id || 'IA-CA-001'}`)
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setProfileData(res.data.data);
          setSelectedEmpId(res.data.data.employeeId || res.data.data.id);
        }
      })
      .catch(err => console.error('Error fetching live client profile:', err));

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
      const payload = {
        ...profileData,
        id: profileData.employeeId || profileData.id || user?.id,
        employeeId: profileData.employeeId || profileData.id || user?.id,
      };
      const res = await api.put('/users/profile', payload);
      if (res.data?.success && res.data?.data) {
        setProfileData(prev => ({ ...prev, ...res.data.data }));
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
      const newUrl = res.data?.url || res.data?.avatarUrl || res.data?.data?.url;
      if (res.data?.success && newUrl) {
        setAvatarError(false);
        setProfileData(prev => ({ ...prev, avatar: newUrl, avatarUrl: newUrl }));
        if (updateUser) updateUser({ avatar: newUrl, avatarUrl: newUrl });
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
    const isSelf = selectedEmpId === profileData.employeeId || selectedEmpId === (user?.id || 'IA-CA-001');
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

  const currentAvatarSrc = (profileData.avatarUrl && (profileData.avatarUrl.startsWith('http') || profileData.avatarUrl.startsWith('/') || profileData.avatarUrl.startsWith('data:')))
    ? profileData.avatarUrl
    : ((profileData.avatar && (profileData.avatar.startsWith('http') || profileData.avatar.startsWith('/') || profileData.avatar.startsWith('data:'))) ? profileData.avatar : null);

  useEffect(() => {
    setAvatarError(false);
  }, [currentAvatarSrc]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Client Corporate Profile & Employee ID Cards
          </h1>
          <p className="font-body mt-1 text-xs text-slate-500">
            Manage organizational identity, executive administration, and digital employee badges
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
            <span className="font-semibold">Client Administrator profile updated successfully in Neon PostgreSQL!</span>
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-teal-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive ID Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-bold text-xs text-slate-900 truncate">
                  {selectedEmpId === (user?.id || 'IA-CA-001') ? 'My Official ID Badge' : `${displayedEmployee.name}'s ID Card`}
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
              { id: 'overview', label: 'Executive Details', icon: User },
              { id: 'employment', label: 'Governance & Shifts', icon: Briefcase },
              { id: 'compliance', label: 'Compliance & Payroll', icon: CreditCard },
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
                    {currentAvatarSrc && !avatarError ? (
                      <img
                        src={currentAvatarSrc}
                        alt={profileData.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-white shadow-xs bg-slate-900 text-teal-300 flex items-center justify-center font-bold text-lg select-none">
                        {(profileData.fullName || 'User').split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
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
                      title="Upload Avatar"
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
                    <label className="block font-semibold text-slate-700 mb-1">Client Admin Login Email</label>
                    <p className="p-2.5 rounded-xl bg-slate-50 text-slate-600 font-mono text-[11px]">{profileData.loginEmail || profileData.email}</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Corporate Email</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">Primary Phone</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">Registered Address</label>
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift Pattern</span>
                  <p className="font-bold text-slate-900 mt-0.5">{profileData.shift}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Reporting Line</span>
                  <p className="font-bold text-slate-900 mt-0.5">{profileData.manager}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointment Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">{profileData.doj}</p>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Official financial accounts, tax registrations, and compliance tokens synchronized with PostgreSQL.
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payroll Settlement Account</span>
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
                          {emp.avatarUrl || (emp.avatar && typeof emp.avatar === 'string' && (emp.avatar.startsWith('http') || emp.avatar.startsWith('/') || emp.avatar.startsWith('data:'))) ? (
                            <img
                              src={emp.avatarUrl || emp.avatar}
                              alt={emp.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={clsx("w-12 h-12 rounded-full border-2 border-white shadow-2xs flex-shrink-0 bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-xs", (emp.avatarUrl || (emp.avatar && typeof emp.avatar === 'string' && (emp.avatar.startsWith('http') || emp.avatar.startsWith('/') || emp.avatar.startsWith('data:')))) ? "hidden" : "")}>
                            {emp.avatar && emp.avatar.length <= 3 ? emp.avatar : (emp.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U')}
                          </div>
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