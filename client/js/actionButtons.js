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