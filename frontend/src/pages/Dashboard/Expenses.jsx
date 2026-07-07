// src/pages/Dashboard/Expenses.jsx
// TripSetGo — collaborative Travel Finance Workspace
// Features a tabbed dashboard (Ledger & Settle vs. Spending Insights) and Recharts Category Donut Chart visualization.
import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Receipt, Users, Calculator, Trash2, UserPlus, 
  ArrowRight, Wallet, Calendar, DollarSign, Search, Filter, PieChart as ChartIcon, ListFilter, AlertCircle
} from 'lucide-react'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts'
import {
  fetchGroups, fetchGroup, createGroup, deleteGroup, addMember, addExpense, deleteExpense,
  selectGroups, selectGroupDetail, selectGroupsLoading, selectDetailLoading, selectExpenseSubmitting,
} from '@/features/expenses/expensesSlice'
import { selectUser } from '@/features/auth/authSlice'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Modal from '@/components/common/Modal'
import Avatar from '@/components/common/Avatar'
import { SkeletonCard } from '@/components/common/Loader'

const CATEGORY_META = {
  accommodation: { emoji: '🏨', label: 'Stay',       color: '#818cf8' },
  food:          { emoji: '🍽️', label: 'Food',       color: '#34d399' },
  transport:     { emoji: '🚗', label: 'Transport',  color: '#22d3ee' },
  entertainment: { emoji: '🎉', label: 'Fun',        color: '#fbbf24' },
  misc:          { emoji: '💰', label: 'Misc',       color: '#a78bfa' },
}

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function Expenses() {
  const dispatch      = useDispatch()
  const user          = useSelector(selectUser)
  const groups        = useSelector(selectGroups)
  const detail        = useSelector(selectGroupDetail)
  const loadingGroups = useSelector(selectGroupsLoading)
  const loadingDetail = useSelector(selectDetailLoading)
  const submitting    = useSelector(selectExpenseSubmitting)

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('ledger') // 'ledger' | 'insights'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  // Picked active group ID pointer
  const [pickedId, setPickedId]     = useState(null)
  
  // Modals state triggers
  const [createOpen, setCreateOpen]   = useState(false)
  const [memberOpen, setMemberOpen]   = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [isDeleting, setIsDeleting]   = useState(false)

  // Form input field state pointers
  const [groupName, setGroupName]   = useState('')
  const [groupEmails, setGroupEmails] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [exp, setExp] = useState({ title: '', amount: '', category: 'misc', paidBy: '', splitAmong: [], note: '' })

  useEffect(() => { 
    dispatch(fetchGroups()) 
  }, [dispatch])

  // Derive the active group from selection
  const selectedId = (pickedId && groups.some((g) => g._id === pickedId)) ? pickedId : (groups[0]?._id || null)

  useEffect(() => {
    if (selectedId) dispatch(fetchGroup(selectedId))
  }, [selectedId, dispatch])

  const activeDetail = detail?.group?._id === selectedId ? detail : null
  const group   = activeDetail?.group
  const members = group?.members || []
  const isOwner = group && user && (group.ownerId === user._id || group.ownerId?._id === user._id)
  const memberName = (id) => members.find((m) => m._id === id)?.name || 'Someone'

  const total = activeDetail?.total || 0
  const balances = activeDetail?.balances || {}
  const settlements = activeDetail?.settlements || []
  const perPerson = members.length > 0 ? total / members.length : 0

  // ── Filters & Search ──
  const filteredExpenses = useMemo(() => {
    if (!activeDetail?.expenses) return []
    return activeDetail.expenses.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (e.note && e.note.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [activeDetail?.expenses, searchQuery, filterCategory])

  // ── Recharts Category Data Aggregations ──
  const chartData = useMemo(() => {
    if (!activeDetail?.expenses || activeDetail.expenses.length === 0) return []
    
    const categoryTotals = {}
    activeDetail.expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
    })

    return Object.entries(categoryTotals).map(([key, val]) => ({
      name: CATEGORY_META[key]?.label || key,
      value: val,
      color: CATEGORY_META[key]?.color || '#a78bfa'
    }))
  }, [activeDetail?.expenses])

  // ── Toast Alerts Wrapper ──
  const triggerToast = (type, message) => {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }))
  }

  // ── Group mutations ──
  const submitGroup = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return triggerToast('error', 'Give your group a name')
    const emails = groupEmails.split(',').map((s) => s.trim()).filter(Boolean)
    try {
      const { group: g, unresolved } = await dispatch(createGroup({ name: groupName.trim(), memberEmails: emails })).unwrap()
      setCreateOpen(false)
      setGroupName('')
      setGroupEmails('')
      setPickedId(g._id)
      if (unresolved?.length) {
        triggerToast('info', `Group created. Invites sent to: ${unresolved.join(', ')}`)
      } else {
        triggerToast('success', 'Group created successfully!')
      }
    } catch (err) { 
      triggerToast('error', err) 
    }
  }

  const submitMember = async (e) => {
    e.preventDefault()
    if (!memberEmail.trim()) return
    try {
      await dispatch(addMember({ groupId: selectedId, email: memberEmail.trim() })).unwrap()
      setMemberOpen(false)
      setMemberEmail('')
      triggerToast('success', 'Member added successfully!')
    } catch (err) { 
      triggerToast('error', err) 
    }
  }

  const openAddExpense = () => {
    const ids = members.map((m) => m._id)
    const defaultPayer = user && ids.includes(user._id) ? user._id : (ids[0] || '')
    setExp({ title: '', amount: '', category: 'misc', paidBy: defaultPayer, splitAmong: ids, note: '' })
    setExpenseOpen(true)
  }

  const submitExpense = async (e) => {
    e.preventDefault()
    if (!exp.title.trim()) return triggerToast('error', 'What was the expense for?')
    if (!exp.amount || Number(exp.amount) <= 0) return triggerToast('error', 'Enter an amount greater than 0')
    if (!exp.paidBy) return triggerToast('error', 'Select who paid')
    if (!exp.splitAmong.length) return triggerToast('error', 'Split between at least one person')
    try {
      await dispatch(addExpense({
        groupId: selectedId,
        title: exp.title.trim(),
        amount: Number(exp.amount),
        category: exp.category,
        paidBy: exp.paidBy,
        splitAmong: exp.splitAmong,
        note: exp.note.trim(),
      })).unwrap()
      setExpenseOpen(false)
      triggerToast('success', 'Expense logged successfully!')
    } catch (err) { 
      triggerToast('error', err) 
    }
  }

  const onDeleteExpense = async (id) => {
    try {
      await dispatch(deleteExpense({ groupId: selectedId, expenseId: id })).unwrap()
      triggerToast('success', 'Expense removed.')
    } catch (err) { 
      triggerToast('error', err) 
    }
  }

  const onDeleteGroup = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await dispatch(deleteGroup(selectedId)).unwrap()
      setPickedId(null)
      triggerToast('success', 'Group deleted.')
    } catch (err) {
      triggerToast('error', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSplit = (id) => setExp((p) => ({
    ...p,
    splitAmong: p.splitAmong.includes(id) ? p.splitAmong.filter((x) => x !== id) : [...p.splitAmong, id],
  }))

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary font-display tracking-tight">
            Group <span className="text-indigo-400">Expenses</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">Split travel costs, track balances, and settle up fairly.</p>
        </div>
        <Button icon={<Plus size={15} />} size="sm" onClick={() => setCreateOpen(true)}>
          New Group
        </Button>
      </div>

      {loadingGroups && groups.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-12 shadow-sm gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl">
            👥
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display">No expense groups yet</h2>
          <p className="text-xs text-text-secondary max-w-sm">
            Create a group for your trip, add travel companions, and TripSetGo will compute balance sheets, settle ledgers, and map insights automatically.
          </p>
          <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            Create your first group
          </Button>
        </div>
      ) : (
        <>
          {/* ── Group Selector Cards Horizontal Slider ── */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" role="tablist">
            {groups.map((g) => {
              const active = g._id === selectedId
              return (
                <button
                  key={g._id}
                  onClick={() => setPickedId(g._id)}
                  role="tab"
                  aria-selected={active}
                  className={`
                    border rounded-xl px-4 py-3 text-left transition-all duration-150 shrink-0 cursor-pointer min-w-[170px]
                    ${active 
                      ? 'border-indigo-500 bg-indigo-500/5 text-text-primary shadow-sm' 
                      : 'border-border bg-surface hover:border-indigo-500/30 text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  <p className="text-xs font-bold truncate">{g.name}</p>
                  <p className="text-[10px] text-text-muted mt-1.5 font-medium">
                    {g.members?.length || 0} members • {inr(g.totalSpent)}
                  </p>
                </button>
              )
            })}
          </div>

          {/* ── Active Group Dashboard panel ── */}
          {loadingDetail && !activeDetail ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-12">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : activeDetail ? (
            <div className="flex flex-col gap-6">
              
              {/* Group Metadata & Control Banner */}
              <div className="bg-surface-glass border border-border/40 backdrop-blur-md rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 shrink-0">
                    {members.slice(0, 5).map((m) => (
                      <div key={m._id} title={m.name}>
                        <Avatar src={m.avatar} name={m.name} size="xs" className="ring-2 ring-surface border-none" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary font-display">{group.name}</h3>
                    <p className="text-[10px] text-text-muted mt-0.5 font-medium">{members.length} members sharing costs</p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {isOwner && (
                    <Button variant="secondary" size="sm" icon={<UserPlus size={14} />} onClick={() => setMemberOpen(true)}>
                      Add Member
                    </Button>
                  )}
                  <Button size="sm" icon={<Plus size={14} />} onClick={openAddExpense}>
                    Add Expense
                  </Button>
                  {isOwner && (
                    <button 
                      onClick={onDeleteGroup} 
                      disabled={isDeleting}
                      className="p-2.5 rounded-xl text-rose-400 hover:text-rose-500 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 cursor-pointer disabled:opacity-50" 
                      title="Delete Group"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Dashboard Stats Overview Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Spent',  value: inr(total),     icon: <Receipt size={18} />,    color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                  { label: 'Group Members', value: `${members.length} people`, icon: <Users size={18} />, color: 'text-sky-400', bg: 'bg-sky-500/5' },
                  { label: 'Per Person Share', value: inr(perPerson), icon: <Calculator size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                ].map((s, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.05 }}
                    className="bg-surface-default border border-border/40 rounded-2xl p-4 flex gap-4 items-center shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0 border border-border/10`}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{s.label}</p>
                      <p className="font-extrabold text-sm text-text-primary mt-1">{s.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Workspace Tab Triggers ── */}
              <div className="flex border-b border-border/20 gap-4 shrink-0">
                <button
                  id="tab-trigger-ledger"
                  onClick={() => setActiveTab('ledger')}
                  className={`
                    py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
                    ${activeTab === 'ledger' 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  Ledger & Settlements
                </button>
                <button
                  id="tab-trigger-insights"
                  onClick={() => setActiveTab('insights')}
                  className={`
                    py-2 px-1 text-xs font-bold cursor-pointer transition-all border-b-2
                    ${activeTab === 'insights' 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  Spending Insights
                </button>
              </div>

              {/* ── Dashboard Views Viewport ── */}
              <AnimatePresence mode="wait">
                {activeTab === 'ledger' ? (
                  <motion.div
                    key="ledger"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
                  >
                    {/* Left Pane: Balances & Settlements */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                      
                      {/* Debt Settlements panel */}
                      <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm">
                        <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 mb-3">
                          Settle Up Debt Clearances
                        </h4>
                        {settlements.length === 0 ? (
                          <div className="text-center py-6 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            🎉 All settled up — nobody owes anything!
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {settlements.map((s, i) => (
                              <div key={i} className="flex items-center justify-between gap-2 bg-surface-raised border border-border/20 p-2.5 rounded-xl text-xs font-medium">
                                <div className="flex items-center gap-1.5 truncate min-w-0">
                                  <span className="font-bold text-rose-400 truncate">{memberName(s.from)}</span>
                                  <ArrowRight size={12} className="text-text-muted shrink-0" />
                                  <span className="font-bold text-emerald-400 truncate">{memberName(s.to)}</span>
                                </div>
                                <span className="font-extrabold text-text-primary shrink-0">{inr(s.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Members Balances */}
                      <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm">
                        <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 mb-3">
                          Individual Balances
                        </h4>
                        <div className="flex flex-col gap-1">
                          {members.map((m) => {
                            const bal = balances[m._id] || 0
                            const isUserMe = user && m._id === user._id
                            return (
                              <div 
                                key={m._id} 
                                className="flex justify-between items-center py-2.5 border-b border-border/10 last:border-b-0"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Avatar src={m.avatar} name={m.name} size="xs" className="shrink-0" />
                                  <span className="text-xs font-bold text-text-primary truncate">
                                    {m.name}{isUserMe ? ' (you)' : ''}
                                  </span>
                                </div>
                                <span className={`text-xs font-extrabold shrink-0 ${
                                  bal > 0.5 
                                    ? 'text-emerald-400' 
                                    : bal < -0.5 
                                      ? 'text-rose-400' 
                                      : 'text-text-muted font-medium'
                                }`}>
                                  {bal > 0.5 ? `gets ${inr(bal)}` : bal < -0.5 ? `owes ${inr(Math.abs(bal))}` : 'settled'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Right Pane: Timeline Transaction Ledger */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                      
                      {/* Search & Category Filter Controls */}
                      <div className="bg-surface-default border border-border/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2 bg-surface-raised border border-border rounded-xl px-3 py-1.5 flex-1 min-w-[200px]">
                          <Search size={14} className="text-text-muted shrink-0" />
                          <input
                            id="input-expense-search"
                            type="text"
                            placeholder="Search expenses by title..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent text-xs text-text-primary outline-none w-full"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <ListFilter size={14} className="text-text-muted" />
                          <select
                            id="select-expense-category"
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="bg-surface-raised border border-border rounded-xl text-xs font-bold px-3 py-2 text-text-primary outline-none cursor-pointer"
                          >
                            <option value="all">All Categories</option>
                            {Object.entries(CATEGORY_META).map(([key, meta]) => (
                              <option key={key} value={key}>{meta.emoji} {meta.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Chronological ledger timeline list */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider px-1">
                          Expenses Log
                        </h4>
                        
                        {filteredExpenses.length === 0 ? (
                          <div className="bg-surface-default border border-border/40 rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm gap-2">
                            <Wallet size={32} className="text-text-muted/50 mb-1" />
                            <p className="text-xs font-bold text-text-primary">No transactions found</p>
                            <p className="text-[10px] text-text-muted">Change filters or log your first expense item.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            {filteredExpenses.map((e, idx) => {
                              const meta = CATEGORY_META[e.category] || CATEGORY_META.misc
                              return (
                                <motion.div
                                  key={e._id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className="bg-surface-default border border-border/40 rounded-2xl p-4.5 flex items-center justify-between gap-4 shadow-sm hover:border-indigo-500/25 transition-all group"
                                >
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border border-border/10" style={{ background: `${meta.color}15` }}>
                                      {meta.emoji}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-xs font-bold text-text-primary truncate">{e.title}</h5>
                                      <p className="text-[10px] text-text-muted mt-1 font-medium">
                                        Paid by <strong>{e.paidBy?.name || 'Someone'}</strong> • split {e.splitAmong?.length || 0} ways
                                      </p>
                                      {e.note && (
                                        <p className="text-[10px] text-indigo-300 flex items-center gap-0.5 mt-1.5">
                                          <Info size={10} /> {e.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-extrabold text-text-primary">{inr(e.amount)}</span>
                                    <button
                                      onClick={() => onDeleteExpense(e._id)}
                                      className="text-text-muted hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                      title="Delete Expense"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn"
                  >
                    {/* Donut Chart visual display */}
                    <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm lg:col-span-2 flex flex-col gap-4">
                      <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                        Category Expense Distribution
                      </h4>
                      {chartData.length === 0 ? (
                        <div className="text-center py-20 text-text-muted text-xs font-bold">
                          No transactions found. Log expenses to view breakdown insights.
                        </div>
                      ) : (
                        <div className="w-full h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={3}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => [inr(value), 'Spent']}
                                contentStyle={{ 
                                  background: 'var(--color-surface-raised)', 
                                  borderColor: 'var(--color-border-default)',
                                  borderRadius: 'var(--radius-lg)',
                                  color: 'var(--color-text-primary)',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }} 
                              />
                              <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => <span className="text-[10px] font-bold text-text-secondary">{value}</span>}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Insights Breakdown and warnings list */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                      
                      <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm">
                        <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5 mb-4">
                          Breakdown Summary
                        </h4>
                        {chartData.length === 0 ? (
                          <div className="text-center py-10 text-text-muted text-xs">No data summaries.</div>
                        ) : (
                          <div className="flex flex-col gap-3.5">
                            {chartData.map((item, idx) => {
                              const pct = total > 0 ? (item.value / total) * 100 : 0
                              return (
                                <div key={idx} className="flex flex-col gap-1.5">
                                  <div className="flex justify-between items-center text-xs font-bold text-text-primary">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                      {item.name}
                                    </span>
                                    <span>{inr(item.value)} <span className="text-text-muted text-[10px] font-medium">({pct.toFixed(0)}%)</span></span>
                                  </div>
                                  <div className="w-full h-1 bg-surface-base border border-border/10 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Trends & Alerts */}
                      <div className="bg-surface-default border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-extrabold text-text-primary font-display uppercase tracking-wider border-b border-border/10 pb-2.5">
                          Financial Insights
                        </h4>
                        <div className="flex flex-col gap-3.5 text-xs text-text-secondary leading-relaxed">
                          <div className="flex gap-2 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl">
                            <AlertCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-medium">
                              Your average group share is at <strong>{inr(perPerson)}</strong>. Ensure members settle balances regularly to track budgets cleanly.
                            </p>
                          </div>
                          
                          {total > 10000 && (
                            <div className="flex gap-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                              <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-[10px] font-medium">
                                Total group spending has crossed <strong>{inr(10000)}</strong>. Monitor high-expenditure categories like Stay or Transport in detail.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ) : null}
        </>
      )}

      {/* ── Create group modal ── */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Expense Group">
        <form onSubmit={submitGroup} className="flex flex-col gap-4">
          <Input 
            id="input-newgroup-name"
            label="Group name" 
            placeholder="e.g. Goa Trip 2026" 
            value={groupName} 
            onChange={(e) => setGroupName(e.target.value)} 
            required 
          />
          <Input 
            id="input-newgroup-members"
            label="Invite members by email (optional)" 
            placeholder="alice@mail.com, bob@mail.com" 
            value={groupEmails} 
            onChange={(e) => setGroupEmails(e.target.value)} 
            helperText="Comma-separated. Only registered TripSetGo users can be added." 
          />
          <Button type="submit" loading={submitting} icon={<Plus size={16} />} className="self-start mt-2">
            Create Group
          </Button>
        </form>
      </Modal>

      {/* ── Add member modal ── */}
      <Modal isOpen={memberOpen} onClose={() => setMemberOpen(false)} title="Add a member">
        <form onSubmit={submitMember} className="flex flex-col gap-4">
          <Input 
            id="input-member-email"
            label="Member email" 
            type="email" 
            placeholder="friend@mail.com" 
            value={memberEmail} 
            onChange={(e) => setMemberEmail(e.target.value)} 
            required 
            helperText="They must already have a TripSetGo account." 
          />
          <Button type="submit" loading={submitting} icon={<UserPlus size={16} />} className="self-start mt-2">
            Add Member
          </Button>
        </form>
      </Modal>

      {/* ── Add expense modal ── */}
      <Modal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} title="Add an expense" size="lg">
        <form onSubmit={submitExpense} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              id="input-expense-title"
              label="What for?" 
              placeholder="e.g. Dinner at beach shack" 
              value={exp.title} 
              onChange={(e) => setExp((p) => ({ ...p, title: e.target.value }))} 
              required 
            />
            <Input 
              id="input-expense-amount"
              label="Amount (₹)" 
              type="number" 
              min="1" 
              placeholder="3200" 
              value={exp.amount} 
              onChange={(e) => setExp((p) => ({ ...p, amount: e.target.value }))} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-primary">Category</span>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  id={`btn-category-${key}`}
                  key={key} 
                  type="button" 
                  onClick={() => setExp((p) => ({ ...p, category: key }))}
                  className={`
                    inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border
                    ${exp.category === key 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-transparent text-text-primary border-border hover:border-indigo-500/30'
                    }
                  `}
                >
                  <span>{meta.emoji}</span> {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-primary">Paid by</span>
            <div className="flex gap-2 flex-wrap">
              {members.map((m) => (
                <button
                  id={`btn-payer-${m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  key={m._id} 
                  type="button" 
                  onClick={() => setExp((p) => ({ ...p, paidBy: m._id }))}
                  className={`
                    inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border
                    ${exp.paidBy === m._id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-transparent text-text-primary border-border hover:border-indigo-500/30'
                    }
                  `}
                >
                  {m.name}{user && m._id === user._id ? ' (you)' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-primary">
              Split between <span className="font-medium text-text-muted">({exp.splitAmong.length} selected)</span>
            </span>
            <div className="flex gap-2 flex-wrap">
              {members.map((m) => (
                <button
                  id={`btn-splitter-${m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  key={m._id} 
                  type="button" 
                  onClick={() => toggleSplit(m._id)}
                  className={`
                    inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border
                    ${exp.splitAmong.includes(m._id) 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'bg-transparent text-text-primary border-border hover:border-indigo-500/30'
                    }
                  `}
                >
                  {m.name}
                </button>
              ))}
            </div>
            {exp.amount > 0 && exp.splitAmong.length > 0 && (
              <p className="text-[10px] text-text-muted mt-1 font-semibold">
                Split share: {inr(Number(exp.amount) / exp.splitAmong.length)} per person
              </p>
            )}
          </div>

          <Input 
            id="input-expense-note"
            label="Note (optional)" 
            placeholder="Anything to remember about this expense" 
            value={exp.note} 
            onChange={(e) => setExp((p) => ({ ...p, note: e.target.value }))} 
          />

          <Button type="submit" loading={submitting} icon={<Plus size={16} />} className="self-start mt-2">
            Add Expense
          </Button>
        </form>
      </Modal>

    </div>
  )
}