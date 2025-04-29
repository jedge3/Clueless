import { ROOM_NAMES, WEAPON_NAMES, CHARACTER_NAMES } from './board.js';

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

// Load cards into popups.
for (let characterCardHolder of document.getElementsByClassName("character-card-holder")) {
    for (let characterName of CHARACTER_NAMES) {
        const card = newCard(characterName);
        characterCardHolder.appendChild(card);
    }
}

for (let roomCardHolder of document.getElementsByClassName("room-card-holder")) {
    for (let roomName of ROOM_NAMES) {
        const card = newCard(roomName);
        roomCardHolder.appendChild(card);
    }
}

for (let weaponCardHolder of document.getElementsByClassName("weapon-card-holder")) {
    for (let weaponName of WEAPON_NAMES) {
        const card = newCard(weaponName);
        weaponCardHolder.appendChild(card);
    }
}