export const ROOM_NAMES = ["Study", "Hall", "Lounge", "Library", "Billard Room", "Dining Room", "Conservatory", "Ball Room", "Kitchen"];
export const WEAPON_NAMES = ["Rope", "Lead Pipe", "Knife", "Wrench", "Candlestick", "Revolver"];
export const CHARACTER_NAMES = ["Col. Mustard", "Miss Scarlet", "Prof. Plum", "Mr. Green", "Mrs. White", "Mrs. Peacock"];
export const START_HALLWAYS = [4, 1, 2, 10, 11, 7];

export class Character {
    constructor(name, position) {
        this.name = name;
        this.position = position;
    }
}


export class Room {
    constructor(name) {
        this.name = name;
        this.hallways = [];
        this.passage = null;
    }
}


export class Hallway {
    constructor(room1, room2) {
        this.rooms = [room1, room2];
        room2.hallways.push(this);
        room1.hallways.push(this);
        this.occupied = false
    }
}


export class Board {
    constructor(characterIndex, knownCards) {
        this.characterIndex = characterIndex;
        this.knownCards = knownCards;

        this.rooms = {};
        for (let roomName of ROOM_NAMES) {
            this.rooms[roomName] = new Room(roomName);
        }
        for (let characterName in CHARACTER_NAMES) {
            let roomName = characterName + " Starting Room";
            this.rooms[roomName] = new Room(roomName);
        }
        this.rooms["Study"].passage = this.rooms["Kitchen"];
        this.rooms["Kitchen"].passage = this.rooms["Study"];
        this.rooms["Lounge"].passage = this.rooms["Conservatory"];
        this.rooms["Conservatory"].passage = this.rooms["Lounge"];

        this.hallways = [
            new Hallway(this.rooms["Study"], this.rooms["Hall"]),
            new Hallway(this.rooms["Hall"], this.rooms["Lounge"]),
            new Hallway(this.rooms["Study"], this.rooms["Library"]),
            new Hallway(this.rooms["Hall"], this.rooms["Billard Room"]),
            new Hallway(this.rooms["Lounge"], this.rooms["Dining Room"]),
            new Hallway(this.rooms["Library"], this.rooms["Billard Room"]),
            new Hallway(this.rooms["Billard Room"], this.rooms["Dining Room"]),
            new Hallway(this.rooms["Library"], this.rooms["Conservatory"]),
            new Hallway(this.rooms["Billard Room"], this.rooms["Ball Room"]),
            new Hallway(this.rooms["Dining Room"], this.rooms["Kitchen"]),
            new Hallway(this.rooms["Conservatory"], this.rooms["Ball Room"]),
            new Hallway(this.rooms["Ball Room"], this.rooms["Kitchen"]),
        ];

        for (let i = 0; i < 6; i++) {
            let hallwayIndex = START_HALLWAYS[i];
            let roomName = CHARACTER_NAMES[i] + " Starting Room";
            this.hallways[hallwayIndex].rooms.push(this.rooms[roomName]);
        }

        this.characters = [];
        for (let i = 0; i < 6; i++) {
            this.characters.push(new Character(CHARACTER_NAMES[i], this.rooms[CHARACTER_NAMES[i] + " Starting Room"]));
        }
    }

    getPlayingCharacter() {
        return this.characters[this.characterIndex];
    }

    getHallwayFromRoomNames(room1Name, room2Name) {
        for (let hallway in this.hallways) {
            if (hallway.rooms.includes(room1Name) && hallway.rooms.includes(room2Name)) {
                return hallway;
            }
        }
        return null;
    }

    getHallwayFromRooms(room1, room2) {
        return this.getHallwayFromRoomNames(room1.Name, room2.Name);
    }

    getHallwaysAttachedToRoom(room) {
        attached_hallways = []
        for (let hallway in this.hallways) {
            if (hallway.rooms.includes(room.Name)) {
                attached_hallways.push(hallway);
            }
        }
        return attached_hallways;
    }
}