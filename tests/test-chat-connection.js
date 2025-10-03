// Simple connection test script for the chat widget
// Run this in browser console to test connection

async function testChatConnection() {
    console.log('Testing chat widget connection...');
    
    // Test health endpoint
    try {
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch('/api/health');
        if (healthResponse.ok) {
            const health = await healthResponse.json();
            console.log('✅ Health check passed:', health);
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
    }

    // Test chat endpoint
    try {
        console.log('2. Testing chat endpoint...');
        const chatResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                chatInput: 'test message',
                sessionId: 'test_' + Date.now(),
                senderName: 'Test User',
                senderPhone: '',
                timestamp: new Date().toISOString()
            })
        });
        
        if (chatResponse.ok) {
            const result = await chatResponse.text();
            console.log('✅ Chat endpoint accessible:', result.substring(0, 200));
        } else {
            console.log('❌ Chat endpoint failed:', chatResponse.status, await chatResponse.text());
        }
    } catch (error) {
        console.log('❌ Chat endpoint error:', error.message);
        
        // Detect extension interference
        if (error.message.includes('Failed to fetch')) {
            console.log('🔍 Potential browser extension interference detected');
            console.log('Extensions that might interfere:');
            
            if (window.uBlock || window.uBlockOrigin) console.log('- uBlock Origin');
            if (window.adBlockController) console.log('- AdBlock');
            if (window.ghostery) console.log('- Ghostery'); 
            if (window.PrivacyBadger) console.log('- Privacy Badger');
            if (window.fetch.toString().includes('native code') === false) {
                console.log('- Fetch function has been modified by an extension');
            }
        }
    }

    // Test n8n direct connection (will likely fail due to CORS, but shows if n8n is up)
    try {
        console.log('3. Testing n8n direct connection (expected to fail due to CORS)...');
        const n8nResponse = await fetch('http://localhost:5678/webhook/tattoo-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
        });
        console.log('Direct n8n response:', n8nResponse.status);
    } catch (error) {
        if (error.message.includes('CORS')) {
            console.log('✅ n8n is running (CORS error expected)');
        } else {
            console.log('❌ n8n connection issue:', error.message);
        }
    }
    
    console.log('Connection test completed.');
}

// Auto-run if pasted in console
if (typeof window !== 'undefined' && window.location) {
    testChatConnection();
}