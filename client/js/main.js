const socket = io("http://localhost:5000")
console.log("Started client!")

function setCookie(name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
}
  
function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function startConnection() {
    const id = getCookie('socketId');
    if (id) {
        socket.emit('setId', id);
    } else {
        socket.emit('newId');
    }
}

socket.on('connect', startConnection)
socket.on('getId', startConnection);

socket.on('setId', function(id) {
    setCookie('socketId', id, 7)
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

// data['number_players']
// data['character_index']: index of the player's character
// data['cards']: list of the cards we have
socket.on('start_game', function(data) {
    console.log("Moving to game.")
    window.location.href = 'game.html';
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

function startLobby() {
    socket.emit('start lobby', {})
}

function move() {
    const input = document.getElementById('message');
    socket.emit('move', {info:input.value})
    input.value = '';
}

function suggest() {
    const input = document.getElementById('message');
    socket.emit('suggest', {info:input.value})
    input.value = '';
}

function accuse() {
    const input = document.getElementById('message');
    socket.emit('accuse', {info:input.value})
    input.value = '';
}


// For my testing

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function test() {
//     while (true) {
//         const id = getCookie('socketId');
//         console.log(id);
//         await sleep(2000);
//     }
// }

// test();