import { socket } from "./socketConnection.js"
export let fileName = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1].split(".")[0];  // Path to the HTML file
import { boardObject, CHARACTER_NAMES, Hallway, Room} from "./board.js";
import { moveAnimatingElements, endMoveAnimation, closeAllPopups } from "./actionButtons.js";
import { newCard, characterSelection, roomSelection, weaponSelection, handleSelect } from "./card.js";
import { sendChatMessage } from "./chat.js";

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

socket.on('connect', startConnection)
socket.on('getId', startConnection);

socket.on('setId', function(id) {
    setCookie('socketId', id, 7);
});

socket.on('redirect', function(data) {
    if (data['name'] == 'game' && document.title == "Clue-less - Lobby"){
        window.location.href = 'game.html';
    }else if ((data['name'] == 'index' || data['name'] == 'lobby') && document.title == "Clue-less - Game") {
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

    // Update board index values
    boardObject.characterIndex = data['characterIndex'];
    boardObject.knownCards = data['cards'];
    boardObject.suggesting = data['suggesting'];
    boardObject.disproofTurn = data['disproofTurn'];
    boardObject.turn = data['turn'];

    // Update character positions
    for (let i = 0; i < 6; i++) {
        let newPosition;
        if (data['isRoom'][i]) {
            newPosition = boardObject.rooms[data['roomName'][i]];
            if (boardObject.characters[i].position != newPosition) {
                // sendChatMessage("[Replication]: " + CHARACTER_NAMES[i] + " moved to " + newPosition.name + ".");
                boardObject.characters[i].position = newPosition;
            }
        } else {
            newPosition = boardObject.getHallwayFromRoomNames(data['room1Name'][i], data['room2Name'][i]);
            if (boardObject.characters[i].position != newPosition) {
                // sendChatMessage("[Replication]: " + CHARACTER_NAMES[i] + " moved to the " + boardObject.getPositionName(newPosition) + ".");
                boardObject.characters[i].position = newPosition;
            }
        }
    }

    // Update character label
    const characterLabel = document.getElementById("characterLabel");
    characterLabel.textContent = "Your character is " + CHARACTER_NAMES[boardObject.characterIndex] + ".";
    const characterImageLabel = document.getElementById("characterImageLabel");
    characterImageLabel.src = document.getElementById(CHARACTER_NAMES[boardObject.characterIndex]).src;
    
    // Update character's cards
    const cardHolder = document.getElementById("card-holder");
    if (cardHolder.value != data['cards'].length + data['obtainedCards'].length) {
        cardHolder.value = data['cards'].length + data['obtainedCards'].length;
        cardHolder.innerHTML = "";

        // Dealt cards
        for (let cardName of boardObject.knownCards) {
            const card = newCard(cardName);
            cardHolder.appendChild(card);
        }

        // Obtained cards
        for (let cardName of data['obtainedCards']) {
            const card = newCard(cardName);
            cardHolder.appendChild(card);
            card.style.filter = "brightness(0.5)";
            card.style.opacity = 0.8;
        }
    }

    // Update turn
    const turnLabel = document.getElementById("turnLabel");
    if (boardObject.isOurTurn()) {
        turnLabel.textContent = "It is your turn.";
    } else {
        turnLabel.textContent = "It is " + CHARACTER_NAMES[data['turn']] + "'s turn.";
    }

    // Update disproof turn
    const disproofTurnLabel = document.getElementById("disproofTurnLabel");
    if (!boardObject.suggesting) {
        disproofTurnLabel.textContent = "It is noone's turn to disprove."
    } else if (boardObject.isOurTurnDisproof()) {
        disproofTurnLabel.textContent = "It is your turn to disprove.";
    } else {
        disproofTurnLabel.textContent = "It is " + CHARACTER_NAMES[boardObject.disproofTurn] + "'s turn to disprove.";
    }

    // Update disproof popup cards
    const suggestionCardHolder = document.getElementById("suggestion-card-holder");
    if (!boardObject.suggesting) {
        suggestionCardHolder.innerHTML = "";
    } else {
        if (suggestionCardHolder.innerHTML == "") {
            for (let cardName of data['suggestionCards']) {
                const card = newCard(cardName);
                suggestionCardHolder.appendChild(card);
                handleSelect(card);
            }
            const noCard = newCard("None");
            suggestionCardHolder.appendChild(noCard);
            handleSelect(noCard);
        }
    }

    // Move characters on board
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
                break;
            }
        } else {
            if (position instanceof Hallway) {
                if (position.rooms[0].name + "," + position.rooms[1].name == value || position.rooms[1].name + "," + position.rooms[0].name == value) {
                    value = "h," + value;
                    canEmit = true;
                    break;
                }
            }
        }
    }

    if (canEmit) {
        endMoveAnimation();
        socket.emit('move', {position:value});
    }
}

function endTurn() {
    endMoveAnimation();
    socket.emit('end_turn');
}

if (document.title == "Clue-less - Lobby") {
    console.log("Lobby buttons connected.");
    document.querySelector("#createButton").addEventListener("click", createLobby);
    document.querySelector("#joinButton").addEventListener("click", joinLobby);
    document.querySelector("#leaveButton").addEventListener("click", leaveLobby);
    document.querySelector("#startButton").addEventListener("click", startLobby);
    socket.emit('lobby_connection')
} else if (document.title == "Clue-less - Game") {
    console.log("Game buttons connected.");
    document.querySelector("#endTurnButton").addEventListener("click", endTurn);

    // Moving
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

    // Suggestion, Disproof, Accusation
    for (let submitButton of document.getElementsByClassName("submit-button")) {
        submitButton.addEventListener("click", function() {
            const parent = submitButton.parentNode;
            if (parent.id == "suggestion-popup") {
                if (characterSelection != null && weaponSelection != null) {
                    socket.emit('suggest', {
                        weapon:weaponSelection,
                        character:characterSelection
                    });
                } else {
                    sendChatMessage("Error: Character or Weapon is null.");
                }
            } else if (parent.id == "accusation-popup") {
                if (characterSelection != null && roomSelection != null && weaponSelection != null) {
                    socket.emit('accuse', {
                        character:characterSelection,
                        room:roomSelection,
                        weapon:weaponSelection
                    });
                } else {
                    sendChatMessage("Error: Character, Room, or Weapon is null.");
                }
            } else if (parent.id == "disproof-popup") {
                const disproofCardName = document.getElementById("suggestion-card-holder").value;
                if (disproofCardName == "No selection") {
                    sendChatMessage("No card selected.");
                } else if (!boardObject.knownCards.includes(disproofCardName)) {
                    sendChatMessage("You do not own that card.");
                } else {
                    socket.emit('disprove', {card:disproofCardName});
                }
            } else {
                console.log("ERROR: Submit button not a member of a valid popup.");
            }
            closeAllPopups();
        })
    }
    
    socket.emit('game_connection');
}

// Repeated Replication Requests
async function RRR() {
    while (true) {
        socket.emit('requestReplication');
        await sleep(2000);
    }
}
RRR();