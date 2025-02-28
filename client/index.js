const socket = io("http://localhost:5000")
console.log("Started client!")

socket.on('connect', function() {
    console.log('Connected to server!');
});

socket.on('message', function(msg) {
    console.log(msg)
    const chat = document.getElementById('chat');
    const message = document.createElement('div');
    message.textContent = msg;
    message.style.marginBottom = "6px";
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
});

function createLobby() {
    socket.emit('create lobby', {})
}

function joinLobby() {
    const input = document.getElementById('message');
    socket.emit('join lobby', {id:input.value})
    input.value = '';
}

function leaveLobby() {
    socket.emit('leave lobby', {})
}