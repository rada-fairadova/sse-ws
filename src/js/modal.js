export class NicknameModal {
    constructor() {
        this.modal = document.getElementById('nicknameModal');
        this.nicknameInput = document.getElementById('nicknameInput');
        this.joinButton = document.getElementById('joinChat');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.joinButton.addEventListener('click', () => this.joinChat());
        this.nicknameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinChat();
            }
        });
    }
    
    show() {
        this.modal.classList.remove('hidden');
        this.nicknameInput.focus();
    }
    
    hide() {
        this.modal.classList.add('hidden');
        this.clearError();
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
    }
    
    clearError() {
        this.errorMessage.textContent = '';
    }
    
    getNickname() {
        return this.nicknameInput.value.trim();
    }
    
    joinChat() {
        const nickname = this.getNickname();
        if (!nickname) {
            this.showError('Пожалуйста, введите никнейм');
            return;
        }
        
        this.clearError();
        return nickname;
    }
    
    setJoinHandler(handler) {
        this.joinHandler = handler;
        this.joinButton.onclick = () => {
            const nickname = this.joinChat();
            if (nickname && this.joinHandler) {
                this.joinHandler(nickname);
            }
        };
    }
}