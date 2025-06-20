import React, { useState, useEffect } from 'react';
import './App.css';

/*
  --- Visually Intensive, Modern CRM Theme Overhaul ---
  Adds animated gradients, bolded shadows, card containers, glassmorphism for forms,
  soft text glows, interactive motion effects, and much richer color interplay.
  All CRM sections/cards/fields are visually emphasized; form inputs and buttons receive depth and animation.
  Only JavaScript, CSS/inline, and React; no external UI libraries.
*/

/**
 * --- Theme Variables (overriding App.css) ---
 * --primary: #007bff;
 * --secondary: #6c757d;
 * --accent: #17a2b8;
 * --bg: #f8fafc;
 */

const themeVars = {
  '--primary': '#4F8CFF',
  '--secondary': '#6c757d',
  '--accent': '#AB47BC',
  '--bg': 'linear-gradient(135deg, #e3f2fd 0%, #f8fafc 80%)',
  '--light': '#fff',
  '--danger': '#ff5252',
  '--success': '#28a745',
  '--border-radius': '16px',
  '--shadow': '0 6px 30px 0 rgba(25,32,61,0.14), 0 1.5px 6px rgba(79,140,255,0.08)',
  '--glass': 'rgba(255,255,255,0.65)',
  '--glass-blur': 'blur(8px)',
  '--gray-light': 'rgba(79,140,255,0.06)',
  '--gray-med': 'rgba(79,140,255,0.13)',
  '--text-dark': '#1f2347'
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
    /**
     * Dynamic, animated button for emphasized modern CRM.
     * Ripple, rich color, glow-on-hover, slight pop, shadow.
     */
    const styleMap = {
      primary: {
        background: 'linear-gradient(90deg, var(--primary), #4f68ee 85%)', color: '#fff',
        boxShadow: '0 3px 14px #81befd33, 0 1.5px 6px #4F8CFF22'
      },
      secondary: {
        background: 'linear-gradient(90deg, var(--secondary), #929292 85%)', color: '#fff', boxShadow: '0 1.5px 7px #6c757d33'
      },
      accent: {
        background: 'linear-gradient(90deg, var(--accent), #f06292 80%)', color: '#fff',
        boxShadow: '0 4px 14px #ab47bc33'
      },
      danger: {
        background: 'linear-gradient(90deg, var(--danger), #ff899a 85%)', color: '#fff',
        boxShadow: '0 2.5px 10px #ff525244'
      },
      outline: {
        border: '2px solid var(--primary)', color: 'var(--primary)', background: 'rgba(255,255,255,0.12)', boxShadow: '0 0.5px 2px #bcd5ed80'
      }
    };

    return (
      <button
        {...props}
        style={{
          minWidth: 96,
          padding: '11px 24px',
          fontSize: 17,
          borderRadius: '13px',
          fontWeight: 600,
          border: styleType === 'outline' ? styleMap['outline'].border : 'none',
          boxShadow: styleMap[styleType]?.boxShadow,
          background: styleMap[styleType]?.background,
          color: styleMap[styleType]?.color,
          margin: 3,
          transition: 'all 0.17s cubic-bezier(.64,.11,.36,.9)',
          outline: 'none',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          letterSpacing: 0.04,
          filter: 'drop-shadow(0px 2px 6px #4f8cff27)',
          ...props.style,
        }}
        onMouseDown={e => {
          // button pop/bounce (micro interaction)
          e.target.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.96)' },
            { transform: 'scale(1.03)' },
            { transform: 'scale(1)' }
          ], { duration: 220, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
        }}
      >
        <span style={{
          display: 'inline-block',
          textShadow: styleType === 'primary' || styleType === 'accent'
            ? '0 3px 19px #b3e2fd55, 0 0 9px #0059c1'
            : (styleType === 'danger' ? '0 1px 5px #ff5a5a88' : undefined)
        }}>
          {props.children}
        </span>
      </button>
    );
  }

  // --- Main Render ---
  if (!user) {
    // Modern authentication: animated glass morphism, lively micro-animations, deeper shadow, lively background blobs
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 60% 40%, #e8eeff 25%, #efcfff 87%, #cae4ff 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Animated Background Blobs & Gradients */}
        <svg width="700" height="400" style={{
          position: 'absolute', top: -90, left: -140, zIndex: 0, opacity: 0.18, pointerEvents: 'none',
          filter: 'blur(11px)'
        }}>
          <ellipse cx="240" cy="180" rx="320" ry="100" fill="#4f8cff" />
          <ellipse cx="420" cy="210" rx="200" ry="67" fill="#ab47bc" />
        </svg>
        <div style={{
          background: 'var(--glass)',
          boxShadow: authMode === 'signup'
            ? '0 12px 74px 26px #ab47bc5c, 0 2.5px 22px #ab47bc46'
            : '0 12px 73px 15px #4f8cff38, 0 2.5px 21px #4f8cff26',
          borderRadius: 36,
          padding: '52px 54px 38px 54px',
          maxWidth: 450,
          width: '98vw',
          position: 'relative',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          animation: 'glow-card 2.7s infinite alternate',
          border: authMode === 'signup'
            ? '3.5px solid #ab47bc77'
            : '3.5px solid #4f8cff49',
          zIndex: 2,
          overflow: 'hidden'
        }}>
          <h2 style={{
            color: authMode === 'signup' ? '#AB47BC' : 'var(--primary)',
            margin: 0, marginBottom: 19, textAlign: 'center',
            textShadow: authMode === 'signup'
              ? '0 9px 44px #df8cff59, 0 1px 1px #c873d0'
              : '0 7px 32px #b3e2fd00, 0 0 2.5px #5999e6c8',
            fontWeight: 800, letterSpacing: '0.034em',
            fontSize: 36,
            animation: 'auth-title-pop 1.2s cubic-bezier(.95,.01,.68,1.37)'
          }}>
            <span style={{
              fontWeight: 900, fontSize: authMode === 'signup' ? 44 : 41,
              color: authMode === 'signup' ? '#fff' : 'var(--accent)',
              background: authMode === 'signup'
                ? 'linear-gradient(92deg,#ab47bc 20%, #e3ffcc 81%)'
                : 'linear-gradient(40deg,#ab47bc 13%, #4f8cff 76%)',
              padding: '2px 13px', borderRadius: 24, boxShadow: '0 7px 14px #ab47bc25',
              filter: 'drop-shadow(0 2.5px 17px #ab47bc44)'
            }}>⧉</span><br />
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <div style={{
            margin: authMode === 'signup' ? '-17px 0 19px 0' : '-12px 0 22px 0',
            color: '#715c9e',
            textAlign: 'center',
            fontSize: 15.2,
            fontWeight: 500,
            letterSpacing: '.01em',
            opacity: 0.8
          }}>
            {authMode === 'login'
              ? `Sign in with your CRM account below`
              : `Sign up for instant access to your CRM`}
          </div>
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} autoComplete="off">
            <div style={{ marginBottom: 28 }}>
              {/* Email input */}
              <div style={{
                position: 'relative',
                marginBottom: 15,
                background: 'rgba(255,255,255,0.45)',
                borderRadius: 13,
                boxShadow: '0 0.5px 3.5px #d9cce933'
              }}>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  aria-label="Email"
                  autoComplete="username"
                  style={{
                    ...inputStyle(),
                    fontSize: 17.5,
                    border: '2px solid #c8defc',
                    paddingTop: 19,
                    paddingBottom: 7,
                    background: 'rgba(255,255,255,0.70)',
                    boxShadow: '0 1.5px 8px #e8eafe1a,inset 0 1px 2px #e0e2ff66',
                  }}
                  id="signup-email"
                />
                <label htmlFor="signup-email" style={{
                  position: 'absolute',
                  left: 19, top: 5,
                  fontSize: 14.2,
                  color: '#4F8CFF',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  pointerEvents: 'none',
                }}>Email</label>
              </div>
              {/* Password input */}
              <div style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.41)',
                borderRadius: 13,
                boxShadow: '0 0.5px 2.6px #ab47bc16'
              }}>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={4}
                  aria-label="Password"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  style={{
                    ...inputStyle(),
                    fontSize: 17.1,
                    border: '2px solid #eac9fa',
                    paddingTop: 19,
                    paddingBottom: 7,
                    marginBottom: 0,
                    background: 'rgba(255,255,255,0.73)',
                  }}
                  id="signup-password"
                />
                <label htmlFor="signup-password" style={{
                  position: 'absolute',
                  left: 19, top: 5,
                  fontSize: 14.3,
                  color: '#AB47BC',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  pointerEvents: 'none',
                }}>Password</label>
              </div>
            </div>
            {authError && <div style={{
              color: 'var(--danger)',
              marginBottom: 10,
              fontWeight: 600,
              textShadow: '0 1.5px 5px #ffe2e2'
            }}>{authError}</div>}
            <ThemeButton
              type="submit"
              styleType={authMode === 'signup' ? 'accent' : 'primary'}
              style={{
                boxShadow: authMode === 'signup'
                  ? '0 4px 21px #ab47bc44, 0 2px 7px #df8cff23'
                  : undefined,
                fontWeight: 700,
                letterSpacing: '.03em',
                fontSize: 18,
                marginBottom: 6,
                minWidth: 124
              }}
            >
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </ThemeButton>
          </form>
          {/* Navigation toggle */}
          <div style={{
            marginTop: 18,
            fontSize: 15.2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {authMode === 'login'
              ? (
                <>
                  <span style={{
                    color: '#A6A2B2',
                    marginRight: 10
                  }}>No account?</span>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    style={{
                      background: 'linear-gradient(91deg,#ab47bc,#4f8cff)',
                      color: '#fff',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 16,
                      marginLeft: 1,
                      padding: '7px 20px',
                      boxShadow: '0 1.5px 7px #ab47bc18,0 0.5px 1px #eac9fa22',
                      transition: 'background 0.18s'
                    }}>
                    Sign up
                  </button>
                </>
              )
              : (
                <>
                  <span style={{
                    color: '#A6A2B2', marginRight: 10
                  }}>Already registered?</span>
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    style={{
                      background: 'linear-gradient(89deg,#4f8cff,#ab47bc)',
                      color: '#fff',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 16,
                      marginLeft: 1,
                      padding: '7px 20px',
                      boxShadow: '0 1.5px 7px #4f8cff18,0 0.5px 1px #eac9fa21',
                      transition: 'background 0.18s'
                    }}>
                    Login
                  </button>
                </>
              )
            }
          </div>
          {/* Card Glow Keyframe Animation */}
          <style>
            {`
              @keyframes glow-card {
                from { box-shadow: 0 9px 54px 12px #ac9eda46, 0 1.5px 16px #e7eafc27; }
                to   { box-shadow: 0 18px 68px 18px #7ed9fb7b, 0 1.5px 16px #b498eef7; }
              }
              input[type='email'], input[type='password'] {
                outline: none;
              }
              input[type='email']:focus, input[type='password']:focus {
                border-color: #ab47bc;
                box-shadow: 0 0 0 3px #ab47bc41;
                background: #fff;
              }
              input[type='email']::placeholder, input[type='password']::placeholder {
                color: #b2b2cc99;
                letter-spacing: 0.009em;
                font-size: 15.7px;
                font-style: italic;
              }
            `}
          </style>
        </div>
        {/* Decorative blob shape or SVG for rich look (background, visually reinforcing "signup" theme) */}
        {authMode === 'signup' && (
          <svg width="480" height="360" viewBox="0 0 480 360" style={{
            position: 'absolute',
            left: -64,
            bottom: -62,
            zIndex: 0,
            opacity: 0.24,
            pointerEvents: 'none'
          }}>
            <ellipse cx="240" cy="200" rx="230" ry="80" fill="#ab47bc" />
            <ellipse cx="370" cy="190" rx="120" ry="77" fill="#f7bfff" />
            <ellipse cx="130" cy="270" rx="60" ry="32" fill="#4f8cff" />
          </svg>
        )}
      </div>
    );
  }

  // Main dashboard UI
  return (
    <div className="app"
      style={{
        background: 'linear-gradient(133deg, #e3f2fd 0%, #f8fafc 70%, #a8cfff22 100%)',
        minHeight: '100vh',
        color: 'var(--text-dark)',
      }}
    >
      <nav
        className="navbar"
        style={{
          background: 'linear-gradient(90deg, #4F8CFF, #ab47bc 83%)',
          color: '#fff',
          boxShadow: '0 4px 28px -10px #8553C637, 0 0.5px 3px #4F8CFF33',
          minHeight: 70,
          position: 'static'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <div className="logo" style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 0.02,
            color: '#fff',
            textShadow: '0 2px 14px #4f8cff67,0 1px 1px #a087f2'
          }}>
            <span style={{ color: '#e3ffcc', fontSize: 29, marginRight: 9, filter: 'drop-shadow(0 2px 9px #ffffff44)' }}>
              <span style={{ fontWeight: 900 }}>❉</span>
            </span>
            ReactConnect CRM
          </div>
          <div>
            <span style={{
              color: '#fff',
              fontWeight: 600,
              fontSize: 15.5,
              background: 'rgba(188, 215, 237, 0.14)',
              padding: '5px 12px',
              borderRadius: 8,
              marginRight: 12,
              boxShadow: '0 1.5px 4px #4f8cff13'
            }}>
              {user ? user.email : ''}
            </span>
            <ThemeButton
              styleType="outline"
              style={{
                fontWeight: 700,
                color: '#fff',
                border: '2.2px solid #fff',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.09),rgba(211,211,211,0.03))'
              }}
              onClick={handleLogout}
            >Logout</ThemeButton>
          </div>
        </div>
      </nav>
      <main className="container"
        style={{
          marginTop: 52,
          marginBottom: 65,
          maxWidth: 1200,
          width: '96%',
        }}
      >
        {/* Tabs Menu */}
        <nav style={{
          display: 'flex',
          gap: 8,
          padding: '14px 0 18px 0',
          borderBottom: '0px solid transparent',
          marginBottom: 3,
          position: 'relative',
        }}>
          <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</TabButton>
          <TabButton active={tab === 'customers'} onClick={() => setTab('customers')}>Customers</TabButton>
          <TabButton active={tab === 'interactions'} onClick={() => setTab('interactions')}>Interactions</TabButton>
          <TabButton active={tab === 'tasks'} onClick={() => setTab('tasks')}>Tasks</TabButton>
          {/* Animated underline */}
          <div style={{
            position: 'absolute',
            height: 4,
            left: `${tab === 'dashboard' ? 0 : tab === 'customers' ? 25 : tab === 'interactions' ? 49 : 78}%`,
            width: '21%',
            background: 'linear-gradient(90deg,#4f8cff,#ab47bc 75%)',
            borderRadius: 9,
            boxShadow: '0 3px 9px #ab47bc21',
            bottom: -4,
            transition: 'left 0.25s cubic-bezier(.74,.3,.59,1), background 0.3s'
          }} />
        </nav>

        {/* Dashboard Overview */}
        {tab === 'dashboard' && (
          <section style={{
            margin: '0 -28px', padding: '12px 8px 0 8px'
          }}>
            <h2 style={{
              color: 'var(--primary)',
              fontSize: 32,
              marginLeft: 1,
              marginBottom: 14,
              fontWeight: 800,
              textShadow: '0 2px 24px #6ca7f877,0 1.5px 7px #4F8CFF11'
            }}>Quick Overview</h2>
            <div style={{
              display: 'flex', gap: 28, margin: '29px 0', flexWrap: 'wrap',
              justifyContent: 'flex-start'
            }}>
              <DashboardKPI title="Customers" value={customers.length} color="primary" />
              <DashboardKPI title="Interactions" value={interactions.length} color="accent" />
              <DashboardKPI title="Tasks Open" value={tasks.filter(t => !t.complete).length} color="secondary" />
              <DashboardKPI title="Completed" value={tasks.filter(t => t.complete).length} color="success" />
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 40,
              marginTop: 38,
              alignItems: 'stretch'
            }}>
              <div style={{
                minWidth: 290, flex: 1.3, background: 'var(--glass)',
                borderRadius: 18, boxShadow: '0 7px 26px #4f8cff1c, 0 0.5px 2px #4f8cff0c',
                padding: '24px 18px 8px 15px',
                marginRight: 2,
                backdropFilter: 'var(--glass-blur)'
              }}>
                <strong style={{ fontWeight: 700, letterSpacing: '0.08em', color: '#293661' }}>Customers (recent)</strong>
                <CustomerTable
                  customers={customers.slice(-5).reverse()}
                  actions={false}
                />
              </div>
              <div style={{
                minWidth: 260, flex: 1,
                background: 'var(--glass)',
                borderRadius: 18,
                boxShadow: '0 7px 24px #4f8cff23, 0 0.5px 2px #4f8cff14',
                padding: '24px 15px 8px 15px',
                backdropFilter: 'var(--glass-blur)'
              }}>
                <strong style={{
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#2C2646'
                }}>Recent Interactions</strong>
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
          <section style={{ marginTop: 12, paddingBottom: 32 }}>
            <h2 style={{
              color: '#AB47BC',
              fontSize: 31,
              textShadow: '0 2px 13px #7e47bc11,0 1px 3px #4F8CFF22',
              marginBottom: 5,
              letterSpacing: '0.01em',
              fontWeight: 800,
            }}>Customers</h2>
            {/* Filters card */}
            <div style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              margin: '23px 0 9px 0',
              background: 'linear-gradient(90deg, #ffeffd40 40%,#edeaff 100%)',
              padding: '12px 21px',
              borderRadius: 15,
              boxShadow: '0 1.5px 9px #ab47bc22',
              flexWrap: 'wrap'
            }}>
              <input
                type="search"
                placeholder="Search name or email"
                value={searchTerm}
                style={inputStyle({ width: 206 })}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={inputStyle({ width: 131 })}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Prospect">Prospect</option>
                <option value="Archived">Archived</option>
              </select>
              <ThemeButton styleType="accent" onClick={() => exportCSV(customers)}
                style={{ marginLeft: 12, fontWeight: 700, letterSpacing: 0.07 }}>Export CSV</ThemeButton>
            </div>
            {/* Table in card */}
            <div style={{
              boxShadow: '0 9px 26px 0 #abb6f622, 0 0.5px 4px #AB47BC21',
              borderRadius: 18,
              margin: '13px 0 19px 0',
              background: 'rgba(251, 253, 255, 0.97)',
              padding: '7px 7px',
            }}>
              <CustomerTable
                customers={filteredCustomers}
                actions={true}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
              />
            </div>
            {/* Form as glass card */}
            <div style={{
              marginTop: 35,
              background: 'var(--glass)',
              padding: 32,
              borderRadius: 18,
              maxWidth: 445,
              boxShadow: '0 4px 21px 2px #bbbbee22',
              backdropFilter: 'var(--glass-blur)'
            }}>
              <h3 style={{
                fontWeight: 800,
                fontSize: 21,
                color: '#4F8CFF',
                letterSpacing: 0.01,
                marginBottom: 20
              }}>{editingCustomer ? 'Edit' : 'Add'} Customer</h3>
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
          <section style={{ marginTop: 13 }}>
            <h2 style={{
              color: '#4F8CFF',
              fontSize: 30,
              textShadow: '0 2px 13px #6ca7f877,0 1.5px 7px #4F8CFF11',
              fontWeight: 800,
              letterSpacing: '0.01em',
              marginBottom: 15
            }}>Interactions</h2>
            {/* Table card */}
            <div style={{
              background: 'rgba(251, 253, 255, 0.99)',
              boxShadow: '0 7px 24px #4f8cff13, 0 0.5px 7px #AB47BC22',
              borderRadius: 14,
              padding: '12px 5px 6px 5px',
              marginBottom: 28
            }}>
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
            </div>
            {/* Add form */}
            <div style={{
              marginTop: 8,
              background: 'var(--glass)',
              padding: 28,
              borderRadius: 15,
              maxWidth: 430,
              boxShadow: '0 5px 21px 2px #707fbe22',
              backdropFilter: 'var(--glass-blur)'
            }}>
              <h3 style={{
                fontWeight: 800,
                fontSize: 20,
                color: '#4F8CFF',
                marginBottom: 17,
              }}>Add Interaction</h3>
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
          <section style={{ marginTop: 11 }}>
            <h2 style={{
              color: '#28a745',
              fontSize: 29,
              textShadow: '0 2px 13px #acacac19,0 1.5px 7px #7beaaa23',
              fontWeight: 800,
              letterSpacing: '0.01em',
              marginBottom: 15
            }}>Tasks</h2>
            {/* Tasks table in card */}
            <div style={{
              background: 'rgba(251, 253, 255, 0.99)',
              boxShadow: '0 7px 24px #4f8cff13, 0 0.5px 7px #28a74522',
              borderRadius: 14,
              padding: '12px 5px 6px 5px',
              marginBottom: 23
            }}>
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
                          ? <span style={{ color: '#31995f', fontWeight: 700, textShadow: '0 2px 12px #28a74544' }}>✓ Complete</span>
                          : <span style={{ color: '#4F8CFF', fontWeight: 700, textShadow: '0 2px 7px #4f8cff27' }}>Pending</span>
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
                          color: '#ff5252',
                          fontSize: 21,
                          cursor: 'pointer',
                          fontWeight: 900,
                          backgroundClip: 'text',
                        }} title="Delete Task">&times;</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Add task form */}
            <div style={{
              marginTop: 6,
              background: 'var(--glass)',
              padding: 28,
              borderRadius: 13,
              maxWidth: 430,
              boxShadow: '0 5px 21px 2px #31995f22',
              backdropFilter: 'var(--glass-blur)'
            }}>
              <h3 style={{
                fontWeight: 800,
                fontSize: 20,
                color: '#28a745',
                marginBottom: 17,
              }}>Assign Task</h3>
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
      {/* --- Visually Intensive Styles for CRM Interface --- */}
      <style>
        {`
        .crm-table {
          width: 100%;
          border-collapse: separate;
          margin-bottom: 12px;
          margin-top: 8px;
          background: linear-gradient(114deg,#fff 64%,#eff4fc 100%);
          border-radius: 19px;
          overflow: hidden;
          box-shadow: 0 3.2px 24px #9aaad824,0 1.2px 6px #ab47bc13;
          transition: box-shadow 0.21s, background 0.18s;
        }
        .crm-table th, .crm-table td {
          text-align: left;
          padding: 15px 14px;
          font-size: 1.04rem;
          border-bottom: 1.6px solid #e7f0fe31;
          transition: background 0.16s;
        }
        .crm-table tbody tr {
          transition: background 0.18s;
        }
        .crm-table tbody tr:hover {
          background: linear-gradient(90deg, #e6f1ff44 60%, #f6eafe11 100%);
          box-shadow: 0 3px 19px #4f8cff2c;
        }
        .crm-table tbody tr:nth-child(even) {
          background: #e6e6f673;
        }
        .crm-table th {
          background: linear-gradient(90deg,#f9f7fe 40%,#e3f2fd 100%);
          color: #4F8CFF;
          font-weight: 900;
          font-size: 1.07rem;
          letter-spacing: 0.03em;
          border-bottom: 2.2px solid #e9e4fa36;
        }
        .crm-table td {
          border-bottom: 1.1px solid #efe9fc;
        }
        @keyframes card-shimmer {
          from { filter: brightness(1) drop-shadow(0 0px 0px #fff0); }
          40% { filter: brightness(1.045) drop-shadow(0 3.5px 10px #deeaff48); }
          80% { filter: brightness(1.07) drop-shadow(0 9px 24px #ab47bc11); }
          to   { filter: brightness(1.09) drop-shadow(0 17px 32px #4f8cff17); }
        }
        @keyframes auth-title-pop {
          0% { opacity: 0; transform: scale(0.95) translateY(12px);}
          60% { opacity: 1; transform: scale(1.07) translateY(-3px);}
          85% { transform: scale(0.96);}
          100% { opacity: 1; transform: scale(1);}
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
        background: active
          ? 'linear-gradient(90deg, #ffffff 60%, #e3f2fd 100%)'
          : 'rgba(255,255,255,0.19)',
        color: active ? '#4F8CFF' : '#AB47BC',
        border: active ? '2.7px solid #4F8CFF' : '2px solid #e5eaff',
        borderBottom: active ? 'none' : undefined,
        fontWeight: 700,
        fontSize: '1.14rem',
        letterSpacing: 0.03,
        padding: '12px 30px',
        borderRadius: '18px 18px 0 0',
        boxShadow: active
          ? '0 4px 13px #4f8cff18, 0 0.5px 1px #4F8CFF11'
          : '0 1px 3px #ab47bc09',
        cursor: 'pointer',
        outline: 'none',
        filter: active ? 'drop-shadow(0 1px 10px #ab47bc39)' : undefined,
        transition: 'all 0.20s cubic-bezier(.64,.11,.36,.9)',
        marginBottom: -1,
      }}
    >{children}</button>
  );
}

function DashboardKPI({ title, value, color = 'primary' }) {
  const colorMap = {
    primary: '#4F8CFF',
    accent: '#AB47BC',
    secondary: '#6c757d',
    success: '#28a745'
  };
  // Dynamic glowing card effect, scale pop, shimmer animation on hover
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{
        background: hover
          ? 'linear-gradient(120deg, #e3f2fd 80%, #d7ced3 100%)'
          : 'linear-gradient(120deg, #f8fafc 70%, #e3f2fd 100%)',
        borderLeft: `8px solid ${colorMap[color]}`,
        borderRadius: 28,
        boxShadow: hover
          ? `0 26px 68px 13px ${colorMap[color]}3a, 0 1.5px 24px #ab47bc25`
          : '0 8px 38px #4f8cff17, 0 0.5px 7px #ab47bc17',
        padding: '28px 41px 18px 24px',
        minWidth: 195,
        maxWidth: 280,
        textAlign: 'left',
        fontSize: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginBottom: 12,
        position: 'relative',
        transition: 'box-shadow 0.19s cubic-bezier(.62,.2,.72,.9), background 0.2s, transform 0.18s cubic-bezier(.62,.4,.19,1.25)',
        cursor: 'pointer',
        overflow: 'hidden',
        transform: hover ? 'scale(1.04)' : 'scale(1)',
        animation: hover ? 'card-shimmer 1.16s linear infinite alternate' : undefined
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <b style={{
        fontSize: 38,
        color: colorMap[color],
        marginBottom: 9,
        textShadow: `0 4px 28px ${colorMap[color]}89, 0 1px 4px #4f8cff33`
      }}>{value}</b>
      <span style={{
        fontWeight: 800, color: '#5e658c', fontSize: 16.9, letterSpacing: 0.04
      }}>{title}</span>
      <span style={{
        position: 'absolute', bottom: -11, right: -14, opacity: 0.14,
        fontSize: 72, fontWeight: 900, color: colorMap[color], pointerEvents: 'none'
      }}>❉</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function CustomerTable({ customers, actions = false, onEdit, onDelete }) {
  /** Renders table of customers with optional edit/delete actions */
  if (!customers.length) {
    return <div style={{
      margin: '18px 0',
      color: '#b1b3bf',
      fontWeight: 600,
      fontSize: 18,
      textAlign: 'center'
    }}>No customers to show</div>;
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
                color: c.status === 'Active' ? '#28a745'
                  : c.status === 'Archived' ? '#ff5252' : '#4F8CFF',
                fontWeight: 700,
                letterSpacing: 0.02
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
                  color: '#4F8CFF',
                  fontWeight: 900,
                  fontSize: 21,
                  cursor: 'pointer',
                  marginRight: 6,
                  borderRadius: 7,
                  boxShadow: '0 1px 6px #4f8cff18',
                  transition: 'transform 0.12s, color 0.14s, box-shadow 0.16s',
                  padding: '2px 9px'
                }}
                  onClick={() => onEdit && onEdit(c)}
                  onMouseDown={e => { e.target.style.transform = 'scale(1.17)'; e.target.style.color='#ab47bc'; e.target.style.boxShadow='0 5px 12px #ab47bc38'; }}
                  onMouseUp={e => { e.target.style.transform = 'scale(1)';  e.target.style.color='#4F8CFF'; e.target.style.boxShadow='0 1px 6px #4f8cff18'; }}
                  onMouseLeave={e => {e.target.style.transform = 'scale(1)';  e.target.style.color='#4F8CFF'; e.target.style.boxShadow='0 1px 6px #4f8cff18';}}
                >&#9998;</button>{' '}
                <button title="Delete" style={{
                  border: 'none',
                  background: 'none',
                  color: '#ff5252',
                  fontWeight: 900,
                  fontSize: 25,
                  cursor: 'pointer',
                  marginLeft: 7,
                  borderRadius: 7,
                  boxShadow: '0 1px 6px #ff525223',
                  transition: 'transform 0.13s, color 0.15s, box-shadow 0.17s',
                  padding: '2px 12px'
                }}
                  onClick={() => onDelete && onDelete(c.id)}
                  onMouseDown={e => {e.target.style.transform = 'scale(1.21)'; e.target.style.color='#c51c36'; e.target.style.boxShadow='0 7px 16px #ff525249';}}
                  onMouseUp={e => {e.target.style.transform = 'scale(1)'; e.target.style.color='#ff5252'; e.target.style.boxShadow='0 1px 6px #ff525223';}}
                  onMouseLeave={e => {e.target.style.transform = 'scale(1)'; e.target.style.color='#ff5252'; e.target.style.boxShadow='0 1px 6px #ff525223';}}
                >&times;</button>
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
    fontSize: 16.4,
    padding: '13px 15px',
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 13,
    border: '2.1px solid #bcd5ed',
    outline: 'none',
    background: 'rgba(255,255,255,0.79)',
    color: 'var(--text-dark)',
    boxSizing: 'border-box',
    boxShadow: '0 2px 13px #e3eafc18, 0 2.5px 7px #4f8cff09 inset',
    transition: 'border-color 0.23s, box-shadow 0.29s',
    fontWeight: 500,
    letterSpacing: 0.013,
    ...overrides,
  };
}

// --- Utility Functions ---
function findName(customers, id) {
  const c = customers.find(c => c.id === id);
  return c ? c.name : '(unknown)';
}

export default App;
