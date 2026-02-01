'use client';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'red' | 'blue' | 'green' | 'orange';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
                                  title,
                                  message,
                                  confirmText = 'Confirmer',
                                  cancelText = 'Annuler',
                                  confirmColor = 'red',
                                  onConfirm,
                                  onCancel,
                              }: ConfirmDialogProps) {
    const colors = {
        red: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-red-500/50 shadow-red-500/20',
        blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-500/50 shadow-blue-500/20',
        green: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-500/50 shadow-green-500/20',
        orange: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 border-orange-500/50 shadow-orange-500/20',
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
            <div className="lol-card rounded-lg shadow-2xl max-w-md w-full animate-scale-in border-2 border-[#C8AA6E]/50">
                <div className="p-6">
                    <h2 className="text-2xl font-bold lol-title-gold mb-3">{title}</h2>
                    <p className="lol-text-light leading-relaxed">{message}</p>
                </div>
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-[#1E2328] text-[#A09B8C] rounded-lg font-medium hover:bg-[#1E2328]/80 hover:text-[#F0E6D2] transition-all border border-[#C8AA6E]/30"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all border shadow-lg ${colors[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
