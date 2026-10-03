import React, { useState, useMemo } from 'react';
import { 
  SystemUser, 
  UserRole, 
  UserStatus 
} from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  Mail, 
  Building, 
  Clock, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X,
  Save,
  AlertCircle
} from 'lucide-react';

interface UserManagementTabProps {
  users: SystemUser[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onUpdateUserStatus: (userId: string, newStatus: UserStatus) => void;
  onAddUser: (user: SystemUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  onUpdateUserRole,
  onUpdateUserStatus,
  onAddUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Systems Engineering');
  const [role, setRole] = useState<UserRole>('Editor');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // Summary counts
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const editorCount = users.filter((u) => u.role === 'Editor').length;
  const viewerCount = users.filter((u) => u.role === 'Viewer').length;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.department.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { [k: string]: string } = {};
    if (!name.trim()) errs.name = 'Full Name is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'A valid email address is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newUser: SystemUser = {
      id: `usr-${String(Math.floor(100 + Math.random() * 900))}`,
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role,
      status: 'Active',
      lastLogin: 'Never (Invited)',
      createdAt: new Date().toISOString(),
    };

    onAddUser(newUser);
    setName('');
    setEmail('');
    setDepartment('Systems Engineering');
    setRole('Editor');
    setErrors({});
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Personnel
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalUsers}</span>
            <span className="text-xs text-slate-500 font-medium">accounts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              Administrators
            </span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-red-950">{adminCount}</span>
            <span className="text-xs text-red-600 font-medium">super users</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Editors
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Edit3 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-blue-950">{editorCount}</span>
            <span className="text-xs text-blue-600 font-medium">operations / dev</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Auditors / Viewers
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800">{viewerCount}</span>
            <span className="text-xs text-slate-500 font-medium">read-only</span>
          </div>
        </div>

      </div>

      {/* 2. Toolbar & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-user-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or department..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600/30 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            id="select-user-filter-role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
          >
            <option value="ALL">Role: All</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>

          {/* Status Filter */}
          <select
            id="select-user-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
          >
            <option value="ALL">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Add User Button */}
          <button
            id="btn-open-add-user"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New User</span>
          </button>
        </div>

      </div>

      {/* 3. User Access Control Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-4">User Name & Identity</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Access Role Level</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-center w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No users match the search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {user.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.department}</span>
                        </div>
                      </td>

                      {/* Role Assignment Dropdown */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => onUpdateUserRole(user.id, e.target.value as UserRole)}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                            user.role === 'Admin'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : user.role === 'Editor'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </td>

                      {/* Status Dropdown / Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={user.status}
                          onChange={(e) => onUpdateUserStatus(user.id, e.target.value as UserStatus)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : user.status === 'Inactive'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Suspended">Suspended</option>
                        </select>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {user.lastLogin}
                      </td>

                      {/* Delete User */}
                      <td className="py-3 px-4 text-center">
                        {user.email !== 'ace-368@acehrm.net' ? (
                          <button
                            type="button"
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Protected</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Total: <strong>{filteredUsers.length}</strong> personnel registered
          </span>
          <span className="text-[11px] text-slate-400">
            Role-Based Access Control (RBAC)
          </span>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Add New System User</h3>
                  <p className="text-[11px] text-slate-400">
                    Grant portal access credentials & role level
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-user-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/30"
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rachel.adams@ace.internal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/30"
                />
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  id="select-user-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/30"
                >
                  <option value="Systems Engineering">Systems Engineering</option>
                  <option value="Financial Crime Unit">Financial Crime Unit</option>
                  <option value="Risk & Compliance">Risk & Compliance</option>
                  <option value="Compliance Operations">Compliance Operations</option>
                  <option value="Internal Audit">Internal Audit</option>
                  <option value="Core Platform Engineering">Core Platform Engineering</option>
                  <option value="Information Security">Information Security</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Access Role
                </label>
                <select
                  id="select-user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600/30"
                >
                  <option value="Editor">Editor (Create/Edit requests & tickets)</option>
                  <option value="Admin">Admin (Full administrative & configuration access)</option>
                  <option value="Viewer">Viewer (Read-only audit inspector)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-add-user"
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-2xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
