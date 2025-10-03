// Chat Widget JavaScript

class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.sessionId = this.generateSessionId();
        // Connection configuration
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
        this.requestTimeout = 10000; // 10 seconds
        this.connectionStatus = 'unknown';
        this.lastError = null;
        this.init();
    }

    generateSessionId() {
        return 'chat_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    init() {
        // Selected files for upload
        this.selectedFiles = [];
        
        // Wait for DOM to be ready, then set up events
        setTimeout(() => {
            this.setupEvents();
        }, 100);
    }
    
    setupEvents() {
        // 1. SEND BUTTON - Multiple approaches
        this.setupSendButton();
        
        // 2. ENTER KEY - Simple keypress
        this.setupEnterKey();
        
        // 3. PHOTO ATTACHMENT - Working version
        this.setupPhotoAttachment();
    }
    
    setupSendButton() {
        const btn = document.getElementById('sendButton');
        if (!btn) {
            return;
        }
        
        // Multiple event bindings to ensure it works
        btn.onclick = () => this.doSendMessage();
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.doSendMessage();
        });
    }
    
    setupEnterKey() {
        const input = document.getElementById('chatInput');
        if (!input) {
            return;
        }
        
        // Multiple event bindings
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.doSendMessage();
            }
        };
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.doSendMessage();
            }
        });
    }
    
    setupPhotoAttachment() {
        const photoBtn = document.getElementById('photoButton');
        const photoInput = document.getElementById('photoInput');
        
        if (!photoBtn || !photoInput) {
            return;
        }
        
        // Simple click handler
        photoBtn.onclick = () => {
            photoInput.click();
        };
        
        // File selection handler
        photoInput.onchange = (e) => {
            this.handleFileSelect(e);
        };
    }
    
    doSendMessage() {
        console.log('[Chat] doSendMessage called');
        const input = document.getElementById('chatInput');

        if (!input) {
            console.error('[Chat] Input element not found');
            return;
        }

        const message = input.value.trim();
        console.log('[Chat] Message:', message);
        console.log('[Chat] Selected files:', this.selectedFiles.length);

        if (!message && this.selectedFiles.length === 0) {
            console.log('[Chat] No message or files to send');
            return;
        }

        // Call the actual send function
        console.log('[Chat] Calling sendMessage()');
        this.sendMessage();
    }

    toggleChat() {
        // Inline chat is always open, no toggle needed
    }

    openChat() {
        // Inline chat is always open
        this.isOpen = true;
        if (this.chatContainer) {
            this.chatContainer.style.display = 'flex';
        }
        if (this.chatInput) {
            this.chatInput.focus();
        }
    }

    closeChat() {
        // Can't close inline chat, just clear focus
        if (this.chatInput) {
            this.chatInput.blur();
        }
    }

    updateToggleButton() {
        // No toggle button in inline version
        return;
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.selectedFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (this.selectedFiles.length > 0) {
            this.showSelectedFiles();
        }
        
        // Clear the file input so same file can be selected again
        event.target.value = '';
    }

    showSelectedFiles() {
        // Remove existing preview
        const existingPreview = document.getElementById('photoPreview');
        if (existingPreview) {
            existingPreview.remove();
        }

        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.id = 'photoPreview';
        previewContainer.className = 'photo-preview';
        
        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'photo-preview-item';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'photo-remove';
            removeBtn.innerHTML = '✕';
            removeBtn.onclick = () => this.removeFile(index);
            
            const fileName = document.createElement('span');
            fileName.className = 'photo-name';
            fileName.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
            
            fileItem.appendChild(img);
            fileItem.appendChild(removeBtn);
            fileItem.appendChild(fileName);
            previewContainer.appendChild(fileItem);
        });
        
        // Insert preview above input container
        const chatInputContainer = document.querySelector('.chat-input-container');
        chatInputContainer.parentNode.insertBefore(previewContainer, chatInputContainer);
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        if (this.selectedFiles.length > 0) {
            this.showSelectedFiles();
        } else {
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.remove();
            }
        }
    }

    addPhotosToChat(files) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content photos-message';
        
        files.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            img.className = 'chat-photo';
            img.onclick = () => this.showPhotoModal(img.src, file.name);
            contentDiv.appendChild(img);
        });
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showPhotoModal(src, filename) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.onclick = () => modal.remove();
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = filename;
        img.onclick = (e) => e.stopPropagation();
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = () => modal.remove();
        
        modal.appendChild(img);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
    }

    async sendMessage() {
        console.log('[Chat] sendMessage started');
        // Get elements fresh each time to avoid stale references
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');

        if (!chatInput) {
            console.error('[Chat] chatInput not found in sendMessage');
            return;
        }

        const message = chatInput.value.trim();
        const hasFiles = this.selectedFiles.length > 0;

        console.log('[Chat] Message to send:', message);
        console.log('[Chat] Has files:', hasFiles);

        if (!message && !hasFiles) {
            console.log('[Chat] Nothing to send');
            return;
        }

        // Disable input while sending
        console.log('[Chat] Disabling input');
        this.setInputState(false);

        // Add user message to chat
        if (message) {
            console.log('[Chat] Adding user message to UI');
            this.addMessage(message, 'user');
        }

        // Add photos to chat if any
        if (hasFiles) {
            console.log('[Chat] Adding photos to UI');
            this.addPhotosToChat(this.selectedFiles);
        }

        chatInput.value = '';

        // Clear file selection and preview
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.remove();
        }

        // Show typing indicator
        console.log('[Chat] Showing typing indicator');
        this.showTypingIndicator();

        try {
            // Send message to n8n webhook
            console.log('[Chat] Calling sendToN8n...');
            const response = await this.sendToN8n(message, this.selectedFiles);
            console.log('[Chat] Response from n8n:', response);
            
            // Clear selected files
            this.selectedFiles = [];
            
            // Remove typing indicator
            this.hideTypingIndicator();

            // Add agent response - check different response formats
            if (response && response.output) {
                this.addMessage(response.output, 'agent');
            } else if (response && response.text) {
                this.addMessage(response.text, 'agent');
            } else if (response && response.result) {
                this.addMessage(response.result, 'agent');
            } else if (response && response.message && response.message !== "Workflow was started") {
                this.addMessage(response.message, 'agent');
            } else if (response && response.error) {
                this.addMessage(`שגיאה: ${response.error}`, 'agent');
            } else {
                console.log('Full response:', response);
                this.addMessage('הבוט התחיל לעבוד! נסה לשלוח הודעה נוספת 🙂', 'agent');
            }
        } catch (error) {
            this.hideTypingIndicator();
            
            // Remove retry indicator if present
            const retryIndicator = document.getElementById('retryIndicator');
            if (retryIndicator) retryIndicator.remove();
            
            // Provide specific error messages based on error type
            if (error.message.includes('Network connectivity issue')) {
                this.addMessage('בעיה ברשת או חסימה מתוסף דפדפן. נסה לכבות תוספי פרטיות או רענן את הדף 🔄', 'agent');
                this.addDiagnosticMessage();
            } else if (error.message.includes('timed out')) {
                this.addMessage('החיבור לקח יותר מדי זמן. נסה שוב או בדוק את החיבור לאינטרנט ⏱️', 'agent');
            } else if (error.message.includes('404')) {
                this.addMessage('הצ\'אט כרגע לא פעיל. אנא פנה אלינו בדרך אחרת או נסה מאוחר יותר 🙏', 'agent');
            } else if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
                this.addMessage('השרת זמנית לא זמין. נסה שוב בעוד כמה רגעים 🔧', 'agent');
            } else if (error.message.includes('CORS')) {
                this.addMessage('בעיית אבטחה בדפדפן. אנא רענן את הדף ונסה שוב 🔄', 'agent');
            } else {
                this.addMessage('מצטער, יש בעיה טכנית. נסה שוב בעוד רגע 🙏', 'agent');
            }
        }

        // Re-enable input
        this.setInputState(true);
        const inputElement = document.getElementById('chatInput');
        if (inputElement) {
            inputElement.focus();
        }
    }

    async sendToN8n(message, files = []) {
        console.log('[Chat] sendToN8n called with message:', message);
        console.log('[Chat] Files count:', files.length);

        const payload = {
            chatInput: message,
            sessionId: this.sessionId,
            senderName: '', // Will be collected during conversation
            senderPhone: '', // Will be collected during conversation
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connectionStatus: this.connectionStatus,
            hasFiles: files.length > 0
        };

        console.log('[Chat] Payload:', payload);

        // Use proxy endpoint to avoid CORS issues
        const url = '/api/chat';
        console.log('[Chat] Sending to URL:', url);

        return await this.retryRequest(async () => {

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

            try {
                let response;

                if (files && files.length > 0) {
                    console.log('[Chat] Sending with files using FormData');
                    // Send with files using FormData
                    const formData = new FormData();
                    formData.append('chatInput', message || '');
                    formData.append('sessionId', this.sessionId);
                    formData.append('senderName', ''); 
                    formData.append('senderPhone', '');
                    formData.append('timestamp', new Date().toISOString());
                    formData.append('userAgent', navigator.userAgent);
                    formData.append('connectionStatus', this.connectionStatus);
                    formData.append('hasFiles', 'true');
                    
                    // Add files
                    files.forEach((file, index) => {
                        formData.append(`photo_${index}`, file);
                    });
                    
                    response = await fetch(url, {
                        method: 'POST',
                        body: formData,
                        signal: controller.signal,
                        mode: 'cors',
                        credentials: 'same-origin'
                    });
                } else {
                    console.log('[Chat] Sending text-only message');
                    // Send text-only message
                    response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest', // Help identify AJAX requests
                            'Cache-Control': 'no-cache'
                        },
                        body: JSON.stringify(payload),
                        signal: controller.signal,
                        // Additional fetch options to avoid extension interference
                        mode: 'cors',
                        credentials: 'same-origin'
                    });
                }

                clearTimeout(timeoutId);

                console.log('[Chat] Response status:', response.status, response.statusText);

                if (response.ok) {
                    const responseText = await response.text();
                    console.log('[Chat] Response text:', responseText);

                    if (!responseText.trim()) {
                        console.warn('[Chat] Empty response from webhook - treating as success');
                        this.connectionStatus = 'connected';
                        this.lastError = null;
                        return { status: 'success', message: 'הודעה נשלחה בהצלחה!' };
                    }

                    try {
                        const result = JSON.parse(responseText);
                        console.log('[Chat] Parsed response:', result);
                        this.connectionStatus = 'connected';
                        this.lastError = null;
                        return result;
                    } catch (e) {
                        console.error('[Chat] JSON parse error:', e);
                        console.log('[Chat] Treating as success with raw text');
                        this.connectionStatus = 'connected';
                        this.lastError = null;
                        return { status: 'success', message: responseText.substring(0, 200) };
                    }
                }
                
                const errorText = await response.text();
                this.connectionStatus = 'error';
                this.lastError = `HTTP ${response.status}: ${errorText}`;
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                
            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    this.connectionStatus = 'timeout';
                    this.lastError = 'Request timeout';
                    throw new Error('Request timed out - server may be overloaded');
                }
                
                // Check if it's a network error vs server error
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    this.connectionStatus = 'network_error';
                    this.lastError = error.message;
                    throw new Error('Network connectivity issue - check your connection or try disabling browser extensions');
                }
                
                this.connectionStatus = 'error';
                this.lastError = error.message;
                throw error;
            }
        });
    }

    addMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message agent-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    setInputState(enabled) {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        
        if (chatInput) {
            chatInput.disabled = !enabled;
        }
        if (sendButton) {
            sendButton.disabled = !enabled;
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 100);
    }

    // Retry mechanism with exponential backoff
    async retryRequest(requestFunction, attempt = 1) {
        try {
            return await requestFunction();
        } catch (error) {
            if (attempt < this.maxRetries) {
                const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                
                // Show retry indicator to user
                this.showRetryIndicator(attempt);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return await this.retryRequest(requestFunction, attempt + 1);
            }
            
            throw error;
        }
    }

    // Show retry attempt to user
    showRetryIndicator(attempt) {
        const retryDiv = document.getElementById('retryIndicator');
        if (retryDiv) {
            retryDiv.remove();
        }
        
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const newRetryDiv = document.createElement('div');
        newRetryDiv.id = 'retryIndicator';
        newRetryDiv.className = 'message system-message';
        newRetryDiv.innerHTML = `
            <div class="message-content retry-message">
                מנסה להתחבר שוב... (ניסיון ${attempt}/${this.maxRetries})
            </div>
        `;
        
        chatMessages.appendChild(newRetryDiv);
        this.scrollToBottom();
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (document.getElementById('retryIndicator')) {
                document.getElementById('retryIndicator').remove();
            }
        }, 3000);
    }

    // Connection diagnostics
    async testConnection() {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                timeout: 5000
            });
            
            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    // Get diagnostic information
    getDiagnosticInfo() {
        return {
            sessionId: this.sessionId,
            connectionStatus: this.connectionStatus,
            lastError: this.lastError,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            location: window.location.href,
            extensions: this.detectExtensions()
        };
    }

    // Detect potentially interfering browser extensions
    detectExtensions() {
        const extensions = [];
        
        // Common extension detection patterns
        if (window.uBlock || window.uBlockOrigin) extensions.push('uBlock Origin');
        if (window.adBlockController) extensions.push('AdBlock');
        if (window.ghostery) extensions.push('Ghostery');
        if (window.PrivacyBadger) extensions.push('Privacy Badger');
        if (document.querySelector('[data-extension]')) extensions.push('Generic Extension');
        
        // Check for modified fetch
        if (window.fetch.toString().includes('native code') === false) {
            extensions.push('Fetch Modified');
        }
        
        return extensions;
    }

    // Add diagnostic message for troubleshooting
    addDiagnosticMessage() {
        const diagnostics = this.getDiagnosticInfo();
        const extensions = diagnostics.extensions;
        
        if (extensions.length > 0) {
            this.addMessage(`זוהו תוספי דפדפן שעלולים לחסום: ${extensions.join(', ')}. נסה לכבות אותם זמנית.`, 'system');
        }
    }
}

// Initialize chat widget when DOM is loaded

function initializeChatWidget() {
    const widget = new ChatWidget();
    
    // Make widget globally accessible for debugging
    window.chatWidget = widget;
    
}

// Try multiple initialization methods
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatWidget);
} else {
    initializeChatWidget();
}

// Backup initialization after a short delay
setTimeout(() => {
    if (!window.chatWidget) {
        initializeChatWidget();
    }
}, 100);