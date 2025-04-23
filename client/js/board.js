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

    addRoom(room) {
        this.rooms.push(room);
        room.hallways.push(this)
    }
}


export class Board {
    constructor() {
        this.characterIndex = -1;
        this.knownCards = [];
        this.turn = 0;

        this.rooms = {};
        for (let roomName of ROOM_NAMES) {
            this.rooms[roomName] = new Room(roomName);
        }
        for (let i = 0; i < 6; i++) {
            let roomName = CHARACTER_NAMES[i] + " Starting Room";
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
            this.hallways[hallwayIndex].addRoom(this.rooms[roomName])
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
        let room1 = this.rooms[room1Name];
        let room2 = this.rooms[room2Name];
        return this.getHallwayFromRooms(room1, room2);
    }

    getHallwayFromRooms(room1, room2) {
        for (let hallway of this.hallways) {
            if (hallway.rooms.includes(room1) && hallway.rooms.includes(room2)) {
                return hallway;
            }
        }
        return null;
    }
    
    getHallwaysAttachedToRoom(room) {
        let attached_hallways = []
        for (let hallway of this.hallways) {
            if (hallway.rooms.includes(room.Name)) {
                console.log(hallway.rooms)
                attached_hallways.push(hallway);
            } else if (room.hallways.includes(hallway)) {
                attached_hallways.push(hallway);
            }
        }
        return attached_hallways;
    }
    
    getPositionName(position) {
        console.log(position)
        if (position instanceof Room) {
            return position.name;
        } else if (position instanceof Hallway) {
            return "hallway between " + position.rooms[0].name + " and " + position.rooms[1].name;
        } else {
            return "[undefined position]";
        }
    }

    getMovablePositions() {
        let character = this.getPlayingCharacter();
        if (character == null) {
            return [];
        }
        let position = character.position;
        let movablePositions = [];
        
        if (position instanceof Room) {
            for (let hallway of this.getHallwaysAttachedToRoom(position)) {
                if (!hallway.occupied) {
                    movablePositions.push(hallway);
                }
            }
            if (position.passage != null) {
                movablePositions.push(position.passage);
            }
        } else if (position instanceof Hallway) {
            movablePositions = position.rooms;
        } else {
            console.log("Error: position is not a hallway or room.");
        }
        return movablePositions;
    }

    isOurTurn() {
        return this.characterIndex == this.turn;
    }
}