import { ROOM_NAMES, WEAPON_NAMES, CHARACTER_NAMES } from './board.js';
export let characterSelection = null;
export let roomSelection = null;
export let weaponSelection = null;

export function removeCardSelection() {
    characterSelection = null;
    roomSelection = null;
    weaponSelection = null;
}

export function newCard(name) {
    let img = null;
    if (CHARACTER_NAMES.includes(name)) {
        img = "assets/images/characters/" + name.toLowerCase().replace(' ', '_').replace('.', '') + ".png";
    } else if (ROOM_NAMES.includes(name)) {
        img = "assets/images/rooms/" + name.toLowerCase().replace(' ', '_') + ".png";
    } else if (WEAPON_NAMES.includes(name)) {
        img = "assets/images/weapons/" + name.toLowerCase().replace(' ', '_') + ".png";
    }

    let button = document.createElement("button");
    button.className = "card";
    button.id = name;

    let container = document.createElement("div");
    container.className = "container"
    button.appendChild(container);

    let icon = document.createElement("img");
    icon.id = "icon";
    icon.src = img
    container.append(icon);

    let namelabel = document.createElement("div");
    namelabel.textContent = name;
    namelabel.id = "name";
    container.appendChild(namelabel);

    return button;
}

function handleSelect(card) {
    card.addEventListener("click", function() {
        const parent = card.parentNode;
        for (let child of parent.children) {
            if (child.className != "card") {
                continue;
            }
            child.style.animation = "none";
        }
        card.style.animation = "brightnessAnimation2 2s infinite";
        if (CHARACTER_NAMES.includes(card.id)) {
            characterSelection = card.id;
        } else if (ROOM_NAMES.includes(card.id)) {
            roomSelection = card.id;
        } else if (WEAPON_NAMES.includes(card.id)) {
            weaponSelection = card.id;
        } else {
            console.log("ERROR: Card is not a character, room, or weapon.")
        }
    })
}

// Load cards into popups.
for (let characterCardHolder of document.getElementsByClassName("character-card-holder")) {
    for (let characterName of CHARACTER_NAMES) {
        const card = newCard(characterName);
        characterCardHolder.appendChild(card);
        handleSelect(card);
    }
}

for (let roomCardHolder of document.getElementsByClassName("room-card-holder")) {
    for (let roomName of ROOM_NAMES) {
        const card = newCard(roomName);
        roomCardHolder.appendChild(card);
        handleSelect(card);
    }
}

for (let weaponCardHolder of document.getElementsByClassName("weapon-card-holder")) {
    for (let weaponName of WEAPON_NAMES) {
        const card = newCard(weaponName);
        weaponCardHolder.appendChild(card);
        handleSelect(card);
    }
}