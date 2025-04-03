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
        this.secret_pathway = null;
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
        for (let room of ROOM_NAMES) {
            this.rooms[room] = new Room(room);
        }
        this.rooms["Study"].secret_pathway = this.rooms["Kitchen"];
        this.rooms["Kitchen"].secret_pathway = this.rooms["Study"];
        this.rooms["Lounge"].secret_pathway = this.rooms["Conservatory"];
        this.rooms["Conservatory"].secret_pathway = this.rooms["Lounge"];

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

        this.characters = [];
        for (let i = 0; i < 6; i++) {
            this.characters.push(new Character(CHARACTER_NAMES[i], this.hallways[START_HALLWAYS[i]]));
        }
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
}