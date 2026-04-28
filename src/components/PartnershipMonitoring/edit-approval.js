import React, { useState, useEffect } from 'react';
import { FileEdit, CheckCircle2, XCircle, Clock, CircleDashed, LoaderIcon, CheckCircleIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import api from '@/lib/axios';

const approvalStatusOptions = [
  { value: 'Approved', label: 'Approved', color: 'bg-emerald-500', icon: CheckCircle2 },
  { value: 'Returned', label: 'Returned', color: 'bg-red-500', icon: XCircle },
  { value: 'Pending', label: 'Pending', color: 'bg-amber-500', icon: Clock },
  { value: 'Skipped', label: 'Skipped', color: 'bg-slate-400', icon: CircleDashed }
]

const approvalHierarchy = {
  MoA: [
    { name: 'approvalWadek2', label: 'Wadek II' },
    { name: 'approvalWadek1', label: 'Wadek I' },
    { name: 'approvalDirSPIO', label: 'Dir. SPIO' },
    { name: 'approvalDirMIK', label: 'Dir. MIK' },
    { name: 'approvalKaurLegal', label: 'Ka. Ur. Legal' },
    { name: 'approvalDekan', label: 'Dekan' }
  ],
  MoU: [
    { name: 'approvalWadek2', label: 'Wadek II' },
    { name: 'approvalWadek1', label: 'Wadek I' },
    { name: 'approvalDirSPIO', label: 'Dir. SPIO' },
    { name: 'approvalDirMIK', label: 'Dir. MIK' },
    { name: 'approvalKaurLegal', label: 'Ka. Ur. Legal' },
    { name: 'approvalWarek1', label: 'Warek I' },
    { name: 'approvalRektor', label: 'Rektor' }
  ],
  IA: [
    { name: 'approvalWadek2', label: 'Wadek II' },
    { name: 'approvalWadek1', label: 'Wadek I' },
    { name: 'approvalDirSPIO', label: 'Dir. SPIO' },
    { name: 'approvalDekan', label: 'Dekan' }
  ]
};


const ApprovalCard = ({ approval, value, onChange }) => {
  const selectedStatus = approvalStatusOptions.find(opt => opt.value === value);
  const StatusIcon = selectedStatus?.icon || CircleDashed;

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full ${selectedStatus?.color || 'bg-slate-200'} flex items-center justify-center transition-colors duration-300`}>
            <StatusIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-slate-800">{approval.label}</h5>
            <p className="text-xs text-slate-500">{selectedStatus?.label || 'Belum dipilih'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {approvalStatusOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 transform
            ${isSelected
                    ? `${option.color} text-white shadow-md scale-105`
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:scale-102'
                  }
            `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ approvals }) => {
  const total = approvals.length;
  const approved = approvals.filter(a => a.value?.toLowerCase() === 'approved').length;
  const percentage = total > 0 ? (approved / total) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Progress Persetujuan</span>
        <span className="text-sm font-bold text-[#e31e25]">{approved}/{total} Approved</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-300 to-[#b71c1c] transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

export default function EditApproval({ partnershipId, partnership, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Determine hierarchy based on docType
  const docTypeStr = partnership?.docType?.trim()?.toLowerCase() || '';
  let activeHierarchyMatch = 'MoU'; // fallback
  if (docTypeStr.includes('moa')) {
    activeHierarchyMatch = 'MoA';
  } else if (docTypeStr.includes('mou')) {
    activeHierarchyMatch = 'MoU';
  } else if (docTypeStr === 'ia' || docTypeStr.includes('implementation')) {
    activeHierarchyMatch = 'IA';
  } else {
    // If it's something else not specified, fallback to IA
    activeHierarchyMatch = 'IA';
  }

  // Setup react-hook-form dengan defaultValues dari partnership
  const form = useForm({
    defaultValues: {
      approvalWadek2: null,
      approvalWadek1: null,
      approvalDekan: null,
      approvalKabagKST: null,
      approvalDirSPIO: null,
      approvalDirMIK: null,
      approvalKaurLegal: null,
      approvalKabagSekpim: null,
      approvalDirSPS: null,
      approvalWarek1: null,
      approvalRektor: null,
    }
  })

  // Inisialisasi form values dari partnership ketika dialog dibuka
  useEffect(() => {
    if (open && partnership) {
      form.reset({
        approvalWadek2: partnership.approvalWadek2 || null,
        approvalWadek1: partnership.approvalWadek1 || null,
        approvalDekan: partnership.approvalDekan || null,
        approvalKabagKST: partnership.approvalKabagKST || null,
        approvalDirSPIO: partnership.approvalDirSPIO || null,
        approvalDirMIK: partnership.approvalDirMIK || null,
        approvalKaurLegal: partnership.approvalKaurLegal || null,
        approvalKabagSekpim: partnership.approvalKabagSekpim || null,
        approvalDirSPS: partnership.approvalDirSPS || null,
        approvalWarek1: partnership.approvalWarek1 || null,
        approvalRektor: partnership.approvalRektor || null,
      });
    }
  }, [open, partnership, form]);

  // Watch semua approval values untuk mendapatkan real-time updates
  const formValues = form.watch();

  const handleApprovalChange = (name, value) => {
    form.setValue(name, value, { shouldDirty: true });
  }

  const getAllApprovals = () => {
    return approvalHierarchy[activeHierarchyMatch].map(approval => ({
      ...approval,
      value: formValues[approval.name] || null
    }));
  }

  const handleSubmit = async (values) => {
    if (!partnershipId) {
      toast.error("ID partnership tidak ditemukan");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        approvalWadek2: values.approvalWadek2 || null,
        approvalWadek1: values.approvalWadek1 || null,
        approvalDekan: values.approvalDekan || null,
        approvalKabagKST: values.approvalKabagKST || null,
        approvalDirSPIO: values.approvalDirSPIO || null,
        approvalDirMIK: values.approvalDirMIK || null,
        approvalKaurLegal: values.approvalKaurLegal || null,
        approvalKabagSekpim: values.approvalKabagSekpim || null,
        approvalDirSPS: values.approvalDirSPS || null,
        approvalWarek1: values.approvalWarek1 || null,
        approvalRektor: values.approvalRektor || null,
      };

      await api.put(`/api/partnership/${partnershipId}`, payload)

      toast.success("Approval berhasil diperbarui")
      form.reset()
      setOpen(false)

      // Call callback untuk refresh data jika ada
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Gagal memperbarui approval:", error)
      toast.error(error?.response?.data?.message || "Gagal memperbarui approval")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto text-left" variant="ghost"><CheckCircleIcon className='text-yellow-500' />Status Approval</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl w-full p-0 border-none shadow-none overflow-hidden dark:bg-transparent dark:bg-transparent">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className={`bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:bg-none dark:bg-slate-900 p-6 rounded-2xl h-[83vh] overflow-y-auto`}>
              <div className="mx-auto">
                {/* Header */}
                <div className="dark:bg-slate-800 bg-white rounded-2xl shadow-xl p-8 mb-6 dark:border-slate-700 border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-800 to-red-400 rounded-xl flex items-center justify-center">
                      <CheckCircleIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-red-800 bg-clip-text text-transparent">
                        Edit Approval
                      </h1>
                      <DialogHeader>
                        <DialogTitle>berdasarkan pihak terkait</DialogTitle>
                      </DialogHeader>
                    </div>
                  </div>
                </div>

                {/* Approval Section */}
                <div className="dark:bg-slate-800 bg-white rounded-2xl shadow-xl p-8 dark:border-slate-700 border border-slate-200">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <div className="w-2 h-6 bg-gradient-to-b from-rose-500 to-red-800 rounded-full"></div>
                    Status Persetujuan
                  </h3>
                  <p className="mb-6">Kelola persetujuan dari berbagai pihak</p>

                  <ProgressBar approvals={getAllApprovals()} />

                  {/* Approval Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {approvalHierarchy[activeHierarchyMatch].map((approval) => (
                      <ApprovalCard
                        key={approval.name}
                        approval={approval}
                        value={formValues[approval.name]}
                        onChange={(value) => handleApprovalChange(approval.name, value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6 justify-end">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoaderIcon className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}