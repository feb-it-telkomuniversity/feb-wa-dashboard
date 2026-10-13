"use client"

import React, { useState } from "react"
import {
  FileText,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  Info,
  FileCheck2,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export const PARTNERSHIP_TEMPLATES = [
  {
    type: "MoA",
    shortTitle: "Template MoA",
    title: "Memorandum of Agreement (MoA)",
    description: "Perjanjian Kerjasama untuk pelaksanaan program / kegiatan spesifik antar institusi.",
    url: "https://tel-u.ac.id/template-moa-feb",
    cleanUrl: "tel-u.ac.id/template-moa-feb",
    colorScheme: {
      badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white",
      border: "border-purple-200/70 dark:border-purple-800/60 hover:border-purple-400 dark:hover:border-purple-600",
      accent: "text-purple-600 dark:text-purple-400",
      bgHover: "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
    }
  },
  {
    type: "MoU",
    shortTitle: "Template MoU",
    title: "Memorandum of Understanding (MoU)",
    description: "Nota Kesepahaman sebagai payung hukum kerjasama umum antar lembaga / mitra.",
    url: "https://tel-u.ac.id/template-mou-feb",
    cleanUrl: "tel-u.ac.id/template-mou-feb",
    colorScheme: {
      badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800",
      iconBg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white",
      border: "border-teal-200/70 dark:border-teal-800/60 hover:border-teal-400 dark:hover:border-teal-600",
      accent: "text-teal-600 dark:text-teal-400",
      bgHover: "hover:bg-teal-50/50 dark:hover:bg-teal-950/20",
      button: "bg-teal-600 hover:bg-teal-700 text-white",
    }
  },
  {
    type: "IA",
    shortTitle: "Template IA",
    title: "Implementation Arrangement (IA)",
    description: "Perjanjian Pelaksanaan Kegiatan teknis dan operasional turunan dari MoA/MoU.",
    url: "https://tel-u.ac.id/template-ia-feb",
    cleanUrl: "tel-u.ac.id/template-ia-feb",
    colorScheme: {
      badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white",
      border: "border-indigo-200/70 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-600",
      accent: "text-indigo-600 dark:text-indigo-400",
      bgHover: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    }
  },
]

/**
 * Copy helper with sonner notification
 */
export function copyTemplateUrl(url, title) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(url)
    toast.success(`Link ${title} disalin ke clipboard!`, {
      description: url,
    })
  }
}

/**
 * Banner utama yang menampilkan 3 template resmi dengan icon clickable
 */
export function PartnershipTemplatesBanner({ className }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleCopy = (url, title, index) => {
    copyTemplateUrl(url, title)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30 p-5 md:p-6 shadow-sm backdrop-blur-sm transition-all",
        className
      )}
    >
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-xl bg-primary/15 p-2.5 text-primary ring-1 ring-primary/25 shrink-0">
            <FileCheck2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Template Resmi Kerjasama FEB Telkom University
              </h3>
              <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/20 font-medium">
                Wajib Digunakan
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Setiap pengajuan kerjasama wajib disusun menggunakan template resmi di bawah ini. Klik icon atau tombol untuk langsung mengakses dokumen template.
            </p>
          </div>
        </div>
      </div>

      {/* Grid 3 Templates */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
        {PARTNERSHIP_TEMPLATES.map((tmpl, index) => (
          <div
            key={tmpl.type}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border bg-card/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
              tmpl.colorScheme.border,
              tmpl.colorScheme.bgHover
            )}
          >
            {/* Card Content Top */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <Badge className={cn("font-semibold text-xs border", tmpl.colorScheme.badge)}>
                  {tmpl.type}
                </Badge>
                
                {/* Actions: Copy Link & External Open clickable icons */}
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleCopy(tmpl.url, tmpl.shortTitle, index)
                          }}
                          aria-label={`Salin link ${tmpl.shortTitle}`}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                          {copiedIndex === index ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{copiedIndex === index ? "Tersalin!" : "Salin Link"}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={tmpl.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Buka link ${tmpl.shortTitle}`}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Buka di tab baru</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>
            </div>

            {/* Clickable Action Button with prominent icon */}
            <div className="pt-3 mt-3 border-t border-border/50">
              <a
                href={tmpl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full p-2 rounded-lg bg-muted/60 hover:bg-primary/10 group-hover:border-primary/30 border border-transparent transition-all text-xs font-medium text-foreground hover:text-primary"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={cn("p-1 rounded-md transition-colors", tmpl.colorScheme.iconBg)}>
                    <Download className="size-3.5" />
                  </div>
                  <span className="truncate text-muted-foreground group-hover:text-foreground font-mono text-[11px]">
                    {tmpl.cleanUrl}
                  </span>
                </div>
                <div className="p-1 rounded-md text-primary shrink-0 transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-4" />
                </div>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Sidebar card for right column on desktop
 */
export function PartnershipTemplatesSidebarCard({ className }) {
  return (
    <Card className={cn("border-primary/20 bg-card shadow-sm overflow-hidden", className)}>
      <CardHeader className="bg-primary/5 pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Template Kerjasama Resmi
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
            FEB Tel-U
          </Badge>
        </div>
        <CardDescription className="text-xs pt-1">
          Unduh template dokumen Word sebelum mengunggah berkas pengajuan:
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 space-y-2.5">
        {PARTNERSHIP_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.type}
            className="flex items-center justify-between p-2.5 rounded-lg border bg-background/80 hover:bg-accent/40 transition-all group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <a
                href={tmpl.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Klik untuk membuka ${tmpl.shortTitle}`}
                className={cn(
                  "p-2 rounded-lg transition-transform group-hover:scale-105 shrink-0 flex items-center justify-center",
                  tmpl.colorScheme.iconBg
                )}
              >
                <FileText className="size-4" />
              </a>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {tmpl.shortTitle}
                  </span>
                  <Badge className={cn("text-[10px] px-1 py-0 h-4 border", tmpl.colorScheme.badge)}>
                    {tmpl.type}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                  {tmpl.cleanUrl}
                </p>
              </div>
            </div>

            {/* Clickable Icon Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={tmpl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-primary hover:bg-primary/15 transition-all shrink-0"
                    aria-label={`Buka ${tmpl.shortTitle}`}
                  >
                    <ArrowUpRight className="size-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Buka {tmpl.shortTitle}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Compact inline alert/helper for Step 1 (docType select) or Step 4 (upload area)
 */
export function PartnershipTemplatesInline({ activeDocType, className }) {
  const currentTemplate = PARTNERSHIP_TEMPLATES.find(t => t.type.toLowerCase() === (activeDocType || "").toLowerCase())

  return (
    <div className={cn("rounded-lg border bg-muted/40 p-3 space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Info className="size-3.5 text-primary" />
          <span>Template Resmi Dokumen Kerjasama:</span>
        </div>
        {currentTemplate && (
          <span className="text-[11px] text-muted-foreground">
            Sesuai tipe terpilih: <strong className="text-primary">{currentTemplate.type}</strong>
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {PARTNERSHIP_TEMPLATES.map((tmpl) => {
          const isSelected = activeDocType && tmpl.type.toLowerCase() === activeDocType.toLowerCase()
          return (
            <a
              key={tmpl.type}
              href={tmpl.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Klik untuk mengunduh / membuka ${tmpl.shortTitle}`}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all shadow-xs group",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20"
                  : "bg-background text-foreground hover:bg-accent border-border"
              )}
            >
              <Download className={cn("size-3.5 transition-transform group-hover:-translate-y-0.5", isSelected ? "text-primary-foreground" : tmpl.colorScheme.accent)} />
              <span>{tmpl.shortTitle}</span>
              <ExternalLink className={cn("size-3 opacity-70 group-hover:opacity-100", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
            </a>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Modal dialog for opening templates from any page (e.g. Riwayat Pengajuan header)
 */
export function PartnershipTemplatesDialog({ trigger, className }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleCopy = (url, title, index) => {
    copyTemplateUrl(url, title)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={cn("gap-2 shadow-xs", className)}>
            <FileText className="size-4 text-primary" />
            <span>Template Kerjasama</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileCheck2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Template Resmi Kerjasama FEB</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Telkom University - Fakultas Ekonomi dan Bisnis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-xs sm:text-sm text-muted-foreground">
          Dokumen pengajuan kerjasama wajib disusun menggunakan template resmi berikut:
        </p>

        <div className="space-y-3 py-2">
          {PARTNERSHIP_TEMPLATES.map((tmpl, index) => (
            <div
              key={tmpl.type}
              className={cn(
                "p-3.5 rounded-xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all",
                tmpl.colorScheme.border,
                tmpl.colorScheme.bgHover
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs font-semibold", tmpl.colorScheme.badge)}>
                    {tmpl.type}
                  </Badge>
                  <h4 className="font-semibold text-sm text-foreground">
                    {tmpl.title}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground max-w-md">
                  {tmpl.description}
                </p>
                <div className="pt-1">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {tmpl.cleanUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(tmpl.url, tmpl.shortTitle, index)}
                        aria-label={`Salin link ${tmpl.shortTitle}`}
                      >
                        {copiedIndex === index ? (
                          <Check className="size-4 text-emerald-600" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{copiedIndex === index ? "Tersalin!" : "Salin Link"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <a
                  href={tmpl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-xs transition-colors",
                    tmpl.colorScheme.button
                  )}
                >
                  <ExternalLink className="size-3.5" />
                  <span>Buka Template</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
