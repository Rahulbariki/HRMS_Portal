import { useState, useMemo } from 'react';
import {
  User, Briefcase, ShieldCheck, Edit3, CheckCircle2,
  Save, CreditCard, AlertCircle, Users, Search, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeIdCard from '../../components/EmployeeIdCard';
import { ALL_EMPLOYEES } from '../../contexts/companyEmployees';

export default function ManagerProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('mgr-self');

  const [profileData, setProfileData] = useState({
    firstName: 'Aditya',
    lastName: 'Dhiman',
    fullName: 'ADITYA DHIMAN',
    employeeId: user?.id || 'SI0010',
    email: user?.email || 'aditya.dhiman@shnoor.com',
    phone: '9876543211',
    emergencyPhone: '9876543299',
    designation: 'LEAD ENGINEERING MANAGER – INFORMATION TECHNOLOGY',
    department: 'Information Technology',
    manager: 'Vivek S P (CTO)',
    doj: '12-04-2024',
    bloodGroup: 'B+',
    address: 'Hill View Enclave, Banjara Hills, Hyderabad, TS 500034',
    employmentType: 'Full-time Permanent',
    shift: 'General Day (09:00 AM - 06:30 PM)',
    panNumber: 'BNMKL9876P',
    bankAccount: '•••• •••• 1029 (ICICI Bank)',
    pfNumber: 'PF/HYD/10927711',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    company: 'SHNOOR INTERNATIONAL',
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
      fullName: field === 'firstName' || field === 'lastName'
        ? `${field === 'lastName' ? value : prev.lastName} ${field === 'firstName' ? value : prev.firstName}`.toUpperCase()
        : prev.fullName,
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const displayedEmployee = useMemo(() => {
    if (selectedEmpId === 'mgr-self') {
      return {
        name: profileData.fullName,
        designation: profileData.designation,
        employeeId: profileData.employeeId,
        email: profileData.email,
        phone: profileData.phone,
        emergencyPhone: profileData.emergencyPhone,
        doj: profileData.doj,
        bloodGroup: profileData.bloodGroup,
        avatar: profileData.avatar,
        company: profileData.company,
      };
    }
    const found = ALL_EMPLOYEES.find(e => e.employeeId === selectedEmpId || e.id === selectedEmpId);
    if (found) {
      return {
        name: found.name,
        designation: found.designation,
        employeeId: found.employeeId,
        email: found.email,
        phone: found.phone,
        emergencyPhone: found.emergencyPhone,
        doj: found.doj,
        bloodGroup: found.bloodGroup,
        avatar: found.avatar,
        company: found.company || 'SHNOOR INTERNATIONAL',
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
      avatar: profileData.avatar,
      company: profileData.company,
    };
  }, [selectedEmpId, profileData]);

  const filteredDirectory = useMemo(() => {
    if (!directorySearch.trim()) return ALL_EMPLOYEES;
    const q = directorySearch.toLowerCase();
    return ALL_EMPLOYEES.filter(
      emp =>
        emp.name.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
    );
  }, [directorySearch]);

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
          {activeTab !== 'team_cards' && (
            isEditing ? (
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Details</span>
              </button>
            )
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Manager credentials and ID badge updated!</span>
          </div>
          <button type="button" onClick={() => setSaveSuccess(false)} className="text-emerald-600 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left = Official ID Card, Right = Profile Center tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): The Exact Official ID Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-bold text-xs text-slate-900 truncate">
                  {selectedEmpId === 'mgr-self' ? 'My Manager ID Badge' : `${displayedEmployee.name}'s ID Card`}
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 pr-6 cursor-pointer hover:bg-slate-100 transition appearance-none"
                >
                  <option value="mgr-self">Aditya Dhiman (My ID)</option>
                  <option value="SI0121">Rahul Bariki (SI0121)</option>
                  {ALL_EMPLOYEES.filter(e => e.employeeId !== 'SI0121' && e.employeeId !== 'SI0010').map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>

            <EmployeeIdCard employee={displayedEmployee} showActions={true} />
          </div>
        </div>

        {/* Right Column (7 Cols): Profile Details */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 pt-2 gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Personal Information', icon: User },
              { id: 'employment', label: 'Leadership Record', icon: Briefcase },
              { id: 'compliance', label: 'Statutory & Bank', icon: CreditCard },
              { id: 'team_cards', label: 'Team Member ID Cards', icon: Users, badge: ALL_EMPLOYEES.length },
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
                      ? 'border-amber-600 text-amber-900 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  <Icon className={clsx('w-3.5 h-3.5', isActive ? 'text-amber-600' : 'text-slate-400')} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={clsx(
                      'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                      isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/70">
                  <img
                    src={profileData.avatar}
                    alt={profileData.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">{profileData.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{profileData.designation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-amber-800 border border-amber-200">
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
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20"
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
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                    <p className="p-2.5 rounded-xl bg-slate-50 text-slate-600 font-mono text-[11px]">{profileData.email}</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20"
                      />
                    ) : (
                      <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold">{profileData.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                    <p className="p-2.5 rounded-xl bg-slate-50 text-slate-800 font-medium">{profileData.address}</p>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'employment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</span>
                  <p className="font-extrabold text-sm text-slate-900 mt-0.5">{profileData.employeeId}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                  <p className="font-bold text-slate-900 mt-0.5">{profileData.department}</p>
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
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Statutory tax identifiers and bank accounts for leadership payroll.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN Number</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{profileData.panNumber}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Account</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{profileData.bankAccount}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team_cards' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search direct report or employee..."
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {filteredDirectory.map((emp) => {
                    const isSelected = selectedEmpId === emp.employeeId;
                    return (
                      <div
                        key={emp.employeeId}
                        onClick={() => setSelectedEmpId(emp.employeeId)}
                        className={clsx(
                          'p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-left group hover:shadow-md',
                          isSelected
                            ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs flex-shrink-0"
                            onError={(e) => {
                              e.target.src = '/avatar_rahul.png';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700 transition truncate">
                              {emp.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                              {emp.designation}
                            </p>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mt-1 inline-block">
                              {emp.employeeId}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={clsx(
                            'px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex-shrink-0 transition',
                            isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
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