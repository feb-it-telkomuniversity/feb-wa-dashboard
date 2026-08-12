'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/axios'
import { formatCamelCaseLabel } from '@/lib/utils'
import { toast } from 'sonner'

// Priority Options
export const PRIORITIES = {
    LOW: 'Rendah',
    MEDIUM: 'Sedang',
    HIGH: 'Tinggi'
}

// Phase Options
export const PHASES = {
    PLANNING: 'Perencanaan',
    PREPARATION: 'Persiapan',
    EXECUTION: 'Pelaksanaan',
    EVALUATION: 'Evaluasi',
    COMPLETED: 'Selesai'
}

export function useEventManagement({ searchQuery = '', filterUnit = 'all', filterStatus = 'all', rowFilter = 3000 } = {}) {
    const [activities, setActivities] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [phases, setPhases] = useState({})
    const [checklists, setChecklists] = useState({})
    const [notes, setNotes] = useState({})
    const [reports, setReports] = useState({})
    const [priorities, setPriorities] = useState({})

    // Load localStorage data on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedPhases = localStorage.getItem('mira_event_phases')
                const storedChecklists = localStorage.getItem('mira_event_checklists')
                const storedNotes = localStorage.getItem('mira_event_notes')
                const storedReports = localStorage.getItem('mira_event_reports')
                const storedPriorities = localStorage.getItem('mira_event_priorities')

                if (storedPhases) setPhases(JSON.parse(storedPhases))
                if (storedChecklists) setChecklists(JSON.parse(storedChecklists))
                if (storedNotes) setNotes(JSON.parse(storedNotes))
                if (storedReports) setReports(JSON.parse(storedReports))
                if (storedPriorities) setPriorities(JSON.parse(storedPriorities))
            } catch (error) {
                console.error("Error parsing localStorage data:", error)
            }
        }
    }, [])

    // Helper functions to update localStorage
    const updatePhase = useCallback((activityId, newPhase) => {
        setPhases(prev => {
            const next = { ...prev, [activityId]: newPhase }
            localStorage.setItem('mira_event_phases', JSON.stringify(next))
            return next
        })
        toast.success(`Fase acara diperbarui ke "${newPhase}"`)
    }, [])

    const updateChecklist = useCallback((activityId, newItems) => {
        setChecklists(prev => {
            const next = { ...prev, [activityId]: newItems }
            localStorage.setItem('mira_event_checklists', JSON.stringify(next))
            return next
        })
    }, [])

    const updateNotes = useCallback((activityId, newNotes) => {
        setNotes(prev => {
            const next = { ...prev, [activityId]: newNotes }
            localStorage.setItem('mira_event_notes', JSON.stringify(next))
            return next
        })
    }, [])

    const updateReport = useCallback((activityId, newReport) => {
        setReports(prev => {
            const next = { ...prev, [activityId]: newReport }
            localStorage.setItem('mira_event_reports', JSON.stringify(next))
            return next
        })
        toast.success('Laporan kegiatan disimpan')
    }, [])

    const updatePriority = useCallback((activityId, newPriority) => {
        setPriorities(prev => {
            const next = { ...prev, [activityId]: newPriority }
            localStorage.setItem('mira_event_priorities', JSON.stringify(next))
            return next
        })
    }, [])

    // Parsing API conflicts (copied from existing logic)
    const parseConflictTypes = (status) => {
        if (!status || status === "Normal") return []
        const conflictTypes = []
        const statusLower = status.toLowerCase()
        if (status === "DoubleConflict" || statusLower === "doubleconflict") {
            conflictTypes.push("pejabat", "ruangan")
            return conflictTypes
        }
        if (statusLower.includes("official") || statusLower.includes("pejabat")) conflictTypes.push("pejabat")
        if (statusLower.includes("room") || statusLower.includes("ruangan")) conflictTypes.push("ruangan")
        if (statusLower.includes("time") || statusLower.includes("waktu")) conflictTypes.push("waktu")
        if (statusLower.includes("conflict") && conflictTypes.length === 0) conflictTypes.push("pejabat")
        return conflictTypes
    }

    const mapApiDataToComponent = useCallback((apiData) => {
        const todayStr = new Date().toISOString().split("T")[0]
        const today = new Date(todayStr)

        return apiData.map((item) => {
            const date = item.date ? new Date(item.date) : null
            const endDate = item.endDate ? new Date(item.endDate) : null
            const startTime = item.startTime ? new Date(item.startTime) : null
            const endTime = item.endTime ? new Date(item.endTime) : null

            const conflictTypes = parseConflictTypes(item.status)
            const hasConflict = item.status !== "Normal" && item.status !== null

            const getValidDateStr = (d) => d && !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : ""
            const getValidTimeStr = (d) => d && !isNaN(d.getTime()) ? d.toTimeString().slice(0, 5) : ""

            const actDateStr = getValidDateStr(date)
            const actEndDateStr = getValidDateStr(endDate) || actDateStr

            const id = item.id

            // Determine Phase default if not set
            let phase = phases[id]
            if (!phase) {
                if (actDateStr) {
                    const actDateObj = new Date(actDateStr)
                    const actEndDateObj = new Date(actEndDateStr)
                    if (today < actDateObj) {
                        phase = PHASES.PREPARATION // Persiapan
                    } else if (today >= actDateObj && today <= actEndDateObj) {
                        phase = PHASES.EXECUTION // Pelaksanaan
                    } else {
                        // If passed and report exists, Selesai, else Evaluasi
                        phase = reports[id] && reports[id].status === 'Approved' ? PHASES.COMPLETED : PHASES.EVALUATION
                    }
                } else {
                    phase = PHASES.PLANNING // Perencanaan
                }
            }

            // Determine Priority default if not set
            const priority = priorities[id] || PRIORITIES.MEDIUM

            // Checklist
            const checklistItems = checklists[id] || [
                { id: '1', text: 'Penyusunan Proposal & RAB', completed: false },
                { id: '2', text: 'Perizinan Tempat & Birokrasi', completed: false },
                { id: '3', text: 'Undangan Pembicara & Peserta', completed: false },
                { id: '4', text: 'Koordinasi Logistik & Konsumsi', completed: false },
                { id: '5', text: 'Branding & Publikasi Media', completed: false },
            ]

            const checklistProgress = checklistItems.length > 0 
                ? Math.round((checklistItems.filter(i => i.completed).length / checklistItems.length) * 100)
                : 0

            return {
                id,
                namaKegiatan: item.title,
                keterangan: item.description,
                tanggal: actDateStr,
                tanggalBerakhir: getValidDateStr(endDate),
                waktuMulai: getValidTimeStr(startTime),
                waktuSelesai: getValidTimeStr(endTime),
                unit: item.unit,
                ruangan: item.room,
                tempat: item.room,
                locationDetail: item.locationDetail || "",
                otherUnit: item.otherUnit || "",
                pejabat: (item.officials || []).map(formatCamelCaseLabel),
                jumlahPeserta: item.participants || 0,
                status: item.status || "Normal",
                hasConflict,
                conflictTypes,
                conflictType: conflictTypes.length > 0 ? conflictTypes[0] : null,
                phase,
                priority,
                checklist: checklistItems,
                checklistProgress,
                notes: notes[id] || [],
                report: reports[id] || null,
            }
        })
    }, [phases, priorities, checklists, notes, reports])

    const fetchActivities = useCallback(async () => {
        try {
            setIsLoading(true)
            const params = {
                page: 1,
                limit: rowFilter,
                search: searchQuery || "",
                unit: filterUnit !== "all" ? filterUnit : undefined,
                status: filterStatus !== "all" ? filterStatus : undefined,
            }

            Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

            const res = await api.get(`/api/activity-monitoring`, { params })

            if (res.data?.success) {
                let mappedData = mapApiDataToComponent(res.data.data || [])

                // Overlap check (duplicated from monitoring-kegiatan page)
                mappedData = mappedData.map(activity => {
                    if (!activity.tanggal) return activity
                    const conflictingAttributes = new Set()

                    mappedData.forEach(other => {
                        if (activity.id === other.id) return
                        if (activity.tanggal !== other.tanggal) return
                        if (activity.waktuMulai < other.waktuSelesai && activity.waktuSelesai > other.waktuMulai) {
                            const overlap = activity.pejabat.filter(p => other.pejabat.includes(p))
                            overlap.forEach(p => conflictingAttributes.add(p))
                        }
                    })

                    return {
                        ...activity,
                        conflictingOfficialsList: Array.from(conflictingAttributes)
                    }
                })

                setActivities(mappedData)
            }
        } catch (err) {
            console.error("Gagal fetch data kegiatan:", err)
            toast.error("Gagal memuat data kegiatan")
        } finally {
            setIsLoading(false)
        }
    }, [searchQuery, filterUnit, filterStatus, rowFilter, mapApiDataToComponent])

    useEffect(() => {
        fetchActivities()
    }, [fetchActivities])

    return {
        activities,
        isLoading,
        fetchActivities,
        updatePhase,
        updateChecklist,
        updateNotes,
        updateReport,
        updatePriority,
    }
}
