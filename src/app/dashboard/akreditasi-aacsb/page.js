"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Upload, Award, FileText, Globe } from "lucide-react";
import TableAkreditasiAACSB from "@/components/AkreditasiAACSB/table-akreditasi-aacsb";
import AACSBAPIIntegration from "@/components/AkreditasiAACSB/aacsb-api-integration";
import { toast } from "sonner";

export default function AkreditasiAACSBPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);

  const handleExport = () => {
    toast.info("Fitur export sedang dalam pengembangan");
  };

  const handleImport = () => {
    toast.info("Fitur import sedang dalam pengembangan");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Akreditasi AACSB
          </h1>
          <p className="text-muted-foreground">
            Database akreditasi AACSB (Association to Advance Collegiate Schools
            of Business)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsApiDialogOpen(true)}>
            <Globe className="h-4 w-4 mr-2" />
            Integrasi API Gateway
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() =>
              toast.info("Navigasi ke submenu untuk menambah data")
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview Akreditasi AACSB</CardTitle>
          <CardDescription>
            Status dan ringkasan data akreditasi program studi untuk AACSB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari program studi..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TableAkreditasiAACSB searchQuery={searchQuery} />
        </CardContent>
      </Card>

      {/* AACSB API Gateway Integration Component */}
      <AACSBAPIIntegration />

      {/* Dialog version if opened from header button */}
      <AACSBAPIIntegration
        isDialog={true}
        open={isApiDialogOpen}
        onOpenChange={setIsApiDialogOpen}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Tentang AACSB
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="text-muted-foreground leading-relaxed">
                AACSB International (Association to Advance Collegiate Schools
                of Business) adalah lembaga akreditasi terkemuka dunia untuk
                sekolah bisnis yang telah mengakreditasi lebih dari 950
                institusi di lebih dari 60 negara.
              </p>
            </div>
            <div className="text-sm">
              <p className="font-semibold mb-2">Keunggulan Akreditasi AACSB:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Pengakuan internasional tertinggi untuk business school</li>
                <li>Standar kualitas pendidikan bisnis global</li>
                <li>Peningkatan daya saing alumni di pasar kerja global</li>
                <li>Kemitraan dengan universitas terbaik dunia</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Standar Akreditasi AACSB
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-semibold mb-2">9 Standar Utama:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Standard 1: Strategic Planning</li>
                <li>Standard 2: Physical, Virtual, and Financial Resources</li>
                <li>Standard 3: Faculty and Professional Resources</li>
                <li>Standard 4: Curriculum</li>
                <li>Standard 5: Assurance of Learning</li>
                <li>Standard 6: Learner Progression</li>
                <li>Standard 7: Teaching Effectiveness and Impact</li>
                <li>Standard 8: Impact of Scholarship</li>
                <li>Standard 9: Engagement and Societal Impact</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
