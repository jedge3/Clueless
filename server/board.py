import random

ROOM_NAMES = ["Study", "Hall", "Lounge", "Library", "Billard Room", "Dining Room", "Conservatory", "Ball Room", "Kitchen"]
WEAPON_NAMES = ["Rope", "Lead Pipe", "Knife", "Wrench", "Candlestick", "Revolver"]
CHARACTER_NAMES = ["Col. Mustard", "Miss Scarlet", "Prof. Plum", "Mr. Green", "Mrs. White", "Mrs. Peacock"]
START_HALLWAYS = [4, 1, 2, 10, 11, 7]

class Character():
    def __init__(self, name):
        self.name = name
        self.position = None
        self.cards = []



class Room():
    def __init__(self, name):
        self.name = name
        self.hallways = []
        self.secret_pathway = None # holds the room you will move to from the secret hallway



class Hallway():
    def __init__(self, room1, room2):
        self.rooms = (room1, room2)
        self.occupied = False
        room1.hallways.append(self)
        room2.hallways.append(self)



class Board():
    def __init__(self, lobby):
        print("[Game Logic Subsystem]: Board created and state initialized.")
        global ROOM_NAMES
        global WEAPON_NAMES
        global CHARACTER_NAMES
        global START_HALLWAYS

        self.player_list = lobby.get_players()
        self.turn = 0 # this will index player_list
        self.murder_room = random.choice(ROOM_NAMES)
        self.murder_weapon = random.choice(WEAPON_NAMES)
        self.murder_character = random.choice(CHARACTER_NAMES)

        self.rooms = {}
        for room in ROOM_NAMES:
            self.rooms[room] = Room(room)
        self.rooms["Study"].secret_pathway = self.rooms["Kitchen"]
        self.rooms["Kitchen"].secret_pathway = self.rooms["Study"]
        self.rooms["Lounge"].secret_pathway = self.rooms["Conservatory"]
        self.rooms["Conservatory"].secret_pathway = self.rooms["Lounge"]

        self.hallways = [
            Hallway(self.rooms["Study"], self.rooms["Hall"]),
            Hallway(self.rooms["Hall"], self.rooms["Lounge"]),
            Hallway(self.rooms["Study"], self.rooms["Library"]),
            Hallway(self.rooms["Hall"], self.rooms["Billard Room"]),
            Hallway(self.rooms["Lounge"], self.rooms["Dining Room"]),
            Hallway(self.rooms["Library"], self.rooms["Billard Room"]),
            Hallway(self.rooms["Billard Room"], self.rooms["Dining Room"]),
            Hallway(self.rooms["Library"], self.rooms["Conservatory"]),
            Hallway(self.rooms["Billard Room"], self.rooms["Ball Room"]),
            Hallway(self.rooms["Dining Room"], self.rooms["Kitchen"]),
            Hallway(self.rooms["Conservatory"], self.rooms["Ball Room"]),
            Hallway(self.rooms["Ball Room"], self.rooms["Kitchen"]),
        ]

        self.characters = {} # format: [player's id]:[character class]
        deck = ROOM_NAMES + WEAPON_NAMES + CHARACTER_NAMES
        deck.remove(self.murder_room)
        deck.remove(self.murder_weapon)
        deck.remove(self.murder_character)
        for i, player_id in enumerate(self.player_list):
            self.characters[player_id] = Character(CHARACTER_NAMES[i])
            self.characters[player_id].position = self.hallways[START_HALLWAYS[i]]

            for i in range(3):
                card = random.choice(deck)
                deck.remove(card)
                self.characters[player_id].cards.append(card)


    def move(data):
        print("[Game Logic Subsystem]: Recieved board move request. Updating board state.")
        # check to see if the player can move to the position (position should be derived from data['position'] or data['direction'] depending on how we choose to implement it)
        # move the character object's position
        # 
        pass


    def suggest(data):
        print("[Game Logic Subsystem]: Recieved suggestion request. Each player will decide which card to show the suggester, if they have one of the cards.")
        pass


    def accuse(data):
        print("[Game Logic Subsystem]: Recieved accusation request. If the accusation is correct, the game is over.")
        pass
