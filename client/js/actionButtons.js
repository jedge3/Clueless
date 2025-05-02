import { boardObject } from './board.js';
import { Hallway, Room } from './board.js';
import { removeCardSelection } from './card.js';
export let moveAnimatingElements = [];

function startMoveAnimation() {
    for (let position of boardObject.getMovablePositions()) {
        let id = "";
        if (position instanceof Hallway) {
            id = position.rooms[0].name + "," + position.rooms[1].name;
        } else if (position instanceof Room) {
            id = position.name;
        } else {
            console.log("Very bad error!");
            return;
        }

        const roomButton = document.getElementById(id);
        if (roomButton == null) {
            console.log("There is no element with id [" + id + "].");
        } else {
            roomButton.style.animation = "brightnessAnimation 2s infinite";
            moveAnimatingElements.push(roomButton);
        }
    }
}

export function endMoveAnimation() {
    for (let position of moveAnimatingElements) {
        position.style.animation = "none";
    }
    moveAnimatingElements = []
}

function toggleAnimation() {
    if (moveAnimatingElements.length == 0) {
        if (!boardObject.isOurTurn()) {
            return
        }
        startMoveAnimation();
    } else {
        endMoveAnimation();
    }
}

function openSuggestionPopup() {
    if (document.getElementById("suggestion-popup").style.display == "flex") {
        closeAllPopups();
    } else {
        closeAllPopups();
        if (boardObject.isOurTurn()) {
            document.getElementById("suggestion-popup").style.display = "flex";
        }
    }
}

function openAccusationPopup() { 
    if (document.getElementById("accusation-popup").style.display == "flex") {
        closeAllPopups();
    } else {
        closeAllPopups();
        if (boardObject.isOurTurn()) {
            document.getElementById("accusation-popup").style.display = "flex";
        }
    }
}

function openDisproofPopup() {
    if (document.getElementById("disproof-popup").style.display == "flex") {
        closeAllPopups();
    } else {
        closeAllPopups();
        document.getElementById("disproof-popup").style.display = "flex";
    }
}

function openInformationPopup() {
    if (document.getElementById("information-popup").style.display == "inline") {
        closeAllPopups();
    } else {
        closeAllPopups();
        document.getElementById("information-popup").style.display = "inline";
    }
}

export function closeAllPopups() {
    removeCardSelection();
    document.getElementById("suggestion-popup").style.display = "none";
    document.getElementById("accusation-popup").style.display = "none";
    document.getElementById("disproof-popup").style.display = "none";
    document.getElementById("information-popup").style.display = "none";
}

if (document.title == "Clue-less - Game") {
    document.querySelector("#moveButton").addEventListener("click", toggleAnimation);
    document.querySelector("#suggestButton").addEventListener("click", openSuggestionPopup);
    document.querySelector("#accuseButton").addEventListener("click", openAccusationPopup);
    document.querySelector("#disproveButton").addEventListener("click", openDisproofPopup);
    document.querySelector("#infoButton").addEventListener("click", openInformationPopup);
    for (let button of document.getElementsByClassName("close-button")) {
        button.addEventListener("click", closeAllPopups);
    }
}

