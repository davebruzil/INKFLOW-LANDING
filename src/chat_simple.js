// SIMPLE WORKING CHAT WITH FILE UPLOADS
function setupSimpleChat() {
    // Get elements
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const photoButton = document.getElementById('photoButton');
    const photoInput = document.getElementById('photoInput');
    
    // Create persistent session ID for this conversation
    const sessionId = 'session_' + Date.now();
    
    // Store selected files
    let selectedFiles = [];
    
    // Flag to prevent duplicate greetings
    let greetingSent = false;
    
    // Send initial greeting to get the conversation started
    setTimeout(() => {
        if (!greetingSent) {
            sendInitialGreeting();
            greetingSent = true;
        }
    }, 500);
    
    // Send initial greeting function
    function sendInitialGreeting() {
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatInput: 'היי',  // Simple greeting to trigger AI response
                sessionId: sessionId
            })
        })
        .then(response => response.json())
        .then(data => {
            // Only show the AI's response, not the user's "היי"
            handleResponse(data);
        })
        .catch(error => {
            console.log('Initial greeting failed:', error);
            // Add fallback greeting if server fails
            const botDiv = document.createElement('div');
            botDiv.className = 'message agent-message';
            botDiv.innerHTML = `<div class="message-content">היי! איך אפשר לעזור? יש לך רעיון לקעקוע או שתרצה להתחיל מייעוץ עם המקעקעת? 😊</div>`;
            chatMessages.appendChild(botDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
    
    // Send message function
    function sendMessage() {
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        const hasFiles = selectedFiles.length > 0;
        
        if (!message && !hasFiles) return;
        
        // Add user message to chat
        if (message) {
            const userDiv = document.createElement('div');
            userDiv.className = 'message user-message';
            userDiv.innerHTML = `<div class="message-content">${message}</div>`;
            chatMessages.appendChild(userDiv);
        }
        
        // Add photos to chat if any
        if (hasFiles) {
            addPhotosToChat(selectedFiles);
        }
        
        // Clear input and files
        chatInput.value = '';
        clearSelectedFiles();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Send to server
        if (hasFiles) {
            // Send with files using FormData
            const formData = new FormData();
            formData.append('chatInput', message || '');
            formData.append('sessionId', sessionId);
            formData.append('senderName', '');
            formData.append('senderPhone', '');
            formData.append('timestamp', new Date().toISOString());
            formData.append('hasFiles', 'true');
            
            // Add files
            selectedFiles.forEach((file, index) => {
                formData.append(`photo_${index}`, file);
            });
            
            fetch('/api/chat', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(handleResponse)
            .catch(handleError);
            
        } else {
            // Send text-only message
            fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatInput: message,
                    sessionId: sessionId
                })
            })
            .then(response => response.json())
            .then(handleResponse)
            .catch(handleError);
        }
    }
    
    // Handle server response
    function handleResponse(data) {
        const botDiv = document.createElement('div');
        botDiv.className = 'message agent-message';
        
        // Use actual n8n response or fallback
        let responseText = 'מקבל את ההודעה...';
        if (data && data.output) {
            responseText = data.output;
        } else if (data && data.text) {
            responseText = data.text;
        } else if (data && data.result) {
            responseText = data.result;
        } else if (data && data.message && data.message !== "Workflow was started") {
            responseText = data.message;
        }
        
        botDiv.innerHTML = `<div class="message-content">${responseText}</div>`;
        chatMessages.appendChild(botDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Handle errors
    function handleError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message agent-message';
        errorDiv.innerHTML = `<div class="message-content">שגיאה בשליחה, נסה שוב</div>`;
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add photos to chat display
    function addPhotosToChat(files) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content photos-message';
        
        files.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            img.className = 'chat-photo';
            img.style.maxWidth = '200px';
            img.style.maxHeight = '200px';
            img.style.margin = '5px';
            img.style.borderRadius = '8px';
            img.onclick = () => showPhotoModal(img.src, file.name);
            contentDiv.appendChild(img);
        });
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
    }
    
    // Show photo modal
    function showPhotoModal(src, filename) {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        modal.onclick = () => modal.remove();
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = filename;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 8px;
        `;
        img.onclick = (e) => e.stopPropagation();
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.8);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => modal.remove();
        
        modal.appendChild(img);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
    }
    
    // Show selected files preview
    function showSelectedFiles() {
        // Remove existing preview
        const existingPreview = document.getElementById('photoPreview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        if (selectedFiles.length === 0) return;
        
        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.id = 'photoPreview';
        previewContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 8px;
            margin-bottom: 10px;
        `;
        
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.style.cssText = `
                position: relative;
                display: inline-block;
            `;
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            img.style.cssText = `
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 6px;
                border: 2px solid #ddd;
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '✕';
            removeBtn.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ff4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                cursor: pointer;
                line-height: 1;
            `;
            removeBtn.onclick = () => removeFile(index);
            
            const fileName = document.createElement('div');
            fileName.textContent = file.name.length > 12 ? file.name.substring(0, 9) + '...' : file.name;
            fileName.style.cssText = `
                font-size: 11px;
                text-align: center;
                margin-top: 4px;
                color: #666;
            `;
            
            fileItem.appendChild(img);
            fileItem.appendChild(removeBtn);
            fileItem.appendChild(fileName);
            previewContainer.appendChild(fileItem);
        });
        
        // Insert preview above input container
        const chatInputContainer = document.querySelector('.chat-input-container');
        chatInputContainer.parentNode.insertBefore(previewContainer, chatInputContainer);
    }
    
    // Remove file from selection
    function removeFile(index) {
        selectedFiles.splice(index, 1);
        showSelectedFiles();
    }
    
    // Clear selected files
    function clearSelectedFiles() {
        selectedFiles = [];
        const preview = document.getElementById('photoPreview');
        if (preview) {
            preview.remove();
        }
    }
    
    // Handle file selection
    function handleFileSelect(event) {
        const files = Array.from(event.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        // Add new files to existing selection
        selectedFiles = selectedFiles.concat(imageFiles);
        
        // Limit to max 5 files
        if (selectedFiles.length > 5) {
            selectedFiles = selectedFiles.slice(-5);
        }
        
        showSelectedFiles();
        
        // Clear the file input so same file can be selected again
        event.target.value = '';
    }
    
    // Send button click
    if (sendButton) {
        sendButton.onclick = sendMessage;
    }
    
    // Enter key press
    if (chatInput) {
        chatInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };
    }
    
    // Photo attachment
    if (photoButton && photoInput) {
        photoButton.onclick = function() {
            photoInput.click();
        };
        
        photoInput.onchange = handleFileSelect;
        photoInput.multiple = true; // Allow multiple file selection
        photoInput.accept = 'image/*'; // Only accept images
    }
}

// Flag to prevent multiple initializations
let chatInitialized = false;

// Initialize chat function with duplicate prevention
function initializeChat() {
    if (chatInitialized) return;
    chatInitialized = true;
    setupSimpleChat();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
} else {
    initializeChat();
}

// Backup initialization (only if not already initialized)
setTimeout(() => {
    if (!chatInitialized) {
        initializeChat();
    }
}, 100);