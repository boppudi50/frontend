import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import {
  Users,
  User,
  UserPlus,
  Building2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Key,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  Shield,
  Phone,
  Clock,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  Radio,
  FileCheck,
  Smartphone,
  Layers
} from "lucide-react";

const WAREHOUSE_OPTIONS = [
  { id: "HYD-01", name: "StockFlow Hyderabad Central Hub (HYD-01)" },
  { id: "MUM-01", name: "StockFlow Mumbai West Hub (MUM-01)" },
  { id: "VJA-01", name: "StockFlow Vijayawada Central Hub (VJA-01)" },
  { id: "MAH-01", name: "StockFlow Maharashtra Hub (MAH-01)" },
  { id: "CHE-01", name: "StockFlow Chennai Port Hub (CHE-01)" }
];

const ROLES_INFO = {
  SUPER_ADMIN: {
    label: "Super Admin",
    color: "bg-slate-900 text-[#92EEFF] border-slate-800",
    desc: "Unrestricted global control across all 5 StockFlow fulfillment centers, finance, and system governance."
  },
  OPERATIONS_MANAGER: {
    label: "Operations Manager",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    desc: "Facility-wide operational dispatch, wave picking oversight, dock management, and exception overrides."
  },
  INVENTORY_MANAGER: {
    label: "Inventory Manager",
    color: "bg-blue-50 text-blue-800 border-blue-200",
    desc: "Cycle counting, FEFO batch expiry management, stock movements, and replenishment threshold governance."
  },
  STAFF: {
    label: "Warehouse Staff",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    desc: "Floor execution including RF gun picking, barcode scan verification, automated packing, and staging."
  }
};

const RBAC_MODULES = [
  { module: "Command Center", superAdmin: "Full Control", opManager: "Full Control", invManager: "Read Only", staff: "Read Only" },
  { module: "Orders & Allocation", superAdmin: "Full Control", opManager: "Full Control", invManager: "Read Only", staff: "View Assigned" },
  { module: "Inventory & Stock", superAdmin: "Full Control", opManager: "Read/Write", invManager: "Full Control", staff: "Bin Scan Only" },
  { module: "Wave Picking (TSP)", superAdmin: "Full Control", opManager: "Full Control", invManager: "View Corridors", staff: "RF Gun Pick" },
  { module: "Packing & 6-Point QC", superAdmin: "Full Control", opManager: "Full Control", invManager: "View Batches", staff: "Scan & Weigh" },
  { module: "Carrier Dispatch", superAdmin: "Full Control", opManager: "Full Control", invManager: "None", staff: "Manifest Print" },
  { module: "Dock & Yard (YMS)", superAdmin: "Full Control", opManager: "Full Control", invManager: "View Inbound", staff: "Dock Scan" },
  { module: "Returns & RTO", superAdmin: "Full Control", opManager: "Full Control", invManager: "Restock Grade", staff: "RTO Receive" },
  { module: "Exception Center", superAdmin: "Full Control", opManager: "Resolve & Approve", invManager: "Cycle Recount", staff: "Log Incident" },
  { module: "Profit Intelligence", superAdmin: "Full Control", opManager: "Read Margins", invManager: "Landed Cost Only", staff: "None" },
  { module: "User & Security RBAC", superAdmin: "Full Control", opManager: "View Facility Staff", invManager: "None", staff: "None" }
];

export function UsersManagement() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // View Mode: 'table' or 'grid'
  const [viewMode, setViewMode] = useState("table");

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [selectedWhFilter, setSelectedWhFilter] = useState("ALL");
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Modals State
  const [rbacModalOpen, setRbacModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // Form States for Add User
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("INVENTORY_MANAGER");
  const [addDept, setAddDept] = useState("Warehouse Inventory");
  const [addWarehouseId, setAddWarehouseId] = useState("HYD-01");
  const [addRfGunId, setAddRfGunId] = useState("HHT-8850");
  const [addShift, setAddShift] = useState("Morning Shift (06:00 - 14:30)");
  const [addPhone, setAddPhone] = useState("+91 98000 00000");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");

  // Form States for Edit User
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("INVENTORY_MANAGER");
  const [editDept, setEditDept] = useState("");
  const [editWarehouseId, setEditWarehouseId] = useState("HYD-01");
  const [editRfGunId, setEditRfGunId] = useState("");
  const [editShift, setEditShift] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Password Reset in Edit Modal
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      if (Array.isArray(res) && res.length > 0) {
        setUsersList(res);
      }
    } catch (e) {
      console.error("Fetch users error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncUsers = async () => {
    try {
      setSyncing(true);
      const res = await api.syncFirebaseUsers();
      if (res && Array.isArray(res.users)) {
        setUsersList(res.users);
      } else {
        await fetchUsers();
      }
      toast.success("Accounts Synchronized", "Refreshed warehouse user credentials and active directory roles.");
    } catch (e) {
      console.error("Sync error:", e);
      await fetchUsers();
      toast.info("Database Synchronized", "Loaded all active warehouse operators from memory.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users List with Super Admin FIRST and newly added users at the BOTTOM
  const filteredUsers = useMemo(() => {
    const list = usersList.filter((u) => {
      const s = searchQuery.toLowerCase();
      const name = (u.fullName || u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      const dept = (u.department || "").toLowerCase();
      const wh = (u.warehouseId || "").toLowerCase();
      const rf = (u.rfGunId || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();

      const matchesSearch =
        searchQuery === "" ||
        name.includes(s) ||
        email.includes(s) ||
        role.includes(s) ||
        dept.includes(s) ||
        wh.includes(s) ||
        rf.includes(s) ||
        phone.includes(s);

      const matchesRole = selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
      const matchesWh = selectedWhFilter === "ALL" || u.warehouseId === selectedWhFilter;

      return matchesSearch && matchesRole && matchesWh;
    });

    // Custom Hierarchy Sorting:
    // 1. Super Admin (admin@gmail.com) ALWAYS at top (Index 0)
    // 2. Ooha (ooha@gmail.com) second
    // 3. Newly added users at the bottom in ascending creation order
    return list.sort((a, b) => {
      const aIsAdmin = a.role === "SUPER_ADMIN" || a.email?.toLowerCase() === "admin@gmail.com";
      const bIsAdmin = b.role === "SUPER_ADMIN" || b.email?.toLowerCase() === "admin@gmail.com";
      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;

      const aIsOoha = a.email?.toLowerCase() === "ooha@gmail.com";
      const bIsOoha = b.email?.toLowerCase() === "ooha@gmail.com";
      if (aIsOoha && !bIsOoha) return -1;
      if (!aIsOoha && bIsOoha) return 1;

      // Chronological ascending (oldest first, newly added at the bottom)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    });
  }, [usersList, searchQuery, selectedRoleFilter, selectedWhFilter]);

  // Displayed Users (First 10 vs All)
  const displayedUsers = useMemo(() => {
    if (showAllUsers) return filteredUsers;
    return filteredUsers.slice(0, 10);
  }, [filteredUsers, showAllUsers]);

  // Handle Add Warehouse User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPassword) return;
    setSubmittingAdd(true);
    setAddError("");

    try {
      await api.createUser({
        fullName: addName.trim(),
        name: addName.trim(),
        email: addEmail.trim().toLowerCase(),
        password: addPassword,
        role: addRole,
        department: addDept.trim(),
        warehouseId: addWarehouseId,
        rfGunId: addRfGunId.trim() || `HHT-${Math.floor(1000 + Math.random() * 9000)}`,
        shift: addShift,
        phone: addPhone.trim() || "+91 98000 00000"
      });
      await fetchUsers();
      setAddModalOpen(false);
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddPhone("+91 ");
      setAddDept("Warehouse Inventory");
      toast.success("User Account Created", `Provisioned ${addRole} access for ${addName}.`);
    } catch (err) {
      setAddError(err.message || "Failed to create user account.");
      toast.error("User Creation Failed", err.message);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditName(user.fullName || user.name || "");
    setEditEmail(user.email || "");
    setEditRole(user.role || "INVENTORY_MANAGER");
    setEditDept(user.department || "Warehouse Operations");
    setEditWarehouseId(user.warehouseId || "HYD-01");
    setEditRfGunId(user.rfGunId || "HHT-8810");
    setEditShift(user.shift || "Morning Shift (06:00 - 14:30)");
    setEditPhone(user.phone || "+91 98000 00000");
    setEditStatus(user.status || "ACTIVE");
    setEditError("");
    setEditSuccess("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFeedback("");
    setEditModalOpen(true);
  };

  // Handle Save User Details
  const handleSaveUserDetails = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmittingEdit(true);
    setEditError("");
    setEditSuccess("");

    try {
      const uid = editingUser.id || editingUser.uid;
      await api.updateUser(uid, {
        fullName: editName.trim(),
        name: editName.trim(),
        role: editRole,
        department: editDept.trim(),
        warehouseId: editWarehouseId,
        rfGunId: editRfGunId.trim(),
        shift: editShift,
        phone: editPhone.trim(),
        status: editStatus
      });

      // Update local state
      setUsersList((prev) =>
        prev.map((u) =>
          (u.id === uid || u.uid === uid)
            ? {
                ...u,
                fullName: editName.trim(),
                name: editName.trim(),
                role: editRole,
                department: editDept.trim(),
                warehouseId: editWarehouseId,
                rfGunId: editRfGunId.trim(),
                shift: editShift,
                phone: editPhone.trim(),
                status: editStatus
              }
            : u
        )
      );

      setEditSuccess("User details saved successfully.");
      toast.success("Profile Updated", `Updated details for ${editName}.`);
      setTimeout(() => {
        setEditModalOpen(false);
      }, 700);
    } catch (err) {
      setEditError(err.message || "Failed to update user.");
      toast.error("Update Failed", err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (user) => {
    const isCurrentlyActive = user.status === "ACTIVE";
    const nextStatus = isCurrentlyActive ? "DISABLED" : "ACTIVE";
    const uid = user.id || user.uid;

    try {
      await api.updateUser(uid, { status: nextStatus });
      setUsersList((prev) =>
        prev.map((u) => ((u.id === uid || u.uid === uid) ? { ...u, status: nextStatus } : u))
      );
      toast.info(
        `Account ${nextStatus === "ACTIVE" ? "Enabled" : "Disabled"}`,
        `${user.fullName || user.name} is now ${nextStatus.toLowerCase()}.`
      );
    } catch (err) {
      toast.error("Status Update Failed", err.message);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!editingUser || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setPasswordFeedback("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback("Password must be at least 6 characters.");
      return;
    }

    setSubmittingPassword(true);
    setPasswordFeedback("");

    try {
      const uid = editingUser.id || editingUser.uid;
      await api.updateUserPassword(uid, newPassword);
      setPasswordFeedback("Password updated successfully.");
      toast.success("Password Reset", `Password updated for ${editingUser.fullName || editingUser.email}.`);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordFeedback(err.message || "Failed to reset password.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Handle Delete User
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      const uid = deleteConfirmUser.id || deleteConfirmUser.uid;
      await api.deleteUser(uid);
      setUsersList((prev) => prev.filter((u) => u.id !== uid && u.uid !== uid));
      toast.success("User Removed", `Account ${deleteConfirmUser.email} deleted.`);
      setDeleteConfirmUser(null);
    } catch (err) {
      toast.error("Delete Failed", err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header with Title and Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  User Administration & RBAC Permissions
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  {usersList.filter((u) => u.status === "ACTIVE").length} ACTIVE OPERATORS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Enterprise identity governance, role scoping, and RF gun HHT badge assignments across 5 StockFlow fulfillment centers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRbacModalOpen(true)}
            className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700 bg-white"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E8FAE]" />
            <span>RBAC Matrix</span>
          </button>

          <button
            type="button"
            onClick={handleSyncUsers}
            disabled={syncing}
            className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700 bg-white"
            title="Synchronize accounts from Firebase Auth"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-[#0E8FAE]" : "text-slate-600"}`} />
            <span>{syncing ? "Syncing..." : "Sync Directory"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddError("");
              setAddModalOpen(true);
            }}
            className="btn-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 text-slate-950 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>Add Warehouse User</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-[#0E8FAE] shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Authorized Staff</div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
            {usersList.length} Operators
          </div>
          <div className="text-[10px] text-[#0E8FAE] font-semibold flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>Active Enterprise Roster</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Hub Directors & Leads</div>
          <div className="text-base sm:text-lg font-black text-emerald-700 font-mono">
            {usersList.filter((u) => ["SUPER_ADMIN", "OPERATIONS_MANAGER"].includes(u.role)).length} Facility Leads
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
            <Building2 className="w-3 h-3" />
            <span>5 Fulfillment Hubs Covered</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">RF Gun HHT Operators</div>
          <div className="text-base sm:text-lg font-black text-blue-700 font-mono">
            {usersList.filter((u) => u.rfGunId || u.role === "STAFF").length} Handheld Terminals
          </div>
          <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5">
            <Smartphone className="w-3 h-3" />
            <span>Floor Pick & Pack Verification</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Security & Compliance</div>
          <div className="text-base sm:text-lg font-black text-amber-800 font-mono">
            100% Verified Identity
          </div>
          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
            <Lock className="w-3 h-3" />
            <span>SEC / ISO Immutable Audit</span>
          </div>
        </div>
      </div>

      {/* 3. Control & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, role, department, facility, or RF gun badge..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Facility Selector */}
          <select
            value={selectedWhFilter}
            onChange={(e) => setSelectedWhFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
          >
            <option value="ALL">All 5 Facilities</option>
            <option value="HYD-01">HYD-01 (Hyderabad)</option>
            <option value="MUM-01">MUM-01 (Mumbai)</option>
            <option value="VJA-01">VJA-01 (Vijayawada)</option>
            <option value="MAH-01">MAH-01 (Maharashtra)</option>
            <option value="CHE-01">CHE-01 (Chennai)</option>
          </select>

          {/* Role Filter Selector */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
          >
            <option value="ALL">All Roles ({usersList.length})</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="OPERATIONS_MANAGER">Operations Manager</option>
            <option value="INVENTORY_MANAGER">Inventory Manager</option>
            <option value="STAFF">Warehouse Staff</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1 rounded transition-all ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded transition-all ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Team Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Table View or Grid View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#0E8FAE]" />
          <span>Loading authorized warehouse users...</span>
        </div>
      ) : viewMode === "table" ? (
        /* OFFICIAL ENTERPRISE DATA TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Operator & Identity</th>
                  <th className="py-3 px-4">Role & Access</th>
                  <th className="py-3 px-4">Assigned Facility</th>
                  <th className="py-3 px-4">Department & Shift</th>
                  <th className="py-3 px-4">RF Gun HHT</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">
                      No matching warehouse staff accounts found.
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((u) => {
                    const isActive = u.status === "ACTIVE";
                    const isSelf = u.email === currentUser?.email;
                    const roleInfo = ROLES_INFO[u.role] || ROLES_INFO.STAFF;

                    return (
                      <tr key={u.id || u.uid} className="hover:bg-slate-50/80 transition-colors">
                        {/* Operator & Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isActive
                                    ? "bg-gradient-to-tr from-[#E5FAFE] to-[#92EEFF] text-[#0E8FAE] border border-[#92EEFF]"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                                }`}
                              >
                                {(u.fullName || u.name || "U").charAt(0).toUpperCase()}
                              </div>
                              {isActive && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.fullName || u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-[#92EEFF]">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                              {u.phone && (
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{u.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role & Access */}
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${roleInfo.color}`}
                          >
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* Assigned Facility */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-[#0E8FAE]" />
                            <span>{u.warehouseId || "HYD-01"}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {u.assignedWarehouses && u.assignedWarehouses.length > 1
                              ? `Multi-Hub (${u.assignedWarehouses.length} Facilities)`
                              : "Dedicated Hub"}
                          </div>
                        </td>

                        {/* Department & Shift */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{u.department || "Operations"}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span>{u.shift || "General Shift"}</span>
                          </div>
                        </td>

                        {/* RF Gun HHT */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {u.rfGunId ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {u.rfGunId}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => !isSelf && handleToggleStatus(u)}
                            disabled={isSelf}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                            } ${isSelf ? "cursor-default" : "cursor-pointer"}`}
                            title={isSelf ? "Cannot disable your own account" : "Click to toggle active status"}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                            <span>{isActive ? "ACTIVE" : "DISABLED"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="btn-outline text-xs py-1 px-2.5 font-bold flex items-center gap-1 text-slate-700 bg-white"
                              title="Edit user profile & permissions"
                            >
                              <Edit2 className="w-3 h-3 text-slate-600" />
                              <span>Edit</span>
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmUser(u)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with "See All Staff" Expand / Collapse */}
          <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
            <div className="text-slate-500 font-medium flex items-center gap-2">
              <span>
                Showing <b className="text-slate-900 font-mono">{displayedUsers.length}</b> of{" "}
                <b className="text-slate-900 font-mono">{filteredUsers.length}</b> authorized warehouse operators
              </span>
              {showAllUsers ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ALL OPERATORS EXPANDED
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  FIRST 10 OPERATORS
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {filteredUsers.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                    showAllUsers
                      ? "btn-outline text-slate-700 hover:text-slate-950 bg-white"
                      : "btn-primary text-slate-950"
                  }`}
                >
                  {showAllUsers ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                      <span>Show First 10 Staff</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-950" />
                      <span>See All ({filteredUsers.length}) Staff</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TEAM CARDS GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedUsers.map((u) => {
              const isActive = u.status === "ACTIVE";
              const isSelf = u.email === currentUser?.email;
              const roleInfo = ROLES_INFO[u.role] || ROLES_INFO.STAFF;

              return (
                <div
                  key={u.id || u.uid}
                  className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 transition-all relative ${
                    !isActive ? "opacity-65 bg-slate-50/80 border-slate-300" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isActive
                            ? "bg-gradient-to-tr from-[#E5FAFE] to-[#92EEFF] text-[#0E8FAE] border-[#92EEFF]"
                            : "bg-slate-100 text-slate-400 border-slate-200"
                        }`}
                      >
                        {(u.fullName || u.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                          <span>{u.fullName || u.name}</span>
                          {isSelf && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-[#92EEFF]">
                              YOU
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                          {u.department || "Warehouse Staff"}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1 font-mono font-bold">
                      <Building2 className="w-3.5 h-3.5 text-[#0E8FAE]" />
                      <span>{u.warehouseId || "HYD-01"}</span>
                    </div>

                    <div className="flex items-center justify-end gap-1 font-mono">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.rfGunId || "No HHT"}</span>
                    </div>

                    <div className="col-span-2 text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                      <span>{u.shift || "General Shift"}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="btn-outline text-xs py-1 px-3 font-bold flex items-center gap-1 text-slate-700 bg-white"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" />
                      <span>Edit</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                            isActive
                              ? "text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100"
                              : "text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {isActive ? "Disable User" : "Enable User"}
                        </button>
                      )}

                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmUser(u)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid View Expand Footer */}
          {filteredUsers.length > 10 && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Showing <b className="text-slate-900 font-mono">{displayedUsers.length}</b> of{" "}
                <b className="text-slate-900 font-mono">{filteredUsers.length}</b> warehouse staff
              </span>
              <button
                type="button"
                onClick={() => setShowAllUsers(!showAllUsers)}
                className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                  showAllUsers
                    ? "btn-outline text-slate-700 hover:text-slate-950 bg-white"
                    : "btn-primary text-slate-950"
                }`}
              >
                {showAllUsers ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                    <span>Show First 10 Staff</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-950" />
                    <span>See All ({filteredUsers.length}) Staff</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: RBAC Permission Matrix Modal */}
      {rbacModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Role-Based Access Control (RBAC) Governance Matrix
                  </h2>
                  <p className="text-xs text-slate-500">
                    Definitive permission scopes across all StockFlow modules.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRbacModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">Warehouse Module</th>
                    <th className="py-2.5 px-3 text-cyan-800">Super Admin</th>
                    <th className="py-2.5 px-3 text-emerald-800">Operations Manager</th>
                    <th className="py-2.5 px-3 text-blue-800">Inventory Manager</th>
                    <th className="py-2.5 px-3 text-slate-700">Warehouse Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {RBAC_MODULES.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{m.module}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">{m.superAdmin}</td>
                      <td className="py-2.5 px-3 text-slate-800">{m.opManager}</td>
                      <td className="py-2.5 px-3 text-slate-800">{m.invManager}</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.staff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setRbacModalOpen(false)}
                className="btn-primary text-xs font-bold py-2 px-4 text-slate-950"
              >
                Close RBAC Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Warehouse User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Add Warehouse Operator</h2>
                  <p className="text-xs text-slate-500">Provision a new user account with facility & role scoping.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="ramesh@stockflow.in"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role *</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    <option value="SUPER_ADMIN">Super Admin (Multi-Hub)</option>
                    <option value="OPERATIONS_MANAGER">Operations Manager</option>
                    <option value="INVENTORY_MANAGER">Inventory Manager</option>
                    <option value="STAFF">Warehouse Staff / Floor Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fulfillment Center *</label>
                  <select
                    value={addWarehouseId}
                    onChange={(e) => setAddWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    {WAREHOUSE_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={addDept}
                    onChange={(e) => setAddDept(e.target.value)}
                    placeholder="e.g. Floor 4 Wave Picking"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RF Gun HHT Badge</label>
                  <input
                    type="text"
                    value={addRfGunId}
                    onChange={(e) => setAddRfGunId(e.target.value)}
                    placeholder="e.g. HHT-8850"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0E8FAE]" />
                    <span>Mobile Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="+91 98490 12345"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#0E8FAE]" />
                    <span>Operational Shift *</span>
                  </label>
                  <select
                    value={addShift}
                    onChange={(e) => setAddShift(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    <option value="Morning Shift (06:00 - 14:30)">Morning Shift (06:00 - 14:30)</option>
                    <option value="General Shift (08:30 - 17:30)">General Shift (08:30 - 17:30)</option>
                    <option value="Evening Shift (14:00 - 22:30)">Evening Shift (14:00 - 22:30)</option>
                    <option value="Night Shift (22:00 - 06:30)">Night Shift (22:00 - 06:30)</option>
                    <option value="General (24/7 Access)">General (24/7 Access)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temporary Password *</label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAddPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="btn-outline text-xs font-bold py-2 px-3.5 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="btn-primary text-xs font-bold py-2 px-4 text-slate-950 flex items-center gap-1.5"
                >
                  {submittingAdd ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit User Modal & Password Reset */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Edit Operator Profile: {editingUser.fullName || editingUser.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {editError}
              </div>
            )}
            {editSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveUserDetails} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Level</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="OPERATIONS_MANAGER">Operations Manager</option>
                    <option value="INVENTORY_MANAGER">Inventory Manager</option>
                    <option value="STAFF">Warehouse Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Facility</label>
                  <select
                    value={editWarehouseId}
                    onChange={(e) => setEditWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    {WAREHOUSE_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    <option value="ACTIVE">Active (Authorized Access)</option>
                    <option value="DISABLED">Disabled (Suspended Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RF Gun HHT ID</label>
                  <input
                    type="text"
                    value={editRfGunId}
                    onChange={(e) => setEditRfGunId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0E8FAE]" />
                    <span>Mobile Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98490 12345"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#0E8FAE]" />
                    <span>Operational Shift</span>
                  </label>
                  <select
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    <option value="Morning Shift (06:00 - 14:30)">Morning Shift (06:00 - 14:30)</option>
                    <option value="General Shift (08:30 - 17:30)">General Shift (08:30 - 17:30)</option>
                    <option value="Evening Shift (14:00 - 22:30)">Evening Shift (14:00 - 22:30)</option>
                    <option value="Night Shift (22:00 - 06:30)">Night Shift (22:00 - 06:30)</option>
                    <option value="General (24/7 Access)">General (24/7 Access)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn-primary text-xs font-bold py-2 px-4 text-slate-950 flex items-center gap-1.5"
                >
                  {submittingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

            {/* Password Reset Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#0E8FAE]" />
                <span>Reset Operator Password / Security PIN</span>
              </h3>

              {passwordFeedback && (
                <div
                  className={`p-2.5 text-xs rounded-xl border ${
                    passwordFeedback.includes("successfully")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {passwordFeedback}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Confirm Password</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingPassword || !newPassword}
                    className="btn-outline text-xs font-bold py-1.5 px-3 text-slate-700"
                  >
                    {submittingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Account</h3>
                <p className="text-xs text-slate-500 font-mono">{deleteConfirmUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently revoke access for <strong>{deleteConfirmUser.fullName || deleteConfirmUser.name}</strong>? This action is recorded in the immutable audit trail.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="btn-outline text-xs font-bold py-2 px-3.5 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-colors"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;
