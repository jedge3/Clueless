const socket = io("http://localhost:5000");
export let fileName = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1].split(".")[0];  // Path to the HTML file
import { boardObject, Board, CHARACTER_NAMES, Hallway, Room} from "./board.js";
import { moveAnimatingElements, endMoveAnimation, toggleAnimation } from "./moveButton.js";

console.log("Started client!");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
        const characterLabel = document.getElementById("characterLabel");
        characterLabel.textContent = "Your character is " + CHARACTER_NAMES[boardObject.characterIndex] + ".";
        const characterImageLabel = document.getElementById("characterImageLabel");
        characterImageLabel.src = document.getElementById(CHARACTER_NAMES[boardObject.characterIndex]).src;

        // Update card options
        // const clueSelection = document.getElementById("selectClue");
        // clueSelection.options.length = 0;
        // for (let card of boardObject.knownCards) {
        //     const newOption = document.createElement("option");
        //     newOption.text = card;
        //     newOption.value = card;
        //     clueSelection.appendChild(newOption);
        // }
    }
    
    // Update turn
    boardObject.turn = data['turn'];
    const turnLabel = document.getElementById("turnLabel");
    if (boardObject.isOurTurn()) {
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

    // Update UI (target increment)
    for (let i = 0; i < 6; i++) {
        let character = boardObject.characters[i];
        let characterDiv = document.getElementById(character.name);
        let positionButton = null
        if (character.position instanceof Room) {
            for (let roomButton of document.getElementsByClassName("rooms")) {
                if (roomButton.id == character.position.name) {
                    positionButton = roomButton;
                }
            }
        } else if (character.position instanceof Hallway) {
            for (let hallwayButton of document.getElementsByClassName("hallways")) {
                if (hallwayButton.id == character.position.rooms[0].name + "," + character.position.rooms[1].name || hallwayButton.id == character.position.rooms[1].name + "," + character.position.rooms[0].name) {
                    positionButton = hallwayButton;
                }
            }
        }
        if (positionButton != null) {
            for (let child of positionButton.children) {
                if (child.className == "character-holder") {
                    child.appendChild(characterDiv);
                }
            }
        }
    }

});

function createLobby() {
    socket.emit('create lobby', {});
}

function joinLobby() {
    const input = document.getElementById('lobby-id');
    socket.emit('join lobby', {id:input.value});
    input.value = '';
}

function leaveLobby() {
    socket.emit('leave lobby', {});
}

function startLobby() {
    socket.emit('start lobby', {});
}

function move(value) {
    if (moveAnimatingElements.length == 0) {
        return;
    }

    let canEmit = false;
    for (let position of boardObject.getMovablePositions()) {
        if (position instanceof Room) {
            if (position.name == value) {
                value = "r," + value;
                canEmit = true;
                break
            }
        } else {
            if (position instanceof Hallway) {
                if (position.rooms[0].name + "," + position.rooms[1].name == value || position.rooms[1].name + "," + position.rooms[0].name) {
                    value = "h," + value;
                    canEmit = true;
                    break
                }
            }
        }
    }
    if (canEmit) {
        endMoveAnimation();
        socket.emit('move', {position:value});
    }
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

if (fileName == "index") {
    console.log("Lobby buttons connected.");
    document.querySelector("#createButton").addEventListener("click", createLobby);
    document.querySelector("#joinButton").addEventListener("click", joinLobby);
    document.querySelector("#leaveButton").addEventListener("click", leaveLobby);
    document.querySelector("#startButton").addEventListener("click", startLobby);
    socket.emit('lobby_connection')
} else if (fileName == "game") {
    console.log("Game buttons connected.");
    document.querySelector("#moveButton").addEventListener("click", toggleAnimation);
    document.querySelector("#suggestButton").addEventListener("click", suggest);
    document.querySelector("#accuseButton").addEventListener("click", accuse);
    document.querySelector("#disproveButton").addEventListener("click", reveal);
    document.querySelector("#endTurnButton").addEventListener("click", endTurn);


    // Rooms and Hallways Click Functions
    for (let roomButton of document.getElementsByClassName("rooms")) {
        roomButton.addEventListener("click", function() {
            move(roomButton.id);
        })
    }

    for (let hallwayButton of document.getElementsByClassName("hallways")) {
        hallwayButton.addEventListener("click", function() {
            move(hallwayButton.id);
        })
    }

    // Repeated Replication Requests
    async function RRR() {
        while (true) {
            socket.emit('requestReplication');
            await sleep(2000);
        }
    }
    RRR();

    socket.emit('game_connection');
}