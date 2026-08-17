const hostname = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "127.0.0.1";
const API_BASE = `http://${hostname}:8000/api`;

export async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach stored Firebase ID Token and user context
  const storedToken = localStorage.getItem("stockflow_token");
  if (storedToken) {
    headers["Authorization"] = `Bearer ${storedToken}`;
  }

  const storedUser = localStorage.getItem("stockflow_user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      headers["X-User-Role"] = user.role;
      headers["X-User-Email"] = user.email;
    } catch (e) {
      console.error(e);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  request,
  // Auth & Users
  getMe: () => request("/auth/me"),
  getUsers: () => request("/admin/users"),
  getUser: (uid) => request(`/admin/users/${uid}`),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  createUser: (user) => request("/admin/users", { method: "POST", body: JSON.stringify(user) }),
  updateUser: (id, user) => request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(user) }),
  updateUserPassword: (id, password) => request(`/admin/users/${id}/password`, { method: "PATCH", body: JSON.stringify({ password }) }),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  updateUserStatus: (id, status) => request(`/admin/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  syncFirebaseUsers: () => request("/admin/users/sync-firebase", { method: "POST" }),

  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products?${q}`);
  },
  getCategories: () => request("/products/categories"),
  createProduct: (product) => request("/products", { method: "POST", body: JSON.stringify(product) }),

  // Inventory
  getInventory: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory?${q}`);
  },
  getReplenishment: () => request("/inventory/replenishment"),
  getMovements: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory/movements?${q}`);
  },
  receiveStock: (payload) => request("/inventory/receive", { method: "POST", body: JSON.stringify(payload) }),
  adjustStock: (payload) => request("/inventory/adjust", { method: "POST", body: JSON.stringify(payload) }),

  // Orders
  getOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/orders?${q}`);
  },
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (order) => request("/orders", { method: "POST", body: JSON.stringify(order) }),
  prioritizeAll: () => request("/orders/prioritize-all", { method: "POST" }),
  allocate: (orderId = null) => request("/orders/allocate", { method: "POST", body: JSON.stringify({ orderId }) }),

  // Fulfillment
  getPickingTasks: () => request("/fulfillment/picking/tasks"),
  createPickingTask: (orderId) => request("/fulfillment/picking/create-task", { method: "POST", body: JSON.stringify({ orderId }) }),
  completePickingTask: (taskId) => request("/fulfillment/picking/complete-task", { method: "POST", body: JSON.stringify({ taskId }) }),
  getPackingTasks: () => request("/fulfillment/packing/tasks"),
  completePackingTask: (taskId) => request("/fulfillment/packing/complete-task", { method: "POST", body: JSON.stringify({ taskId }) }),
  verifyQC: (payload) => request("/fulfillment/qc/verify", { method: "POST", body: JSON.stringify(payload) }),
  dispatchOrder: (payload) => request("/fulfillment/dispatch", { method: "POST", body: JSON.stringify(payload) }),
  scanVerifyItem: (payload) => request("/fulfillment/scan-verify", { method: "POST", body: JSON.stringify(payload) }),
  missingItemSweep: (payload) => request("/fulfillment/missing-item-sweep", { method: "POST", body: JSON.stringify(payload) }),
  transitionOrderStatus: (payload) => request("/fulfillment/transition-status", { method: "POST", body: JSON.stringify(payload) }),

  // Dock Door & Yard Management (YMS)
  getDockDoors: () => request("/fulfillment/dock-doors"),
  assignDockDoor: (payload) => request("/fulfillment/dock-doors/assign", { method: "POST", body: JSON.stringify(payload) }),
  completeDockUnload: (payload) => request("/fulfillment/dock-doors/complete-unload", { method: "POST", body: JSON.stringify(payload) }),

  // Reverse Logistics & Customer Returns (RTO Center)
  getReturns: () => request("/fulfillment/returns"),
  gradeAndRestockReturn: (payload) => request("/fulfillment/returns/grade-and-restock", { method: "POST", body: JSON.stringify(payload) }),

  // Climate & Cold-Chain Telemetry
  getClimateTelemetry: () => request("/fulfillment/climate-telemetry"),

  // Printable Thermal Shipping Label Generator
  getShippingLabelData: (orderId) => request(`/fulfillment/shipping-label/${orderId}`),



  // Exceptions
  getExceptions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/exceptions?${q}`);
  },
  resolveException: (payload) => request("/exceptions/resolve", { method: "POST", body: JSON.stringify(payload) }),
  createException: (payload) => request("/exceptions", { method: "POST", body: JSON.stringify(payload) }),

  // Analytics & Logs
  getMetrics: () => request("/analytics/metrics"),
  getFinancialIntelligence: () => request("/analytics/financial-intelligence"),
  getBottlenecks: () => request("/analytics/bottlenecks"),
  getAuditLogs: (limit = 100) => request(`/analytics/audit-logs?limit=${limit}`),
  getDecisionLogs: (limit = 100) => request(`/analytics/decision-logs?limit=${limit}`),
  getNotifications: () => request("/analytics/notifications"),

  // AI Copilot
  askCopilot: (question, warehouseId = "ALL") => request("/copilot/query", { method: "POST", body: JSON.stringify({ question, warehouseId }) }),

  // Demo Runner
  resetDemo: () => request("/demo/reset", { method: "POST" }),
  getScenarioStatus: () => request("/demo/scenario-status"),
  executeDemoStep: (step) => request(`/demo/step/${step}`, { method: "POST" }),

  // Real-Time Warehouse Simulation & Intelligence
  stepSimulation: () => request("/simulation/step", { method: "POST" }),
  getActivityStream: (limit = 30) => request(`/simulation/activity-stream?limit=${limit}`),
  getAttentionNeeded: () => request("/simulation/intelligence/attention-needed"),
  getStockouts: () => request("/simulation/intelligence/stockouts"),
  getExpiries: () => request("/simulation/intelligence/expiries"),
  getMismatches: () => request("/simulation/intelligence/mismatches"),
  resolveMismatch: (payload) => request("/simulation/intelligence/resolve-mismatch", { method: "POST", body: JSON.stringify(payload) }),
  getWorkloads: () => request("/simulation/intelligence/workloads"),
  rebalanceWorkload: (payload) => request("/simulation/intelligence/rebalance-workload", { method: "POST", body: JSON.stringify(payload) }),
  getSlaRisks: () => request("/simulation/intelligence/sla-risks"),
  getCapacityRisks: () => request("/simulation/intelligence/capacity-risks"),
  getMultiWarehouse: () => request("/simulation/intelligence/multi-warehouse"),
  getSlowMoving: () => request("/simulation/intelligence/slow-moving"),

  // System Settings
  getSettings: () => request("/settings"),
  updateSettings: (payload) => request("/settings", { method: "POST", body: JSON.stringify(payload) }),
};
