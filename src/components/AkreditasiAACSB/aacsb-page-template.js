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
import { Plus, Search, Download, Upload, Globe } from "lucide-react";
import TableKriteriaData from "@/components/AkreditasiLamemba/table-kriteria-data";
import AddKriteriaDialog from "@/components/AkreditasiLamemba/add-kriteria-dialog";
import AACSBAPIIntegration from "@/components/AkreditasiAACSB/aacsb-api-integration";
import { toast } from "sonner";

export default function AACSBPageTemplate({ pageData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Data berhasil ditambahkan");
  };

  const handleImportData = (syncedData) => {
    setRefreshTrigger((prev) => prev + 1);
    setIsApiDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <pageData.icon className="h-8 w-8" />
            {pageData.title}
          </h1>
          <p className="text-muted-foreground">{pageData.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsApiDialogOpen(true)}>
            <Globe className="h-4 w-4 mr-2" />
            Tarik Data Gateway
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database AACSB</CardTitle>
          <CardDescription>
            Kelola data untuk standar akreditasi AACSB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari data..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TableKriteriaData
            data={pageData.mockData}
            columns={pageData.columns}
            searchQuery={searchQuery}
            refreshTrigger={refreshTrigger}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </CardContent>
      </Card>

      <AddKriteriaDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
        columns={pageData.columns}
        title={pageData.title}
      />

      <AACSBAPIIntegration
        isDialog={true}
        open={isApiDialogOpen}
        onOpenChange={setIsApiDialogOpen}
        onImportData={handleImportData}
      />
    </div>
  );
}