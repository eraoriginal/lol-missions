'use client';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'red' | 'blue' | 'green' | 'orange'; // 🆕 Ajoute orange
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
        red: 'bg-red-600 hover:bg-red-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        green: 'bg-green-600 hover:bg-green-700',
        orange: 'bg-orange-600 hover:bg-orange-700',
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${colors[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}