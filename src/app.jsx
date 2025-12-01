import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Wallet,
  Briefcase,
  CheckSquare,
  Settings,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  MapPin,
  Building2,
  Euro,
  TrendingUp,
  AlertCircle,
  Save,
  Check,
  X,
  Search,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
} from 'firebase/firestore';

// --- Firebase Configuration (Your specific, active keys inserted here) ---
const firebaseConfig = {
  apiKey: 'AIzaSyBQK0DwiwqVN8Bi-hfT_BldMSI-jBB1kj8',
  authDomain: 'geneva-move.firebaseapp.com',
  projectId: 'geneva-move',
  storageBucket: 'geneva-move.firebasestorage.app',
  messagingSenderId: '502308553916',
  appId: '1:502308553916:web:5a559d29563fb0ca753cb9',
};

// Safety check to ensure the actual key is being used
const IS_PLACEHOLDER_KEY = firebaseConfig.apiKey === 'AIzaSy...';

if (IS_PLACEHOLDER_KEY) {
  // This warning should no longer appear since your key is now inserted above
  console.error('FIREBASE CONFIGURATION MISSING.');
}

// Conditional Initialization
const app = !IS_PLACEHOLDER_KEY ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = 'geneva-family-dashboard'; // Hardcoded shared ID for the project

// --- Initial Data (Defined as plain JavaScript objects) ---

const INITIAL_JOBS = [
  {
    id: 'job-1',
    title: 'BIM Modeler (Revit/Civil 3D)',
    company: 'SwissEngage Structures',
    location: 'Geneva (Plan-les-Ouates)',
    salary_min: 85000,
    salary_max: 95000,
    currency: 'CHF',
    description:
      'Looking for an experienced BIM modeler for large-scale infrastructure projects. Must be fluent in French.',
    requirements: ['Revit', 'AutoCAD', 'Civil 3D', '3+ years exp'],
    status: 'saved',
    postedDate: '2 days ago',
    isAiFound: true,
  },
  {
    id: 'job-2',
    title: 'Senior Draftsperson - Architecture',
    company: 'Atelier Leman',
    location: 'Geneva (Center)',
    salary_min: 90000,
    salary_max: 110000,
    currency: 'CHF',
    description:
      'High-end residential firm seeks detail-oriented drafter. ArchiCAD experience preferred but Revit accepted.',
    requirements: ['ArchiCAD', 'Detailing', 'French C1'],
    status: 'saved',
    postedDate: '5 days ago',
    isAiFound: true,
  },
  {
    id: 'job-3',
    title: 'BIM Coordinator',
    company: 'ConstructGeneva',
    location: 'Geneva (Airport Area)',
    salary_min: 115000,
    salary_max: 130000,
    currency: 'CHF',
    description: 'Coordinate BIM workflows between MEP and Structural teams.',
    requirements: ['Navisworks', 'BIM Track', 'Leadership'],
    status: 'saved',
    postedDate: '1 week ago',
    isAiFound: true,
  },
];

const INITIAL_BUDGET = [
  {
    id: 'inc-1',
    name: 'Primary Salary (Geneva)',
    amount: 95000,
    type: 'income',
    frequency: 'yearly',
    isSalary: true,
    currency: 'CHF',
  },
  {
    id: 'exp-1',
    name: 'Rent (Pays de Gex - T4)',
    amount: 1800,
    type: 'expense',
    frequency: 'monthly',
    currency: 'EUR',
  },
  {
    id: 'exp-2',
    name: 'Groceries (Family of 4)',
    amount: 800,
    type: 'expense',
    frequency: 'monthly',
    currency: 'EUR',
  },
  {
    id: 'exp-3',
    name: 'Health Insurance (LAMal Frontalier)',
    amount: 350,
    type: 'expense',
    frequency: 'monthly',
    currency: 'CHF',
  }, // Approx for 2 adults
  {
    id: 'exp-4',
    name: 'Utilities (Elec/Heat/Water)',
    amount: 200,
    type: 'expense',
    frequency: 'monthly',
    currency: 'EUR',
  },
  {
    id: 'exp-5',
    name: 'School Canteen/Periscolaire',
    amount: 150,
    type: 'expense',
    frequency: 'monthly',
    currency: 'EUR',
  },
  {
    id: 'exp-6',
    name: 'Car Insurance + Fuel',
    amount: 180,
    type: 'expense',
    frequency: 'monthly',
    currency: 'EUR',
  },
  {
    id: 'exp-7',
    name: 'Léman Express Pass (Unireso)',
    amount: 120,
    type: 'expense',
    frequency: 'monthly',
    currency: 'CHF',
  },
];

const INITIAL_CHECKLIST = [
  // Admin Belgium
  {
    id: 'be-1',
    text: 'Notify Commune of departure (Radiation)',
    category: 'Belgium Exit',
    completed: false,
  },
  {
    id: 'be-2',
    text: 'Get E-411 form (Proof of change of residence)',
    category: 'Belgium Exit',
    completed: false,
  },
  {
    id: 'be-3',
    text: 'Forward mail with Bpost',
    category: 'Belgium Exit',
    completed: false,
  },

  // Admin France
  {
    id: 'fr-1',
    text: 'Find guarantor for housing (Garantme or employer)',
    category: 'Housing',
    completed: false,
  },
  {
    id: 'fr-2',
    text: 'Sign Lease (Bail)',
    category: 'Housing',
    completed: false,
  },
  {
    id: 'fr-3',
    text: 'Home Insurance (Mandatory at signing)',
    category: 'Housing',
    completed: false,
  },
  {
    id: 'fr-4',
    text: 'Register electricity (EDF/Engie)',
    category: 'Housing',
    completed: false,
  },

  // Cross Border / Swiss
  {
    id: 'ch-1',
    text: 'Apply for G Permit (Permis Frontalier)',
    category: 'Swiss Admin',
    completed: false,
  },
  {
    id: 'ch-2',
    text: 'Choose Health Insurance (CNTFS choice form)',
    category: 'Swiss Admin',
    completed: false,
    notes:
      'Critical: You have 3 months to choose LAMal or CMU. Once chosen, it is irrevocable.',
  },
  {
    id: 'ch-3',
    text: 'Open Swiss Bank Account (IBAN CH)',
    category: 'Swiss Admin',
    completed: false,
  },
  {
    id: 'ch-4',
    text: 'Open French Bank Account (IBAN FR)',
    category: 'French Admin',
    completed: false,
  },

  // Car Import (The big one)
  {
    id: 'car-1',
    text: 'Get Certificate of Conformity (COC) from manufacturer',
    category: 'Car Import',
    completed: false,
  },
  {
    id: 'car-2',
    text: 'Get "Quitus Fiscal" from French tax office (VAT clearance)',
    category: 'Car Import',
    completed: false,
    notes: 'Free, but needs proof of residence and registration.',
  },
  {
    id: 'car-3',
    text: 'Pass "Contrôle Technique" in France',
    category: 'Car Import',
    completed: false,
    notes:
      'Even if Belgian one is valid, France often requires a fresh one for import.',
  },
  {
    id: 'car-4',
    text: 'Apply for Carte Grise (ANTS website)',
    category: 'Car Import',
    completed: false,
  },

  // Kids
  {
    id: 'kid-1',
    text: 'Register at Mairie for Public School',
    category: 'Family',
    completed: false,
  },
  {
    id: 'kid-2',
    text: 'Find Pediatrician in Pays de Gex',
    category: 'Family',
    completed: false,
  },
];

// --- Components ---

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] ${
      onClick
        ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
        : ''
    } ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    gray: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider font-semibold border ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
};

// --- Sections ---

const BudgetSection = ({ data, setData, exchangeRate }) => {
  const [editMode, setEditMode] = useState(false);

  // Calculations
  const monthlyIncomeEUR = data
    .filter((i) => i.type === 'income')
    .reduce((acc, curr) => {
      let amount = curr.amount;
      if (curr.currency === 'CHF') amount = amount * exchangeRate;
      if (curr.frequency === 'yearly') amount = amount / 12;
      return acc + amount;
    }, 0);

  const monthlyExpenseEUR = data
    .filter((i) => i.type === 'expense')
    .reduce((acc, curr) => {
      let amount = curr.amount;
      if (curr.currency === 'CHF') amount = amount * exchangeRate;
      if (curr.frequency === 'yearly') amount = amount / 12;
      return acc + amount;
    }, 0);

  const balance = monthlyIncomeEUR - monthlyExpenseEUR;

  const updateAmount = (id, val) => {
    const num = parseFloat(val) || 0;
    setData(
      data.map((item) => (item.id === id ? { ...item, amount: num } : item))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center gap-2 text-emerald-100 font-medium mb-1 text-sm uppercase tracking-wide">
            <TrendingUp size={16} /> Monthly Net Income
          </div>
          <div className="text-4xl font-bold mt-2">
            €{monthlyIncomeEUR.toFixed(0)}
          </div>
          <div className="text-xs text-emerald-100/70 mt-2 font-mono">
            CHF &rarr; EUR @ {exchangeRate}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">
              Monthly Expenses
            </div>
            <div className="text-4xl font-bold text-slate-800 mt-2">
              €{monthlyExpenseEUR.toFixed(0)}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Rent, Utilities, Insurance
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">
              Disposable Income
            </div>
            <div
              className={`text-4xl font-bold mt-2 ${
                balance > 0 ? 'text-indigo-600' : 'text-rose-600'
              }`}
            >
              €{balance.toFixed(0)}
            </div>
            <div className="text-xs text-slate-400 mt-2">Savings & Leisure</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              Income Sources
            </h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {editMode ? 'Done' : 'Edit Values'}
            </button>
          </div>
          <div className="space-y-4">
            {data
              .filter((i) => i.type === 'income')
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-700">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {item.currency} ({item.frequency})
                    </div>
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      className="w-32 p-2 border border-slate-200 rounded-lg text-right font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={item.amount}
                      onChange={(e) => updateAmount(item.id, e.target.value)}
                    />
                  ) : (
                    <div className="font-bold text-emerald-600 text-lg">
                      {item.currency === 'CHF' ? 'CHF ' : '€'}
                      {item.amount.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <Wallet size={20} />
              </div>
              Expenses
            </h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              {editMode ? 'Done' : 'Edit Values'}
            </button>
          </div>
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {data
              .filter((i) => i.type === 'expense')
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                        {item.frequency} • {item.currency}
                      </div>
                    </div>
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      className="w-24 p-1 border border-slate-200 rounded text-right text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      value={item.amount}
                      onChange={(e) => updateAmount(item.id, e.target.value)}
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-600">
                      {item.currency === 'CHF' ? 'CHF ' : '€'}
                      {item.amount.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-slate-600 flex gap-3">
              <AlertCircle
                size={18}
                className="text-blue-500 shrink-0 mt-0.5"
              />
              <p>
                <strong className="text-blue-700 block mb-1">
                  Frontalier Health Insurance Tip
                </strong>
                For a family with one high income in Switzerland, LAMal is often
                better as the premium is per person, whereas CMU is 8% of your
                income.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const JobSection = ({ jobs, setJobs }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [isScanning, setIsScanning] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const newJob = {
        id: `new-job-${Date.now()}`,
        title: 'Civil Engineering Technician',
        company: 'Léman Infrastructure',
        location: 'Geneva',
        salary_min: 75000,
        salary_max: 88000,
        currency: 'CHF',
        description:
          'Drafting support for road and rail projects. AutoCAD mastery required.',
        requirements: ['AutoCAD', 'French B2'],
        status: 'saved',
        postedDate: 'Just now',
        isAiFound: true,
      };
      setJobs([newJob, ...jobs]);
    }, 2000);
  };

  const moveJob = (id, status) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
            activeTab === 'feed'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'bg-transparent text-slate-500 hover:text-slate-700 shadow-none'
          }`}
        >
          AI Job Feed
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
            activeTab === 'tracker'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'bg-transparent text-slate-500 hover:text-slate-700 shadow-none'
          }`}
        >
          Application Tracker
        </button>
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-300" /> Live Market
                Scanner
              </h3>
              <p className="text-indigo-100 text-sm mt-1 opacity-90">
                Searching for: BIM Modeler, Draftsperson, Revit, AutoCAD
              </p>
            </div>
            <button
              onClick={simulateScan}
              disabled={isScanning}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-white/20 backdrop-blur-sm disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={isScanning ? 'animate-spin' : ''}
              />
              {isScanning ? 'Scanning...' : 'Scan Market'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jobs
              .filter((j) => j.status === 'saved')
              .map((job) => (
                <Card
                  key={job.id}
                  className="p-6 hover:border-indigo-200 group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                        <span className="flex items-center gap-1.5">
                          <Building2 size={16} className="text-slate-400" />{' '}
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-slate-400" />{' '}
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          <Euro size={14} /> {job.salary_min / 1000}k -{' '}
                          {job.salary_max / 1000}k {job.currency}
                        </span>
                      </div>
                    </div>
                    <Badge color="green">New Match</Badge>
                  </div>
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {job.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3 pt-5 border-t border-slate-100">
                    <button
                      onClick={() => moveJob(job.id, 'applied')}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
                    >
                      Track as Applied
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="px-4 py-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              ))}
            {jobs.filter((j) => j.status === 'saved').length === 0 && (
              <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                No new jobs found. Try scanning again.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[500px]">
          {['applied', 'interview', 'offer'].map((status) => (
            <div
              key={status}
              className="bg-slate-100/50 rounded-2xl p-4 flex flex-col h-full border border-slate-200/60"
            >
              <h3 className="font-bold text-slate-700 mb-4 capitalize flex items-center justify-between px-2">
                <span className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === 'applied'
                        ? 'bg-indigo-500'
                        : status === 'interview'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {status}
                </span>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
                  {jobs.filter((j) => j.status === status).length}
                </span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-4">
                {jobs
                  .filter((j) => j.status === status)
                  .map((job) => (
                    <div
                      key={job.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2">
                          {job.title}
                        </h4>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1 mt-2 mb-3">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400 truncate">
                          {job.location}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        {status !== 'offer' && (
                          <button
                            onClick={() =>
                              moveJob(
                                job.id,
                                status === 'applied' ? 'interview' : 'offer'
                              )
                            }
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 rounded-lg font-medium transition-colors"
                          >
                            Advance
                          </button>
                        )}
                        {status !== 'applied' && (
                          <button
                            onClick={() =>
                              moveJob(
                                job.id,
                                status === 'offer' ? 'interview' : 'applied'
                              )
                            }
                            className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs py-2 rounded-lg font-medium transition-colors"
                          >
                            Back
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {jobs.filter((j) => j.status === status).length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChecklistSection = ({ items, setItems }) => {
  const toggleItem = (id) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const progress = Math.round(
    (items.filter((i) => i.completed).length / items.length) * 100
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-none shadow-xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Relocation Progress
              </h2>
              <p className="text-indigo-100 mt-1 text-sm font-medium opacity-90">
                {progress < 30
                  ? 'Just getting started! Keep going.'
                  : progress < 70
                  ? 'Making good progress on the move.'
                  : 'Almost ready for fondue!'}
              </p>
            </div>
            <span className="text-4xl font-bold tracking-tighter">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm">
            <div
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {categories.map((category) => (
          <div
            key={category}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="bg-slate-50/80 backdrop-blur px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">{category}</h3>
              <Badge color="gray">
                {
                  items.filter((i) => i.category === category && i.completed)
                    .length
                }{' '}
                / {items.filter((i) => i.category === category).length}
              </Badge>
            </div>
            <div className="divide-y divide-slate-50">
              {items
                .filter((i) => i.category === category)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group ${
                      item.completed ? 'bg-slate-50/50' : ''
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                        item.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                          : 'border-slate-300 text-transparent group-hover:border-indigo-400'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          item.completed
                            ? 'text-slate-400 line-through decoration-slate-300'
                            : 'text-slate-700'
                        }`}
                      >
                        {item.text}
                      </p>
                      {item.notes && !item.completed && (
                        <div className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                          <AlertCircle size={12} /> {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function MoveToGenevaApp() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // App State - Types removed for JS/JSX compatibility (Line 616 in original error)
  const [budget, setBudget] = useState(INITIAL_BUDGET);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [exchangeRate, setExchangeRate] = useState(0.94); // CHF to EUR

  // Firebase Auth & Sync
  useEffect(() => {
    // Prevent execution if Firebase wasn't initialized
    if (IS_PLACEHOLDER_KEY || !auth) return;

    const initAuth = async () => {
      try {
        // We sign in anonymously for Firebase access.
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Firebase Anonymous Sign-In failed:', error);
      }
    };
    initAuth();
    // onAuthStateChanged should only run if 'auth' is valid
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Data Persistence
  useEffect(() => {
    if (!user || IS_PLACEHOLDER_KEY || !db) return; // FIX: Corrected typo from IS_PLACEER_KEY

    // We use a fixed ID for shared family data instead of user.uid,
    // since Anonymous Auth changes the UID on different devices.
    const sharedUserId = 'our-family-data'; // This implements the Pro-Tip from the guide

    const unsubscribeBudget = onSnapshot(
      collection(db, 'artifacts', appId, 'users', sharedUserId, 'budget'),
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((d) => d.data());
          if (data.length > 0) setBudget(data);
        } else {
          // Initialize data if not found
          INITIAL_BUDGET.forEach((item) =>
            setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'users',
                sharedUserId,
                'budget',
                item.id
              ),
              item
            )
          );
        }
      }
    );
    const unsubscribeJobs = onSnapshot(
      collection(db, 'artifacts', appId, 'users', sharedUserId, 'jobs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((d) => d.data());
          if (data.length > 0) setJobs(data);
        } else {
          INITIAL_JOBS.forEach((item) =>
            setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'users',
                sharedUserId,
                'jobs',
                item.id
              ),
              item
            )
          );
        }
      }
    );
    const unsubscribeChecklist = onSnapshot(
      collection(db, 'artifacts', appId, 'users', sharedUserId, 'checklist'),
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((d) => d.data());
          if (data.length > 0) setChecklist(data);
        } else {
          INITIAL_CHECKLIST.forEach((item) =>
            setDoc(
              doc(
                db,
                'artifacts',
                appId,
                'users',
                sharedUserId,
                'checklist',
                item.id
              ),
              item
            )
          );
        }
      }
    );

    return () => {
      unsubscribeBudget();
      unsubscribeJobs();
      unsubscribeChecklist();
    };
  }, [user]);

  // Save logic updated to use fixed sharedUserId
  const saveBudget = async (newData) => {
    setBudget(newData);
    if (!user || IS_PLACEHOLDER_KEY || !db) return;
    const sharedUserId = 'our-family-data';
    newData.forEach((item) =>
      setDoc(
        doc(db, 'artifacts', appId, 'users', sharedUserId, 'budget', item.id),
        item
      )
    );
  };

  const saveJobs = async (newData) => {
    setJobs(newData);
    if (!user || IS_PLACEHOLDER_KEY || !db) return;
    const sharedUserId = 'our-family-data';
    newData.forEach((item) =>
      setDoc(
        doc(db, 'artifacts', appId, 'users', sharedUserId, 'jobs', item.id),
        item
      )
    );
  };

  const saveChecklist = async (newData) => {
    setChecklist(newData);
    if (!user || IS_PLACEHOLDER_KEY || !db) return;
    const sharedUserId = 'our-family-data';
    newData.forEach((item) =>
      setDoc(
        doc(
          db,
          'artifacts',
          appId,
          'users',
          sharedUserId,
          'checklist',
          item.id
        ),
        item
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-72 bg-slate-900 flex-shrink-0 z-10 flex flex-col shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 font-bold text-2xl text-white tracking-tight">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <MapPin className="text-white fill-white" size={20} />
            </div>
            <span>
              Geneva<span className="text-indigo-400">Go</span>
            </span>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-2 uppercase tracking-widest pl-1">
            Relocation OS
          </div>
        </div>

        <div className="px-4 space-y-2 flex-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              currentView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard
              size={20}
              className={
                currentView === 'dashboard'
                  ? 'text-white'
                  : 'text-slate-500 group-hover:text-white'
              }
            />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('budget')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              currentView === 'budget'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Wallet
              size={20}
              className={
                currentView === 'budget'
                  ? 'text-white'
                  : 'text-slate-500 group-hover:text-white'
              }
            />
            Budget Planner
          </button>
          <button
            onClick={() => setCurrentView('jobs')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              currentView === 'jobs'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Briefcase
              size={20}
              className={
                currentView === 'jobs'
                  ? 'text-white'
                  : 'text-slate-500 group-hover:text-white'
              }
            />
            Job Search
          </button>
          <button
            onClick={() => setCurrentView('checklist')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
              currentView === 'checklist'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <CheckSquare
              size={20}
              className={
                currentView === 'checklist'
                  ? 'text-white'
                  : 'text-slate-500 group-hover:text-white'
              }
            />
            Moving Checklist
          </button>
        </div>

        <div className="p-6">
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Live Exchange Rate
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                1 CHF =
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-right text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  step="0.01"
                />
                <span className="text-sm font-bold text-indigo-400">EUR</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-10 relative">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize tracking-tight">
              {currentView === 'dashboard' ? 'Overview' : currentView}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back to your relocation command center.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">
              {user ? 'US' : 'G'}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto pb-10">
          {currentView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dashboard Widgets */}
                <Card
                  onClick={() => setCurrentView('budget')}
                  className="p-8 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                      <Wallet size={28} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                      <ArrowRight
                        size={16}
                        className="text-slate-400 group-hover:text-slate-600"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    Monthly Budget
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Review your income vs cost of living in Pays de Gex.
                  </p>
                </Card>

                <Card
                  onClick={() => setCurrentView('jobs')}
                  className="p-8 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-violet-100 text-violet-600 rounded-2xl group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                      <Briefcase size={28} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                      <ArrowRight
                        size={16}
                        className="text-slate-400 group-hover:text-slate-600"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
                    Job Tracker
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Manage applications for BIM & Drafting roles.
                  </p>
                </Card>

                <Card
                  onClick={() => setCurrentView('checklist')}
                  className="p-8 group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-rose-100 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                      <CheckSquare size={28} />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">
                      {Math.round(
                        (checklist.filter((i) => i.completed).length /
                          checklist.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
                    Moving Checklist
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    Don't forget the Quitus Fiscal!
                  </p>
                </Card>
              </div>

              {/* Recent Activity / Insights */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={24} /> Living in
                    Pays de Gex?
                  </h3>
                  <p className="text-indigo-100/80 mb-8 leading-relaxed text-lg">
                    Did you know? As a "Frontalier" (border worker), you often
                    have higher purchasing power by living in France and working
                    in Geneva. However, ensure you account for the traffic at
                    the Douane (border) if driving, or use the new Léman Express
                    train.
                  </p>
                  <button
                    onClick={() => setCurrentView('budget')}
                    className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg shadow-white/10"
                  >
                    Check your purchasing power
                  </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 rounded-full opacity-30 blur-3xl mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-violet-600 rounded-full opacity-20 blur-3xl mix-blend-screen"></div>
              </div>
            </div>
          )}

          {currentView === 'budget' && (
            <BudgetSection
              data={budget}
              setData={saveBudget}
              exchangeRate={exchangeRate}
            />
          )}

          {currentView === 'jobs' && (
            <JobSection jobs={jobs} setJobs={saveJobs} />
          )}

          {currentView === 'checklist' && (
            <ChecklistSection items={checklist} setItems={saveChecklist} />
          )}
        </div>
      </main>
    </div>
  );
}
