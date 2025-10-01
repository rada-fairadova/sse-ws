import '../styles/main.css';
import { NicknameModal } from './modal.js';
import { Chat } from './chat.js';

class ChatApp {
    constructor() {
        this.serverUrl = 'wss://your-chat-server.onrender.com';
        this.chat = new Chat(this.serverUrl);
        this.modal = new NicknameModal();
        
        this.init();
    }
    
    init() {
        this.modal.setJoinHandler((nickname) => {
            this.joinChat(nickname);
        });

        this.modal.show();

        window.showNicknameError = (message) => {
            this.modal.showError(message);
        };
    }
    
    joinChat(nickname) {
        this.chat.connect(nickname);

        const checkConnection = setInterval(() => {
            if (this.chat.isConnected()) {
                this.modal.hide();
                clearInterval(checkConnection);
            }
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});