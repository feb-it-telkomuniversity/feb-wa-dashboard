"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ExternalLink, HelpCircle } from "lucide-react";

// --- DUMMY DATA ---
const guides = [
    {
        id: 1,
        title: "Cara Membuat Agenda",
        description: "Panduan praktis langkah demi langkah menyusun dan mengatur agenda rutin Anda di MIRA.",
        images: [
            "/Fitur Agenda - 1.jpeg",
            "/Fitur Agenda - 2.jpeg"
        ],
        colSpan: "col-span-1 md:col-span-2",
    },
    {
        id: 2,
        title: "Manajemen Tiket",
        description: "Menangani proses masuk, pelacakan, dan penyelesaian tiket layanan untuk civitas.",
        images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"],
        colSpan: "col-span-1 md:col-span-1",
    },
    {
        id: 3,
        title: "Partnership Monitoring",
        description: "Menangani proses penanganan dalam membuat MoA/MoU/IA.",
        images: ["https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=800&auto=format&fit=crop"],
        colSpan: "col-span-1 md:col-span-1",
    },
    {
        id: 4,
        title: "Sistem Reminder",
        description: "Pengaturan pengingat dan notifikasi yang otomatis dikirim langsung ke WhatsApp Anda.",
        images: ["https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop"],
        colSpan: "col-span-1 md:col-span-2",
    },
    {
        id: 5,
        title: "Notulensi Rapat",
        description: "Mencatat, menyusun, serta mengunduh form notulensi hasil rapat mingguan jurusan.",
        images: ["https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=800&auto=format&fit=crop"],
        colSpan: "col-span-1 md:col-span-3",
    },
]

// --- KOMPONEN BENTO TILT CARD ---
const TiltCard = ({ item, onClick }) => {
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4; // Maksimal putaran 4 derajat
        const rotateY = ((x - centerX) / centerX) * 4;

        setRotation({ x: rotateX, y: rotateY });
    }, []);

    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 })
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onClick={() => onClick(item)}
            className={`relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 ease-out flex flex-col justify-between group
        hover:shadow-2xl hover:border-primary/30 hover:shadow-primary/5
        ${item.colSpan} min-h-[320px]`}
            style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.01 : 1})`,
                transformStyle: "preserve-3d",
            }}
        >
            <div
                className="absolute inset-0 z-0 opacity-40 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-70 blur-sm pointer-events-none"
                style={{
                    backgroundImage: `url(${item.images[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(30px) opacity(0.3)',
                }}
            />

            <div className="z-10 flex flex-col gap-3 relative" style={{ transform: "translateZ(20px)" }}>
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[85%]">
                    {item.description}
                </p>
            </div>

            <div
                className="relative z-10 mt-6 h-48 w-full overflow-hidden rounded-xl bg-muted/30 border border-border/50 shadow-inner group-hover:shadow-md transition-shadow"
                style={{ transform: "translateZ(30px)" }}
            >
                <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    unoptimized={item.images[0]?.startsWith("http")}
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Raycast style glowing button effect */}
            <div
                className={`absolute bottom-6 right-6 p-2 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/50 transition-all duration-300 transform 
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                style={{ transform: "translateZ(40px)" }}
            >
                <ExternalLink className="w-4 h-4 text-primary" />
            </div>
        </div>
    );
};

// --- KOMPONEN UTAMA ---
const PusatBantuanPage = () => {
    const [selectedGuide, setSelectedGuide] = useState(null);
    const [isModalClosing, setIsModalClosing] = useState(false);

    const openModal = (item) => {
        setSelectedGuide(item);
        setIsModalClosing(false);
    };

    const closeModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setSelectedGuide(null);
            setIsModalClosing(false);
        }, 300); // Sinkronisasi dengan durasi animasi exit
    };

    // Tutup modal jika user menekan tombol Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") closeModal();
        };
        if (selectedGuide) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [selectedGuide]);

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden text-foreground font-sans w-full animate-in fade-in duration-500">
            {/* Decorative Telkom Red Glass Gradients */}
            <div className="pointer-events-none absolute -top-40 right-55 -z-10 h-[600px] w-[600px] rounded-full bg-[#cb0000]/10 blur-[120px] dark:bg-[#cb0000]/30" />
            <div className="pointer-events-none absolute -top-40 left-30 -z-10 h-[700px] w-[600px] rounded-full bg-[#cb0000]/10 blur-[120px] dark:bg-[#cb0000]/30" />
            <div className="pointer-events-none absolute bottom-20 left-280 -z-10 h-[400px] w-[400px] rounded-full bg-primary/40 blur-[120px] dark:bg-primary/30" />
            <div className="pointer-events-none absolute -left-0 bottom-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/40 blur-[120px] dark:bg-primary/30" />

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

                {/* HEADER AREA */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/60">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase shadow-sm">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Dukungan Pengguna
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                            Pusat Bantuan
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Semua yang perlu Anda ketahui agar aplikasi MIRA terasa seperti keajaiban. Pelajari panduan fitur dan cara kerjanya di sini.
                        </p>
                    </div>
                </header>

                {/* BENTO GRID AREA */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(320px,auto)]">
                    {guides.map((item) => (
                        <TiltCard key={item.id} item={item} onClick={openModal} />
                    ))}
                </section>
            </main>

            {/* MODAL GLASSMORPHISM OVERLAY */}
            {selectedGuide && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 transition-all duration-300 ease-out
            ${isModalClosing ? 'opacity-0 backdrop-blur-none backdrop-brightness-100' : 'opacity-100 backdrop-blur-xl backdrop-brightness-[0.4] bg-black/40'}
          `}
                    onClick={closeModal}
                >
                    <div
                        className={`relative w-full max-w-5xl max-h-[90vh] bg-background/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-2xl shadow-black/50 overflow-hidden flex flex-col
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-center
              ${isModalClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}
            `}
                        onClick={(e) => e.stopPropagation()} // Mencegah klik dari menjalar ke background (overlay)
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 px-6 border-b border-border bg-card/50">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-semibold text-foreground tracking-tight">{selectedGuide.title}</h3>
                                <p className="text-xs text-muted-foreground">{selectedGuide.description}</p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="p-2 rounded-full hover:bg-destructive/10 group transition-colors focus:outline-none"
                            >
                                <X className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </div>

                        {/* Modal Body (Image Container) */}
                        <div className="relative flex-1 w-full bg-muted/20 p-4 md:p-8 overflow-y-auto custom-scrollbar flex items-start justify-center">
                            <div className="relative w-full max-w-4xl min-h-[50vh] flex flex-col gap-8">
                                {/* Gunakan tag img standar dengan ukuran responsif ketimbang Image NextJS fill untuk kebebasan rasio asli */}
                                {selectedGuide.images.map((imgUrl, idx) => (
                                    <img
                                        key={idx}
                                        src={imgUrl}
                                        alt={`${selectedGuide.title} ${idx + 1}`}
                                        className="w-full h-auto object-contain rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-border/80"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Style untuk kustomisasi scrollbar modal */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: hsl(var(--muted-foreground) / 0.3);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: hsl(var(--primary) / 0.7);
        }
      `}} />
        </div>
    );
};

export default PusatBantuanPage;