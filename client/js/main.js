const socket = io("http://localhost:5000");
let boardObject = null;
import { Board, CHARACTER_NAMES, Hallway, Room} from "./board.js";

console.log("Started client!");

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
    setCookie('socketId', id, 7);
});

socket.on('message', function(msg) {
    sendChatMessage("[Server]: " + msg);
});

// data['characterIndex']: index of the player's character
// data['cards']: list of the cards we have
socket.on('redirect', function(data) {
    if (data['name'] == 'game'){
        window.location.href = 'game.html';
    }else if (data['name'] == 'index' || data['name'] == 'lobby') {
        window.location.href = 'index.html';
    }
});

// data['characterIndex']: The index of our character in the character list.
// data['cards']: The names of the cards we own.
// data['isRoom']: 6 element boolean list, true if the character at the index is in a room | false if in a hallway.
// next 3, elements will be "" where otherwise inapplicable
// data['roomName']: 6 element string list, name of the room the character is in
// data['room1Name']: 6 element string list, name of the room1 of the hallway the character is in
// data['room2Name']: 6 element string list, name of the room2 of the hallway the character is in
socket.on('replicate', function(data) {
    console.log("Replication request recieved.");
    console.log(data);
    // Update character index and cards
    if (data['characterIndex'] != null) {
        boardObject.characterIndex = data['characterIndex'];
        boardObject.knownCards = data['cards'];

        // Update character label
        const characterLabel = document.getElementById("characterLabel")
        characterLabel.textContent = "Your character is " + CHARACTER_NAMES[boardObject.characterIndex] + "."

        // Update card options
        const clueSelection = document.getElementById("selectClue");
        clueSelection.options.length = 0;
        for (let card of boardObject.knownCards) {
            const newOption = document.createElement("option");
            newOption.text = card;
            newOption.value = card;
            clueSelection.appendChild(newOption);
        }
    }
    
    // Update turn label
    const turnLabel = document.getElementById("turnLabel");
    if (data['turn'] == boardObject.characterIndex) {
        turnLabel.textContent = "It is your turn.";
    } else {
        turnLabel.textContent = "It is " + CHARACTER_NAMES[data['turn']] + "'s turn.";
    }

    // Update character positions
    for (let i = 0; i < 6; i++) {
        let newPosition;
        if (data['isRoom'][i]) {
            newPosition = boardObject.rooms[data['roomName'][i]];
            if (boardObject.characters[i].position != newPosition) {
                sendChatMessage("[Replication]: " + CHARACTER_NAMES[i] + " moved to " + newPosition.name + ".");
                boardObject.characters[i].position = newPosition;
            }
        } else {
            newPosition = boardObject.getHallwayFromRoomNames(data['room1Name'][i], data['room2Name'][i]);
            if (boardObject.characters[i].position != newPosition) {
                sendChatMessage("[Replication]: " + CHARACTER_NAMES[i] + " moved to the " + boardObject.getPositionName(newPosition) + ".");
                boardObject.characters[i].position = newPosition;
            }
        }
    }

    // Update position label
    const positionLabel = document.getElementById("positionLabel")
    positionLabel.textContent = "You are in the " + boardObject.getPositionName(boardObject.getPlayingCharacter().position) + "."

    // Update movable positions
    let character = boardObject.getPlayingCharacter();
    let position = character.position;
    let movablePositions = [];
    
    if (position instanceof Room) {
        for (let hallway of boardObject.getHallwaysAttachedToRoom(position)) {
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
    for (let position of movablePositions) {
        let text = "";
        let value = "";
        if (position instanceof Room) {
            if (position.name.split(" ")[2] == "Starting") {
                continue
            }
            text = position.name;
            value = "r," + position.name;
        } else if (position instanceof Hallway) {
            text = "Hallway between " + position.rooms[0].name + " and " + position.rooms[1].name;
            value = "h," + position.rooms[0].name + "," + position.rooms[1].name;
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

function move() {
    const input = document.getElementById('selectPosition');
    console.log(input.value);
    socket.emit('move', {position:input.value});
}

function suggest() {
    const characterSelection = document.getElementById('selectCharacter');
    const weaponSelection = document.getElementById('selectWeapon');
    
    socket.emit('suggest', {
        weapon:weaponSelection.value,
        character:characterSelection.value
    });
}

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

function reveal() {
    const cardElement = document.getElementById('selectClue');
    socket.emit('disprove', {card:cardElement.value});
}

function endTurn() {
    socket.emit('end_turn');
}


let fileName = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1];  // Path to the HTML file

if (fileName.split(".")[0] == "index") {
    console.log("Lobby buttons connected.");
    document.querySelector("#createButton").addEventListener("click", createLobby);
    document.querySelector("#joinButton").addEventListener("click", joinLobby);
    document.querySelector("#leaveButton").addEventListener("click", leaveLobby);
    document.querySelector("#startButton").addEventListener("click", startLobby);
    socket.emit('lobby_connection')
} else if (fileName.split(".")[0] == "game") {
    console.log("Game buttons connected.");
    boardObject = new Board()
    document.querySelector("#moveButton").addEventListener("click", move);
    document.querySelector("#suggestButton").addEventListener("click", suggest);
    document.querySelector("#accuseButton").addEventListener("click", accuse);
    document.querySelector("#disproveButton").addEventListener("click", reveal);
    document.querySelector("#endTurnButton").addEventListener("click", endTurn);
    socket.emit('game_connection')
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