const socket = io("http://localhost:5000")
var boardObject = null
import { Board, CHARACTER_NAMES, Hallway} from "./board.js";

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

function sendChatMessage(msg) {
    console.log(msg);
    const chat = document.getElementById('chat');
    const message = document.createElement('div');
    message.textContent = msg;
    message.style.marginBottom = "6px";
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

socket.on('connect', startConnection)
socket.on('getId', startConnection);

socket.on('setId', function(id) {
    setCookie('socketId', id, 7)
});

socket.on('message', function(msg) {
    sendChatMessage(msg);
});

// data['character_index']: index of the player's character
// data['cards']: list of the cards we have
socket.on('start_game', function(data) {
    console.log("Moving to game.");
    window.location.href = 'game.html';
    boardObject = new Board(data['character_index'], data['cards'])

    document.getElementById("clue1").value = data['cards'][0]
    document.getElementById("clue2").value = data['cards'][1]
    document.getElementById("clue3").value = data['cards'][2]
    
    console.log(boardObject.numberPlayers) // Test
});

// data['isRoom']: 6 element boolean list, true if the character at the index is in a room | false if in a hallway.
// next 3, elements will be "" where otherwise inapplicable
// data['roomName']: 6 element string list, name of the room the character is in
// data['room1Name']: 6 element string list, name of the room1 of the hallway the character is in
// data['room2Name']: 6 element string list, name of the room2 of the hallway the character is in
socket.on('replicate', function(data) {
    console.log("Recieve replicate signal.");

    // Update character positions
    for (let i = 0; i < 6; i++) {
        let newPosition;
        if (data['isRoom'][i]) {
            newPosition = boardObject.rooms[data['roomName'][i]];
            if (boardObject.characters[i].position != newPosition) {
                sendChatMessage(CHARACTER_NAMES[i] + " moved to " + newPosition.name + ".");
                boardObject.characters[i].position = newPosition;
            }
        } else {
            newPosition = boardObject.getHallwayFromRoomNames(data['room1Name'][i], data['room2Name'][i]);
            if (boardObject.characters[i].position != newPosition) {
                sendChatMessage(CHARACTER_NAMES[i] + " moved to the hallway between " + data['room1Name'][i] + " and " + data['room2Name'][i] + ".");
                boardObject.characters[i].position = newPosition;
            }
        }
    }

    // Update movable positions
    let character = boardObject.getPlayingCharacter();
    let position = character.position;
    let movablePositions = [];
    if (position instanceof Room) {
        for (let hallway in boardObject.getHallwayAttachedToRoom(position)) {
            if (!hallway.occupied) {
                movablePositions.push(hallway);
            }
        }
        if (position.passage != null) {
            movablePositions.push(position.passage);
        }
    } else if (position instanceof Hallway) {
        movablePositions = position.rooms;
    } else {
        console.log("Error: position is not a hallway or room.");
    }

    const positionSelection = document.getElementById("selectPosition");
    positionSelection.options.length = 0;
    for (let position in movablePositions) {
        let text = "";
        let value = "";
        if (position instanceof Room) {
            text = position.name;
            value = "r," + position.name;
        } else if (position instanceof Hallway) {
            text = "Hallway between " + position.rooms[0] + " and " + position.rooms[1];
            value = "h," + position.rooms[0] + "," + + position.rooms[1];
        }
        const newOption = document.createElement("option");
        newOption.text = text;
        newOption.value = value;
        positionSelection.appendChild(newOption);
    }


    // Update UI (target increment)
});

function createLobby() {
    socket.emit('create lobby', {});
}

function joinLobby() {
    const input = document.getElementById('message');
    socket.emit('join lobby', {id:input.value});
    input.value = '';
}

function leaveLobby() {
    socket.emit('leave lobby', {});
}

function startLobby() {
    socket.emit('start lobby', {});
}

document.querySelector("#moveButton").addEventListener("click", move);
function move() {
    const input = document.getElementById('message');
    socket.emit('move', {info:input.value});
    input.value = '';
}

document.querySelector("#suggestButton").addEventListener("click", suggest);
function suggest() {
    const characterSelection = document.getElementById('selectCharacter');
    const weaponSelection = document.getElementById('selectWeapon');
    
    socket.emit('suggest', {
        weapon:weaponSelection.value,
        character:characterSelection.value
    });
}

document.querySelector("#accuseButton").addEventListener("click", accuse);
function accuse() {
    const characterSelection = document.getElementById('selectCharacter');
    const weaponSelection = document.getElementById('selectWeapon');
    const roomSelection = document.getElementById('selectRoom');

    socket.emit('accuse', {
        weapon:weaponSelection.value, 
        character:characterSelection.value,
        room:roomSelection.value
    });
}

document.querySelector("#disproveButton").addEventListener("click", reveal);
function reveal() {
    const cardName = document.getElementById('selectClue');
    socket.emit('disprove', {cardName:cardName.value});
    console.log(cardName.value);
}

document.querySelector("#endTurnButton").addEventListener("click", endTurn);
function endTurn() {
    console.log();
}

// For testing

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