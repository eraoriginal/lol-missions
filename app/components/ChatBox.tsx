'use client';

import { useState, useEffect, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher';

interface Message {
    id: string;
    playerName: string;
    playerAvatar: string;
    content: string;
    createdAt: string;
}

interface ChatBoxProps {
    roomCode: string;
}

export function ChatBox({ roomCode }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null!);
    const inputRef = useRef<HTMLInputElement>(null!);
    console.log('[ChatBox] Component mounted, roomCode:', roomCode);

    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    // Charge les messages existants
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/rooms/${roomCode}/messages`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [roomCode]);

    // 🔥 Écoute les nouveaux messages en temps réel via Pusher
    useEffect(() => {
        const pusher = getPusherClient();
        const channel = pusher.subscribe(`room-${roomCode}`);

        channel.bind('new-message', (message: Message) => {
            console.log('[CHAT] New message received:', message);
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            channel.unbind('new-message');
            pusher.unsubscribe(`room-${roomCode}`);
        };
    }, [roomCode]);

    // Auto-scroll vers le bas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !playerToken || sending) return;

        setSending(true);

        try {
            const response = await fetch(`/api/rooms/${roomCode}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    playerToken,
                }),
            });

            if (response.ok) {
                setNewMessage('');
                inputRef.current?.focus();
            } else {
                const data = await response.json();
                console.error('Error sending message:', data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-96">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    💬 Chat de la partie
                </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">
                        Aucun message pour le moment...
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className="flex items-start gap-3">
                            {/* Avatar */}
                            {message.playerAvatar ? (
                                <img
                                    src={message.playerAvatar}
                                    alt={message.playerName}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {message.playerName.charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* Message */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {message.playerName}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm mt-1 break-words">
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écris un message..."
                        maxLength={500}
                        disabled={sending}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-gray-900"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {sending ? '...' : 'Envoyer'}
                    </button>
                </div>
            </form>
        </div>
    );
}