'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Inbox,
  Send,
  FileCheck2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { motion } from 'framer-motion'

export default function DashboardOverview({ incoming = [], outgoing = [], dispositions = [], logs = [] }) {
  // Statistics Calculations
  const totalIncoming = incoming.length
  const totalOutgoing = outgoing.length
  const pendingOutgoingApproval = outgoing.filter(o => o.status === 'Pending Approval').length
  const pendingDispositions = incoming.filter(i => i.status === 'Pending').length

  // Classification Distribution
  const incomingClass = incoming.reduce((acc, curr) => {
    acc[curr.classification] = (acc[curr.classification] || 0) + 1
    return acc
  }, {})
  const outgoingClass = outgoing.reduce((acc, curr) => {
    acc[curr.classification] = (acc[curr.classification] || 0) + 1
    return acc
  }, {})

  const allClassifications = ['Confidential', 'Urgent', 'Normal', 'Restricted']
  const pieData = allClassifications.map(c => {
    const value = (incomingClass[c] || 0) + (outgoingClass[c] || 0)
    return { name: c, value }
  }).filter(d => d.value > 0)

  // Default pieData if empty
  const finalPieData = pieData.length > 0 ? pieData : [
    { name: 'Confidential', value: 3 },
    { name: 'Urgent', value: 2 },
    { name: 'Normal', value: 8 },
    { name: 'Restricted', value: 1 }
  ]

  const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6']

  // Monthly Trend Mock Chart Data
  const trendData = [
    { name: 'Jan', Masuk: 5, Keluar: 3 },
    { name: 'Feb', Masuk: 12, Keluar: 8 },
    { name: 'Mar', Masuk: 18, Keluar: 14 },
    { name: 'Apr', Masuk: 14, Keluar: 19 },
    { name: 'May', Masuk: totalIncoming, Keluar: totalOutgoing },
  ]

  const stats = [
    {
      title: 'Surat Masuk (Incoming)',
      value: totalIncoming,
      icon: Inbox,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description: 'Total surat diterima'
    },
    {
      title: 'Surat Keluar (Outgoing)',
      value: totalOutgoing,
      icon: Send,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description: 'Total surat dikeluarkan'
    },
    {
      title: 'Menunggu Persetujuan',
      value: pendingOutgoingApproval,
      icon: FileCheck2,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description: 'Surat keluar draft & review'
    },
    {
      title: 'Belum Didisposisi',
      value: pendingDispositions,
      icon: Clock,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      description: 'Surat masuk pending aksi'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden border border-border/60 bg-white/50 backdrop-blur-md dark:bg-slate-900/50 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl border ${stat.color} transition-all duration-300 group-hover:scale-110`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>{stat.description}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Trend Area Chart */}
        <Card className="md:col-span-2 border border-border/60 bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Tren Surat Menyurat</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Analisis perbandingan surat masuk dan surat keluar (5 Bulan Terakhir)</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Masuk
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Keluar
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120, 120, 120, 0.1)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                  itemStyle={{ fontSize: '13px' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#1f2937' }}
                />
                <Area type="monotone" dataKey="Masuk" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMasuk)" />
                <Area type="monotone" dataKey="Keluar" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKeluar)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Classification Pie Chart */}
        <Card className="border border-border/60 bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Kategori & Kerahasiaan</CardTitle>
            <p className="text-xs text-muted-foreground">Distribusi surat berdasarkan level klasifikasi ISO 23081</p>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between pb-4">
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {finalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10px]">
                <span className="text-xs text-muted-foreground font-semibold">Total Arsip</span>
                <span className="text-2xl font-black">{totalIncoming + totalOutgoing}</span>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {finalPieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Log Aktivitas Terakhir */}
      <Card className="border border-border/60 bg-white/50 backdrop-blur-md dark:bg-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold">Log Aktivitas Administrasi</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Riwayat tindakan, registrasi, disposisi, dan persetujuan surat terenkripsi</p>
          </div>
          <AlertCircle className="h-5 w-5 text-muted-foreground/60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.slice().reverse().map((log, index) => (
              <div key={log.id || index} className="flex items-start gap-4 text-sm relative group pb-1">
                {index !== logs.length - 1 && (
                  <span className="absolute left-[17px] top-6 bottom-0 w-0.5 bg-muted group-hover:bg-primary/20 transition-colors" />
                )}
                
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  log.type === 'incoming' 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : log.type === 'outgoing'
                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}>
                  {log.type === 'incoming' ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{log.activity}</p>
                    <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Oleh: <strong className="font-medium text-foreground/80">{log.user}</strong></span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground italic">
                Belum ada aktivitas administrasi tercatat.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
