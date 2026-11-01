import { AlertTriangle, Info, Trash2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  const styles = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600',
      icon: Trash2,
      btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600',
      icon: AlertTriangle,
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
    },
    info: {
      iconBg: 'bg-sky-50 text-sky-600',
      icon: Info,
      btn: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200',
    },
    success: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: CheckCircle2,
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
    },
  }[type] || {
    iconBg: 'bg-rose-50 text-rose-600',
    icon: Trash2,
    btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
  };

  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className={clsx('w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xs', styles.iconBg)}>
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              'w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50',
              styles.btn
            )}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
