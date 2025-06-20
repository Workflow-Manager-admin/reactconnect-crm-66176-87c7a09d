import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * --- Theme Variables (overriding App.css) ---
 * --primary: #007bff;
 * --secondary: #6c757d;
 * --accent: #17a2b8;
 * --bg: #f8fafc;
 */

const themeVars = {
  '--primary': '#007bff',
  '--secondary': '#6c757d',
  '--accent': '#17a2b8',
  '--bg': '#f8fafc',
  '--light': '#fff',
  '--danger': '#dc3545',
  '--success': '#28a745',
  '--border-radius': '5px',
  '--shadow': '0 2px 8px 0 rgba(0,0,0,0.04)',
  '--gray-light': '#f2f2f2',
  '--gray-med': '#e5e5e5',
  '--text-dark': '#222',
};

function useThemeVars(vars) {
  useEffect(() => {
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
  }, [vars]);
}

// --- Helper: CSV Export
// PUBLIC_INTERFACE
function exportCSV(customers) {
  /** Exports customer list to CSV and triggers download. */
  if (!customers || customers.length === 0) return;
  const fields = Object.keys(customers[0]);
  const csv = [
    fields.join(','),
    ...customers.map(c => fields.map(f => `"${(c[f] || '').toString().replace(/"/g,'""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.download = 'reactconnect_customers.csv';
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

// --- Authentication Utilities
const DUMMY_USER = { email: 'user@example.com', password: 'demo123' };

// PUBLIC_INTERFACE
function fakeAuthAPI({ email, password, signup }) {
  /** Simulated authentication; accepts one dummy user and any new signups */
  if (signup) { // Just accept any signup
    return { token: 'demo-signup-token', user: { email } };
  } else if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    return { token: 'demo-token', user: { email } };
  }
  return null;
}

// --- Main App ---
function App() {
  useThemeVars(themeVars);

  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [authMode, setAuthMode] = useState('login'); // or 'signup'
  const [authError, setAuthError] = useState('');

  // CRM Data State
  const [customers, setCustomers] = useState([
    // initial dummy data (demo)
    {
      id: 1,
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '555-1234',
      company: 'Acme Corporation',
      status: 'Active',
      created: '2024-01-24',
    },
    {
      id: 2,
      name: 'Jan Smith',
      email: 'jan@smithinc.com',
      phone: '555-5678',
      company: 'Smith Inc',
      status: 'Prospect',
      created: '2024-04-01',
    },
  ]);
  const [customerForm, setCustomerForm] = useState({
    id: '', name: '', email: '', phone: '', company: '', status: 'Active'
  });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Interactions
  const [interactions, setInteractions] = useState([
    // id, customerId, type, timestamp, description
    { id: 1, customerId: 1, type: 'Call', timestamp: '2024-04-18 10:00', description: 'Called about pricing.' },
  ]);
  const [interactionForm, setInteractionForm] = useState({
    customerId: '', type: 'Call', description: '',
  });

  // Tasks
  const [tasks, setTasks] = useState([
    // id, customerId, title, dueDate, complete
    { id: 1, customerId: 2, title: 'Send Proposal', dueDate: '2024-04-30', complete: false },
  ]);
  const [taskForm, setTaskForm] = useState({
    customerId: '', title: '', dueDate: '', complete: false,
  });

  // Dashboard Tabs
  const [tab, setTab] = useState('dashboard'); //'dashboard' | 'customers' | 'interactions' | 'tasks'

  // --- Auth Handlers ---
  // PUBLIC_INTERFACE
  function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const resp = fakeAuthAPI({ email, password, signup: false });
    if (resp) {
      setUser(resp.user);
      setToken(resp.token);
    } else {
      setAuthError('Invalid email or password');
    }
  }

  // PUBLIC_INTERFACE
  function handleSignup(e) {
    e.preventDefault();
    setAuthError('');
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) {
      setAuthError('All fields required');
      return;
    }
    const resp = fakeAuthAPI({ email, password, signup: true });
    setUser(resp.user);
    setToken(resp.token);
  }

  function handleLogout() {
    setUser(null);
    setToken('');
  }

  // --- CRM Handlers ---
  function resetCustomerForm() {
    setCustomerForm({ id: '', name: '', email: '', phone: '', company: '', status: 'Active' });
    setEditingCustomer(null);
  }
  // PUBLIC_INTERFACE
  function handleCustomerForm(e) {
    e.preventDefault();
    const isEdit = !!editingCustomer;
    if (!customerForm.name || !customerForm.email) return;
    if (isEdit) {
      setCustomers(customers.map(c => (
        c.id === editingCustomer ? { ...c, ...customerForm } : c
      )));
    } else {
      setCustomers([
        ...customers,
        {
          ...customerForm,
          id: Date.now(),
          created: new Date().toISOString().slice(0, 10),
        }
      ]);
    }
    resetCustomerForm();
  }
  function handleEditCustomer(cust) {
    setEditingCustomer(cust.id);
    setCustomerForm({ ...cust });
    setTab('customers');
  }
  function handleDeleteCustomer(custId) {
    if (!window.confirm('Delete this customer?')) return;
    setCustomers(customers.filter(c => c.id !== custId));
    setInteractions(interactions.filter(i => i.customerId !== custId));
    setTasks(tasks.filter(t => t.customerId !== custId));
    if (editingCustomer === custId) resetCustomerForm();
  }
  // --- Filters
  const filteredCustomers = customers.filter(c =>
    (!searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    && (!statusFilter || c.status === statusFilter)
  );

  // --- Interaction Handlers ---
  // PUBLIC_INTERFACE
  function handleInteractionForm(e) {
    e.preventDefault();
    if (!interactionForm.customerId || !interactionForm.type) return;
    setInteractions([
      ...interactions,
      {
        id: Date.now(),
        customerId: interactionForm.customerId,
        type: interactionForm.type,
        description: interactionForm.description,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }
    ]);
    setInteractionForm({ customerId: '', type: 'Call', description: '' });
    setTab('interactions');
  }
  // --- Task Handlers ---
  // PUBLIC_INTERFACE
  function handleTaskForm(e) {
    e.preventDefault();
    if (!taskForm.customerId || !taskForm.title || !taskForm.dueDate) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        customerId: taskForm.customerId,
        title: taskForm.title,
        dueDate: taskForm.dueDate,
        complete: false,
      }
    ]);
    setTaskForm({ customerId: '', title: '', dueDate: '', complete: false });
    setTab('tasks');
  }
  function handleTaskToggle(taskId) {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, complete: !t.complete } : t));
  }
  function handleDeleteTask(taskId) {
    setTasks(tasks.filter(t => t.id !== taskId));
  }

  // --- Layout UI ---

  // PUBLIC_INTERFACE
  function ThemeButton({ styleType = 'primary', ...props }) {
    /** Re-usable button styled according to the CRM theme */
    const styleMap = {
      primary: { background: 'var(--primary)', color: '#fff' },
      secondary: { background: 'var(--secondary)', color: '#fff' },
      accent: { background: 'var(--accent)', color: '#fff' },
      danger: { background: 'var(--danger)', color: '#fff' },
      outline: { border: `1px solid var(--primary)`, color: 'var(--primary)', background: 'transparent' }
    };
    return (
      <button
        {...props}
        style={{
          minWidth: 88,
          padding: '8px 18px',
          borderRadius: 'var(--border-radius)',
          fontWeight: 500,
          border: styleType === 'outline' ? '1px solid var(--primary)' : 'none',
          ...styleMap[styleType],
          margin: 2,
          ...props.style,
        }}
      >
        {props.children}
      </button>
    );
  }

  // --- Main Render ---
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{
          background: 'var(--light)', boxShadow: 'var(--shadow)', borderRadius: 8, padding: '44px 42px', maxWidth: 350, width: '100%',
        }}>
          <h2 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: 18, textAlign: 'center' }}>
            ReactConnect CRM
          </h2>
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup}>
            <label>Email<br />
              <input name="email" type="email" required style={inputStyle()} />
            </label>
            <br /><br />
            <label>Password<br />
              <input name="password" type="password" required minLength={4} style={inputStyle()} />
            </label>
            <br /><br />
            {authError && <div style={{ color: 'var(--danger)', marginBottom: 10 }}>{authError}</div>}
            <ThemeButton type="submit" styleType="primary">{authMode === 'login' ? 'Login' : 'Sign Up'}</ThemeButton>
          </form>
          <div style={{ marginTop: 12, fontSize: 14, color: 'var(--secondary)' }}>
            {authMode === 'login'
              ? <>No account?{' '}
                <button onClick={() => { setAuthMode('signup'); setAuthError(''); }} style={{ background: 'none', color: 'var(--primary)', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Sign up</button></>
              : <>Already registered?{' '}
                <button onClick={() => { setAuthMode('login'); setAuthError(''); }} style={{ background: 'none', color: 'var(--primary)', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Login</button></>
            }
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard UI
  return (
    <div className="app" style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-dark)' }}>
      <nav className="navbar" style={{ position: 'static', background: 'var(--primary)', color: '#fff', boxShadow: 'var(--shadow)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="logo" style={{ fontSize: 20 }}>
            <span style={{ color: 'var(--accent)' }}>●</span>
            ReactConnect CRM
          </div>
          <div>
            <span style={{ color: 'var(--light)', fontWeight: 500, marginRight: 12 }}>{user ? user.email : ''}</span>
            <ThemeButton styleType="outline" style={{ fontWeight: 600 }} onClick={handleLogout}>Logout</ThemeButton>
          </div>
        </div>
      </nav>
      <main className="container" style={{ marginTop: 36, marginBottom: 50, maxWidth: 1080 }}>
        {/* Tabs Menu */}
        <nav style={{ display: 'flex', gap: 8, padding: '18px 0', borderBottom: '1px solid var(--gray-med)', marginBottom: 10 }}>
          <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</TabButton>
          <TabButton active={tab === 'customers'} onClick={() => setTab('customers')}>Customers</TabButton>
          <TabButton active={tab === 'interactions'} onClick={() => setTab('interactions')}>Interactions</TabButton>
          <TabButton active={tab === 'tasks'} onClick={() => setTab('tasks')}>Tasks</TabButton>
        </nav>

        {/* Dashboard Overview */}
        {tab === 'dashboard' && (
          <section>
            <h2 style={{ color: 'var(--primary)' }}>Quick Overview</h2>
            <div style={{ display: 'flex', gap: 24, margin: '24px 0', flexWrap: 'wrap' }}>
              <DashboardKPI title="Customers" value={customers.length} color="primary" />
              <DashboardKPI title="Interactions" value={interactions.length} color="accent" />
              <DashboardKPI title="Tasks Open" value={tasks.filter(t => !t.complete).length} color="secondary" />
              <DashboardKPI title="Completed" value={tasks.filter(t => t.complete).length} color="success" />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginTop: 36 }}>
              <div style={{ minWidth: 280, flex: 1 }}>
                <strong>Customers (recent)</strong>
                <CustomerTable
                  customers={customers.slice(-5).reverse()}
                  actions={false}
                />
              </div>
              <div style={{ minWidth: 280, flex: 1 }}>
                <strong>Recent Interactions</strong>
                <table className="crm-table">
                  <thead><tr><th>Type</th><th>Customer</th><th>At</th><th>Desc</th></tr></thead>
                  <tbody>
                    {[...interactions].slice(-5).reverse().map(i => <tr key={i.id}>
                      <td><b>{i.type}</b></td>
                      <td>{findName(customers, i.customerId)}</td>
                      <td>{i.timestamp}</td>
                      <td>{i.description}</td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Customers Page */}
        {tab === 'customers' && (
          <section style={{ marginTop: 10 }}>
            <h2 style={{ color: 'var(--primary)' }}>Customers</h2>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', margin: '12px 0' }}>
              <input
                type="search"
                placeholder="Search name or email"
                value={searchTerm}
                style={inputStyle({ width: 200 })}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={inputStyle({ width: 120 })}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Prospect">Prospect</option>
                <option value="Archived">Archived</option>
              </select>
              <ThemeButton styleType="accent" onClick={() => exportCSV(customers)}
                style={{ marginLeft: 12, fontWeight: 600 }}>Export CSV</ThemeButton>
            </div>
            {/* Table */}
            <CustomerTable
              customers={filteredCustomers}
              actions={true}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
            {/* Form */}
            <div style={{
              marginTop: 32,
              background: 'var(--gray-light)',
              padding: 26,
              borderRadius: 8,
              maxWidth: 400
            }}>
              <h3>{editingCustomer ? 'Edit' : 'Add'} Customer</h3>
              <form onSubmit={handleCustomerForm}>
                <label>Name<br />
                  <input type="text" required
                    value={customerForm.name}
                    onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle()} />
                </label>
                <br />
                <label>Email<br />
                  <input type="email" required
                    value={customerForm.email}
                    onChange={e => setCustomerForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle()} />
                </label>
                <br />
                <label>Phone<br />
                  <input
                    value={customerForm.phone}
                    onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))}
                    style={inputStyle()} />
                </label>
                <br />
                <label>Company<br />
                  <input
                    value={customerForm.company}
                    onChange={e => setCustomerForm(f => ({ ...f, company: e.target.value }))}
                    style={inputStyle()} />
                </label>
                <br />
                <label>Status<br />
                  <select
                    value={customerForm.status}
                    onChange={e => setCustomerForm(f => ({ ...f, status: e.target.value }))}
                    style={inputStyle()}
                  >
                    <option value="Active">Active</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Archived">Archived</option>
                  </select>
                </label>
                <br /><br />
                <ThemeButton type="submit" styleType="primary">{editingCustomer ? 'Save' : 'Add'}</ThemeButton>
                {editingCustomer && (
                  <ThemeButton type="button" styleType="secondary" onClick={resetCustomerForm}>Cancel</ThemeButton>
                )}
              </form>
            </div>
          </section>
        )}

        {/* Interactions Page */}
        {tab === 'interactions' && (
          <section style={{ marginTop: 10 }}>
            <h2 style={{ color: 'var(--primary)' }}>Interactions</h2>
            {/* Table */}
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Date/Time</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {interactions.map(i => (
                  <tr key={i.id}>
                    <td>{i.type}</td>
                    <td>{findName(customers, i.customerId)}</td>
                    <td style={{ fontSize: 13 }}>{i.timestamp}</td>
                    <td>{i.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add form */}
            <div style={{
              marginTop: 28,
              background: 'var(--gray-light)',
              padding: 22,
              borderRadius: 8,
              maxWidth: 400
            }}>
              <h3>Add Interaction</h3>
              <form onSubmit={handleInteractionForm}>
                <label>Customer<br />
                  <select
                    required
                    value={interactionForm.customerId}
                    onChange={e => setInteractionForm(f => ({ ...f, customerId: Number(e.target.value) }))}
                    style={inputStyle()}
                  >
                    <option value="">Select customer</option>
                    {customers.map(c =>
                      <option key={c.id} value={c.id}>{c.name}</option>
                    )}
                  </select>
                </label>
                <br />
                <label>Type<br />
                  <select
                    value={interactionForm.type}
                    onChange={e => setInteractionForm(f => ({ ...f, type: e.target.value }))}
                    style={inputStyle()}
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </label>
                <br />
                <label>Description<br />
                  <input
                    required
                    value={interactionForm.description}
                    onChange={e => setInteractionForm(f => ({ ...f, description: e.target.value }))}
                    style={inputStyle()} />
                </label>
                <br /><br />
                <ThemeButton type="submit" styleType="primary">Log Interaction</ThemeButton>
              </form>
            </div>
          </section>
        )}
        {/* Tasks Page */}
        {tab === 'tasks' && (
          <section style={{ marginTop: 10 }}>
            <h2 style={{ color: 'var(--primary)' }}>Tasks</h2>
            {/* Tasks table */}
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Mark</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task =>
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{findName(customers, task.customerId)}</td>
                    <td style={{ fontSize: 13 }}>{task.dueDate}</td>
                    <td>
                      {task.complete
                        ? <span style={{ color: 'var(--success)' }}>✓ Complete</span>
                        : <span style={{ color: 'var(--primary)' }}>Pending</span>
                      }
                    </td>
                    <td>
                      <input type="checkbox"
                        checked={task.complete}
                        onChange={() => handleTaskToggle(task.id)}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleDeleteTask(task.id)} style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--danger)',
                        fontSize: 19,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }} title="Delete Task">&times;</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Add task form */}
            <div style={{
              marginTop: 28,
              background: 'var(--gray-light)',
              padding: 22,
              borderRadius: 8,
              maxWidth: 400
            }}>
              <h3>Assign Task</h3>
              <form onSubmit={handleTaskForm}>
                <label>Customer<br />
                  <select
                    required
                    value={taskForm.customerId}
                    onChange={e => setTaskForm(f => ({ ...f, customerId: Number(e.target.value) }))}
                    style={inputStyle()}
                  >
                    <option value="">Select customer</option>
                    {customers.map(c =>
                      <option key={c.id} value={c.id}>{c.name}</option>
                    )}
                  </select>
                </label>
                <br />
                <label>Title<br />
                  <input
                    required
                    value={taskForm.title}
                    onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                    style={inputStyle()} />
                </label>
                <br />
                <label>Due Date<br />
                  <input type="date"
                    required
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))}
                    style={inputStyle()} />
                </label>
                <br /><br />
                <ThemeButton type="submit" styleType="primary">Assign</ThemeButton>
              </form>
            </div>
          </section>
        )}
      </main>
      {/* --- Minimal styles for CRM interface --- */}
      <style>
        {`
        .crm-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 9px;
          margin-top: 7px;
          background: var(--light);
          border-radius: 6px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }
        .crm-table th, .crm-table td {
          text-align: left;
          padding: 10px 9px;
          font-size: 1rem;
        }
        .crm-table tbody tr:nth-child(even) {
          background: var(--gray-light);
        }
        .crm-table th {
          background: var(--gray-med);
          color: var(--primary);
        }
        .crm-table td {
          border-bottom: 1px solid #eee;
        }
        `}
      </style>
    </div>
  );
}

// --- Helper Components ---
function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: active ? 'var(--light)' : 'var(--gray-light)',
        color: active ? 'var(--primary)' : 'var(--secondary)',
        border: active ? '2.5px solid var(--primary)' : '1px solid var(--gray-med)',
        borderBottom: active ? 'none' : undefined,
        fontWeight: 600,
        fontSize: '1.09rem',
        padding: '8px 20px',
        borderRadius: '8px 8px 0 0',
        boxShadow: active ? '0 2.5px 8px 0 rgba(0,123,255,0.08)' : 'none',
        cursor: 'pointer',
        outline: 'none',
      }}
    >{children}</button>
  );
}

function DashboardKPI({ title, value, color = 'primary' }) {
  const colorMap = {
    primary: 'var(--primary)',
    accent: 'var(--accent)',
    secondary: 'var(--secondary)',
    success: 'var(--success)',
  };
  return (
    <div style={{
      background: 'var(--light)',
      borderLeft: `5px solid ${colorMap[color]}`,
      borderRadius: 9,
      boxShadow: 'var(--shadow)',
      padding: '18px 24px 14px 16px',
      minWidth: 155, textAlign: 'left', fontSize: 16,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'
    }}>
      <b style={{ fontSize: 27, color: colorMap[color], marginBottom: 7 }}>{value}</b>
      <span style={{ fontWeight: 500, color: 'var(--secondary)' }}>{title}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function CustomerTable({ customers, actions = false, onEdit, onDelete }) {
  /** Renders table of customers with optional edit/delete actions */
  if (!customers.length) {
    return <div style={{ margin: '18px 0', color: 'var(--secondary)' }}>No customers to show</div>;
  }
  return (
    <table className="crm-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Company</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Created</th>
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {customers.map(c => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td>{c.email}</td>
            <td>{c.company}</td>
            <td>{c.phone}</td>
            <td>
              <span style={{
                color: c.status === 'Active' ? 'var(--success)'
                  : c.status === 'Archived' ? 'var(--danger)' : 'var(--primary)'
              }}>
                {c.status}
              </span>
            </td>
            <td style={{ fontSize: 13 }}>{c.created}</td>
            {actions && (
              <td>
                <button title="Edit" style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: 17,
                  cursor: 'pointer',
                }} onClick={() => onEdit && onEdit(c)}>&#9998;</button>{' '}
                <button title="Delete" style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--danger)',
                  fontWeight: 700,
                  fontSize: 19,
                  cursor: 'pointer',
                  marginLeft: 10,
                }} onClick={() => onDelete && onDelete(c.id)}>&times;</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// --- Utility Styling ---
function inputStyle(overrides = {}) {
  return {
    width: '100%',
    fontSize: 15.2,
    padding: '8px 8px',
    marginTop: 1,
    marginBottom: 1,
    borderRadius: 4,
    border: '1px solid var(--gray-med)',
    outline: 'none',
    background: 'var(--light)',
    color: 'var(--text-dark)',
    boxSizing: 'border-box',
    ...overrides,
  };
}

// --- Utility Functions ---
function findName(customers, id) {
  const c = customers.find(c => c.id === id);
  return c ? c.name : '(unknown)';
}

export default App;
