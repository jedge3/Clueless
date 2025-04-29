import { boardObject } from './board.js';
import { Hallway, Room } from './board.js';
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

export function toggleAnimation() {
    if (moveAnimatingElements.length == 0) {
        if (!boardObject.isOurTurn()) {
            return
        }
        startMoveAnimation();
    } else {
        endMoveAnimation();
    }
}

export function openSuggestionPopup() {
    if (document.getElementById("suggestion-popup").style.display == "flex") {
        document.getElementById("suggestion-popup").style.display = "none";
    } else {
        document.getElementById("accusation-popup").style.display = "none";
        document.getElementById("disproof-popup").style.display = "none";
        document.getElementById("suggestion-popup").style.display = "flex";
    }
}

export function openAccusationPopup() { 
    if (document.getElementById("accusation-popup").style.display == "flex") {
        document.getElementById("accusation-popup").style.display = "none";
    } else {
        document.getElementById("suggestion-popup").style.display = "none";
        document.getElementById("disproof-popup").style.display = "none";
        document.getElementById("accusation-popup").style.display = "flex";
    }
}

export function openDisproofPopup() {
    if (document.getElementById("disproof-popup").style.display == "flex") {
        document.getElementById("disproof-popup").style.display = "none";
    } else {
        document.getElementById("suggestion-popup").style.display = "none";
        document.getElementById("accusation-popup").style.display = "none";
        document.getElementById("disproof-popup").style.display = "flex";
    }
}

function closeAllPopups() {
    document.getElementById("suggestion-popup").style.display = "none";
    document.getElementById("accusation-popup").style.display = "none";
    document.getElementById("disproof-popup").style.display = "none";
}

if (document.getElementsByClassName("close-button").length > 0) {
    for (let button of document.getElementsByClassName("close-button")) {
        button.addEventListener("click", closeAllPopups);
    }
}