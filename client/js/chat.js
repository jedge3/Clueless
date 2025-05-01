import { socket } from "./socketConnection.js";
let localMessageHistory = [];

socket.on('replicate', function(msg) {
    
});

export function sendChatMessage(msg) {
    console.log(msg);
    const chat = document.getElementById('chat');
    const message = document.createElement('div');
    message.textContent = msg;
    message.style.marginBottom = "6px";
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

socket.on('messageHistory', function(history) {
    for (let i in history) {
        const message = history[i];
        if (localMessageHistory.length <= i || localMessageHistory[i] != message) {
            sendChatMessage(message);
        }
    }
    localMessageHistory = history;
})

socket.on('message', function(msg) {
    sendChatMessage(msg);
})

document.getElementById("chatSendMessage").addEventListener("click", function() {
    const chatMessage = document.getElementById("chatMessage");
    socket.emit('sendMessage', chatMessage.value);
})

let list = ["apple", "banana", "cherry"];
let stringToRemove = "banana";
