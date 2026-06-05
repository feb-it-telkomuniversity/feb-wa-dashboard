'use client'

import React from 'react'
import Image from 'next/image'

export default function PrintableSuratA4({ formData }) {
  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <>
      <div 
        id="printable-letter-container" 
        className="border shadow-md bg-white text-black p-12 max-w-[210mm] mx-auto min-h-[297mm] font-serif leading-relaxed text-sm select-text relative print-container"
      >
        {/* Header Kop Surat FEB */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-telyu.webp" width={50} height={50} alt="Logo Telkom University" />
            <div className="text-left font-sans">
              <h2 className="text-md font-extrabold tracking-wide uppercase leading-tight">Universitas Telkom</h2>
              <h1 className="text-lg font-black uppercase leading-tight">Fakultas Ekonomi dan Bisnis</h1>
              <p className="text-[9px] text-gray-500 font-semibold tracking-tighter mt-0.5 uppercase leading-none">
                Gedung Manterawu, Jl. Telekomunikasi Terusan Buahbatu No. 1, Bandung
              </p>
            </div>
          </div>
          
          <div className="text-right font-sans text-[8px] text-gray-500 border-l pl-3 leading-tight hidden sm:block">
            <strong>Web:</strong> seb.telkomuniversity.ac.id<br />
            <strong>Email:</strong> seb@telkomuniversity.ac.id<br />
            <strong>ISO:</strong> 9001:2015 Cert.
          </div>
        </div>

        {/* Letter Info Block */}
        <div className="grid grid-cols-2 gap-4 text-xs mb-6">
          <div className="space-y-1">
            <div><strong>Nomor:</strong> {formData?.nomorSurat || formData?.letterNumber || '_________________'}</div>
            <div><strong>Hal:</strong> {formData?.perihal || formData?.subject}</div>
            <div><strong>Lampiran:</strong> —</div>
          </div>
          <div className="text-right">
            <div>Bandung, {formatDate(formData?.tanggalSurat || formData?.date)}</div>
          </div>
        </div>

        {/* Recipient Address */}
        <div className="mb-6 text-xs font-semibold whitespace-pre-wrap">
          {formData?.tujuanPenerima || formData?.recipient}
        </div>

        {/* Salutation */}
        <div className="mb-4">
          {formData?.salamPembuka || formData?.salutation}
        </div>

        {/* Opening Paragraph */}
        <p className="mb-4 text-justify indent-8 text-sm">
          {formData?.paragrafPembuka || formData?.opening}
        </p>

        {/* Core Content */}
        <div className="mb-4 indent-8 text-sm whitespace-pre-wrap text-justify">
          {formData?.isiUtama || formData?.coreContent || formData?.content}
        </div>

        {/* Closing Paragraph */}
        <p className="mb-10 text-justify indent-8 text-sm">
          {formData?.paragrafPenutup || formData?.closing}
        </p>

        {/* Signer Block */}
        <div className="flex justify-end pr-8 mt-12">
          <div className="text-center w-64 text-sm">
            <p className="mb-20">{formData?.jabatanPenandatangan || formData?.signerTitle || '_________________'},</p>
            <p className="font-bold underline decoration-1 decoration-slate-900 leading-none">{formData?.namaPenandatangan || formData?.signerName || '_________________'}</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 2.5cm 2cm !important;
            margin: 0 !important;
            display: block !important;
          }
        }
      ` }} />
    </>
  )
}
