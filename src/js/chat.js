export class Chat {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.currentUser = null;
        
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
        this.usersList = document.getElementById('usersList');
        this.currentUserElement = document.getElementById('currentUser');
        this.logoutButton = document.getElementById('logoutBtn');
        this.chatContainer = document.getElementById('chatContainer');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        this.logoutButton.addEventListener('click', () => this.logout());
    }
    
    connect(nickname) {
        this.socket = new WebSocket(this.serverUrl);
        
        this.socket.onopen = () => {
            console.log('Connected to WebSocket server');
            this.sendJoinRequest(nickname);
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            this.showReconnectMessage();
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    sendJoinRequest(nickname) {
        const message = {
            type: 'join',
            name: nickname
        };
        this.socket.send(JSON.stringify(message));
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'joinSuccess':
                this.handleJoinSuccess(data);
                break;
            case 'joinError':
                this.handleJoinError(data);
                break;
            case 'send':
                this.handleChatMessage(data);
                break;
            case 'users':
                this.updateUsersList(data.users);
                break;
            case 'userJoined':
                this.handleUserJoined(data);
                break;
            case 'userLeft':
                this.handleUserLeft(data);
                break;
        }
    }
    
    handleJoinSuccess(data) {
        this.currentUser = data.user;
        this.currentUserElement.textContent = `Вы: ${this.currentUser.name}`;
        this.chatContainer.classList.remove('hidden');
        this.messageInput.focus();
    }
    
    handleJoinError(data) {
        if (typeof window.showNicknameError === 'function') {
            window.showNicknameError(data.message);
        }
    }
    
    handleChatMessage(data) {
        this.addMessage(data);
    }
    
    handleUserJoined(data) {
        this.addSystemMessage(`Пользователь ${data.user.name} присоединился к чату`);
    }
    
    handleUserLeft(data) {
        this.addSystemMessage(`Пользователь ${data.user.name} покинул чат`);
    }
    
    addMessage(data) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${data.user.id === this.currentUser?.id ? 'own' : 'other'}`;
        
        const header = document.createElement('div');
        header.className = 'message-header';
        header.textContent = data.user.id === this.currentUser?.id ? 'You' : data.user.name;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = data.message;
        
        messageElement.appendChild(header);
        messageElement.appendChild(content);
        this.messagesContainer.appendChild(messageElement);
        
        this.scrollToBottom();
    }
    
    addSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.style.cssText = `
            text-align: center;
            background-color: #fff3cd;
            color: #856404;
            max-width: 100%;
            font-style: italic;
        `;
        messageElement.textContent = text;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    updateUsersList(users) {
        this.usersList.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('li');
            userElement.textContent = user.name;
            if (user.id === this.currentUser?.id) {
                userElement.style.fontWeight = 'bold';
            }
            this.usersList.appendChild(userElement);
        });
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        const data = {
            type: 'send',
            message: message
        };
        
        this.socket.send(JSON.stringify(data));
        this.messageInput.value = '';
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    showReconnectMessage() {
        this.addSystemMessage('Соединение потеряно. Попытка переподключения...');
    }
    
    logout() {
        if (this.socket) {
            this.socket.close();
        }
        this.chatContainer.classList.add('hidden');
        location.reload();
    }
    
    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}