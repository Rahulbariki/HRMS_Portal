import { useState, useRef, useMemo } from 'react';
import {
  Search, ZoomIn, ZoomOut,
  List, GitFork, ChevronDown, ChevronRight, Check
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeIdCard from '../../components/EmployeeIdCard';

// Hierarchical company org data
const ORG_DATA = {
  id: 'exec-1',
  name: 'Vivek S P',
  designation: 'Chief Technology Officer',
  department: 'Management',
  email: 'vivek.sp@intelliattend.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  totalReports: 39,
  children: [
    {
      id: 'mgr-1',
      name: 'Aditya Dhiman',
      designation: 'Lead Engineering Manager',
      department: 'Information Technology',
      email: 'aditya.dhiman@intelliattend.com',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      totalReports: 12,
      children: [
        {
          id: 'emp-rahul-01',
          name: 'Rahul Bariki',
          designation: 'Software Development Engineer',
          department: 'Information Technology',
          email: 'rahul.bariki@intelliattend.com',
          phone: '+91 98765 43220',
          avatar: '/avatar_rahul.png',
          isCurrentUser: true,
          totalReports: 0,
        },
        {
          id: 'emp-2',
          name: 'Edara Saichand',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'saichand.e@intelliattend.com',
          phone: '+91 98765 43221',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-3',
          name: 'Faisal Khan Khan',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'faisal.k@intelliattend.com',
          phone: '+91 98765 43222',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-4',
          name: 'GEDDALA PAVANI',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'pavani.g@intelliattend.com',
          phone: '+91 98765 43223',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-5',
          name: 'GUTTI KALYAN BABU',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'kalyan.g@intelliattend.com',
          phone: '+91 98765 43224',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-6',
          name: 'Harish Gopal',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'harish.g@intelliattend.com',
          phone: '+91 98765 43225',
          avatar: null,
          initials: 'HG',
          totalReports: 0,
        },
        {
          id: 'emp-7',
          name: 'Hitesh Neelisetty Venkata',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'hitesh.n@intelliattend.com',
          phone: '+91 98765 43226',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-8',
          name: 'Jashandeep Singh',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'jashandeep.s@intelliattend.com',
          phone: '+91 98765 43227',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-9',
          name: 'JEYA KARTHIK G',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'karthik.j@intelliattend.com',
          phone: '+91 98765 43228',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-10',
          name: 'K Sri Lakshmi',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'srilakshmi.k@intelliattend.com',
          phone: '+91 98765 43229',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-11',
          name: 'Kishore R',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'kishore.r@intelliattend.com',
          phone: '+91 98765 43230',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-12',
          name: 'Mahesh Ramadi',
          designation: 'Intern - Software Development Engineer',
          department: 'Information Technology',
          email: 'mahesh.r@intelliattend.com',
          phone: '+91 98765 43231',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
      ],
    },
    {
      id: 'mgr-2',
      name: 'Sarah Jenkins',
      designation: 'HR & People Operations Director',
      department: 'Human Resources',
      email: 'sarah.j@intelliattend.com',
      phone: '+91 98765 43212',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      totalReports: 4,
      children: [
        {
          id: 'emp-hr-1',
          name: 'Pooja Sharma',
          designation: 'HR Operations Specialist',
          department: 'Human Resources',
          email: 'pooja.s@intelliattend.com',
          phone: '+91 98765 43232',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
        {
          id: 'emp-hr-2',
          name: 'Rohan Mehra',
          designation: 'Talent Acquisition Executive',
          department: 'Human Resources',
          email: 'rohan.m@intelliattend.com',
          phone: '+91 98765 43233',
          avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
          totalReports: 0,
        },
      ],
    },
  ],
};

function flattenTree(node, depth = 0, path = []) {
  const currentPath = [...path, node.id];
  let list = [{ ...node, depth, path: currentPath }];
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      list = list.concat(flattenTree(child, depth + 1, currentPath));
    });
  }
  return list;
}

export default function EmployeeOrgChart() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [showOnlyMyBranch, setShowOnlyMyBranch] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Filter or show only my branch
  const activeTree = useMemo(() => {
    if (!showOnlyMyBranch) return ORG_DATA;
    // Return only branch containing user
    const userBranch = {
      ...ORG_DATA,
      children: ORG_DATA.children.filter(c => c.id === 'mgr-1'),
    };
    return userBranch;
  }, [showOnlyMyBranch]);

  // Flattened list for list view or search
  const flattenedEmployees = useMemo(() => {
    return flattenTree(activeTree);
  }, [activeTree]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return flattenedEmployees;
    const q = searchQuery.toLowerCase();
    return flattenedEmployees.filter(
      emp =>
        emp.name.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
    );
  }, [flattenedEmployees, searchQuery]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.4));
  const handleReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };
  const handleFit = () => {
    setZoomLevel(0.85);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleCollapse = (nodeId) => {
    setCollapsedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleExpandAll = () => setCollapsedNodes({});
  const handleCollapseAll = () => {
    const allIds = {};
    flattenedEmployees.forEach(emp => {
      if (emp.children && emp.children.length > 0) {
        allIds[emp.id] = true;
      }
    });
    setCollapsedNodes(allIds);
  };

  const handleJumpToMe = () => {
    setShowOnlyMyBranch(false);
    setCollapsedNodes({});
    // Center pan on the user node
    setPanPosition({ x: 0, y: 0 });
    setZoomLevel(1);
    const meNode = flattenedEmployees.find(e => e.isCurrentUser || e.name.toLowerCase().includes('rahul'));
    if (meNode) {
      setSelectedNode(meNode);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Organisation Chart
        </h1>
        <p className="font-body mt-1 text-xs text-slate-500">
          See where you fit in the company.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, designation or department"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleJumpToMe}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer shadow-xs hover:border-slate-300"
          >
            Jump to me
          </button>
          <button
            type="button"
            onClick={() => setShowOnlyMyBranch(!showOnlyMyBranch)}
            className={clsx(
              'px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer shadow-xs',
              showOnlyMyBranch
                ? 'border-amber-500 bg-amber-50 text-amber-700 font-semibold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            )}
          >
            Show only my branch
          </button>
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer shadow-xs"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer shadow-xs"
          >
            Collapse all
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'tree' ? 'list' : 'tree')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer shadow-xs"
          >
            {viewMode === 'tree' ? (
              <>
                <List className="h-3.5 w-3.5 text-slate-500" />
                <span>List view</span>
              </>
            ) : (
              <>
                <GitFork className="h-3.5 w-3.5 text-slate-500" />
                <span>Tree view</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas / Chart Container */}
      {viewMode === 'tree' ? (
        <div className="relative bg-slate-50/70 border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[680px] flex flex-col select-none">
          {/* Zoom & Fit Toolbar */}
          <div className="absolute top-4 right-4 z-20 flex items-center bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-1 gap-1">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              type="button"
              onClick={handleFit}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Reset
            </button>
          </div>

          {/* Interactive Pan/Zoom Canvas */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={clsx(
              'flex-1 w-full h-full overflow-auto cursor-grab relative flex items-start justify-center p-12 transition-transform duration-75',
              isDragging && 'cursor-grabbing'
            )}
          >
            <div
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
              className="flex flex-col items-center"
            >
              <OrgTreeNode
                node={activeTree}
                collapsedNodes={collapsedNodes}
                onToggleCollapse={toggleCollapse}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                searchQuery={searchQuery}
                currentUserId={user?.id}
              />
            </div>
          </div>

          {/* Bottom Hint Text */}
          <div className="bg-white/90 backdrop-blur-sm border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Use the scrollbars or click and drag to move around. Hold Ctrl/Cmd and scroll to zoom.</span>
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <p className="font-semibold text-xs text-slate-700">
              Company Employees ({filteredEmployees.length})
            </p>
            <span className="text-xs text-slate-400">Hierarchical Tree Order</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredEmployees.map((emp) => {
              const isMatch =
                searchQuery &&
                (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  emp.designation.toLowerCase().includes(searchQuery.toLowerCase()));
              const isCurrentUser = emp.isCurrentUser || emp.name.toLowerCase().includes('rahul');

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedNode(emp)}
                  style={{ paddingLeft: `${emp.depth * 28 + 16}px` }}
                  className={clsx(
                    'py-3 pr-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer',
                    isMatch && 'bg-amber-50/70',
                    isCurrentUser && 'bg-orange-50/50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs border border-amber-200">
                          {emp.initials || emp.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {isCurrentUser && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 ring-1 ring-white">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {emp.name}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{emp.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {emp.department}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {emp.totalReports > 0 ? `${emp.totalReports} reports` : 'Direct contributor'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Employee Official ID Card Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full relative my-8 animate-in fade-in-0 zoom-in-95 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition font-bold cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900">Official Company ID Badge</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            </div>
            <EmployeeIdCard
              employee={{
                name: selectedNode.name.toUpperCase(),
                designation: selectedNode.designation.toUpperCase(),
                employeeId: selectedNode.id === 'emp-rahul-01' || selectedNode.name.toLowerCase().includes('rahul')
                  ? 'SI0121'
                  : `SI00${Math.abs(selectedNode.name.length * 7) % 80 + 10}`,
                email: selectedNode.email,
                phone: selectedNode.phone.replace(/[^0-9]/g, '').slice(-10) || '9876543210',
                emergencyPhone: '9876543299',
                doj: '05-10-2026',
                bloodGroup: 'O+',
                avatar: selectedNode.avatar,
                company: 'SHNOOR INTERNATIONAL',
              }}
              showActions={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Tree Node Component rendering hierarchical tree with SVG connection lines
function OrgTreeNode({
  node,
  collapsedNodes,
  onToggleCollapse,
  selectedNode,
  onSelectNode,
  searchQuery,
  currentUserId,
}) {
  const isCollapsed = Boolean(collapsedNodes[node.id]);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNode?.id === node.id;
  const isCurrentUser = node.isCurrentUser || node.id === currentUserId || node.name.toLowerCase().includes('rahul');

  const matchesSearch =
    searchQuery &&
    (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.department.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => onSelectNode(node)}
        className={clsx(
          'w-64 bg-white rounded-xl border p-3.5 shadow-sm transition-all duration-200 cursor-pointer relative z-10 flex flex-col items-center text-center group hover:shadow-md hover:-translate-y-0.5',
          isSelected
            ? 'border-amber-500 ring-2 ring-amber-500/20'
            : isCurrentUser
            ? 'border-amber-400 bg-amber-50/20'
            : matchesSearch
            ? 'border-amber-400 ring-2 ring-amber-200'
            : 'border-slate-200 hover:border-slate-300'
        )}
      >
        {isCurrentUser && (
          <span className="absolute -top-2.5 bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
            You
          </span>
        )}

        {/* Avatar */}
        <div className="mb-2 relative">
          {node.avatar ? (
            <img
              src={node.avatar}
              alt={node.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm border-2 border-white shadow-xs">
              {node.initials || node.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name & Designation */}
        <p className="font-semibold text-xs text-slate-900 group-hover:text-amber-600 transition truncate max-w-full">
          {node.name}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{node.designation}</p>

        {/* Department Badge */}
        <span className="mt-2 inline-block px-2 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
          {node.department}
        </span>

        {/* Children report pill */}
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(node.id);
            }}
            className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full transition"
          >
            <span>{node.totalReports} direct reports</span>
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Children branches and connector lines */}
      {hasChildren && !isCollapsed && (
        <div className="flex flex-col items-center">
          {/* Vertical line from parent to horizontal bar */}
          <div className="w-px h-6 bg-slate-300" />

          {/* Children row */}
          <div className="flex items-start justify-center relative pt-4">
            {/* Horizontal connector line linking all child nodes */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-px bg-slate-300"
                style={{
                  left: `calc(100% / ${node.children.length * 2})`,
                  right: `calc(100% / ${node.children.length * 2})`,
                }}
              />
            )}

            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center px-3 relative">
                {/* Vertical line from horizontal connector to child */}
                <div className="w-px h-4 bg-slate-300 absolute top-0" />
                <div className="mt-4">
                  <OrgTreeNode
                    node={child}
                    collapsedNodes={collapsedNodes}
                    onToggleCollapse={onToggleCollapse}
                    selectedNode={selectedNode}
                    onSelectNode={onSelectNode}
                    searchQuery={searchQuery}
                    currentUserId={currentUserId}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
