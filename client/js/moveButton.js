import { boardObject } from './main.js';
import { Hallway, Room } from './board.js';
export let animatingElements = [];

function playAnimation() {
    if (animatingElements.length == 0) {
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
                animatingElements.push(roomButton);
            }
        }
    } else {
        for (let position of animatingElements) {
            position.style.animation = "none";
        }
        animatingElements = []
    }
}

document.querySelector("#moveButton").addEventListener("click", playAnimation);