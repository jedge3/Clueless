import random

ROOM_NAMES = ["Study", "Hall", "Lounge", "Library", "Billard Room", "Dining Room", "Conservatory", "Ball Room", "Kitchen"]
WEAPON_NAMES = ["Rope", "Lead Pipe", "Knife", "Wrench", "Candlestick", "Revolver"]
CHARACTER_NAMES = ["Col. Mustard", "Miss Scarlet", "Prof. Plum", "Mr. Green", "Mrs. White", "Mrs. Peacock"]
START_HALLWAYS = [4, 1, 2, 10, 11, 7]

class Character():
    def __init__(self, name, position):
        self.name = name
        self.position = position
        self.cards = []



class Room():
    def __init__(self, name):
        self.name = name
        self.hallways = []
        self.passageway = None # holds the room you will move to from the secret hallway



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
        self.rooms["Study"].passageway = self.rooms["Kitchen"]
        self.rooms["Kitchen"].passageway = self.rooms["Study"]
        self.rooms["Lounge"].passageway = self.rooms["Conservatory"]
        self.rooms["Conservatory"].passageway = self.rooms["Lounge"]

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
            self.characters[player_id] = Character(CHARACTER_NAMES[i], self.hallways[START_HALLWAYS[i]])

            # Correction: Players may have more or less than 3 cards. All remaining cards are dealt to each player after the murder cards are removed.
            # for i in range(3):
            #     card = random.choice(deck)
            #     deck.remove(card)
            #     self.characters[player_id].cards.append(card)


    def move(data):
        print("[Game Logic Subsystem]: Recieved board move request. Updating board state.")
        # data will contain data['position'] or data['direction'] depending on how we choose to implement it
        # check to see if the player can move to the position derived from the data
        # move the character object's position
        # update the hallway occupied tag
        # return true if successful | false otherwise
        pass


    def suggest(data):
        print("[Game Logic Subsystem]: Recieved suggestion request. Each player will decide which card to show the suggester, if they have one of the cards.")
        # data will contain strings data['weapon'] and data['character']. Check to make sure they are strings.
        # check to see if the suggestion is valid (suggestions should contain a character and weapon. The room will be whichever one the character occupies, so check to see 
        #   if the character is in a room and not a hallway)
        # go through the list of players and check if they have one of the cards in the suggestion
        # if they do, they will be given a choice of which card to show
        # return true if successful | false otherwise
        # note: this one might be hard to implement, so I'll probably handle this one.
        pass


    def accuse(data):
        print("[Game Logic Subsystem]: Recieved accusation request. If the accusation is correct, the game is over.")
        # data will contain strings data['room'], data['weapon'], and data['character']. Check to make sure they are strings.
        # check if the accusation if valid (accusations must have a character, weapon, and room)
        # check to see if the accusation matches the murder held in the game state
        # if it does, the game is over and the accuser wins.
        # otherwise, the accuser loses and is eliminated from the game (character removed from Board.characters dictionary).
        # return true if successful | false otherwise
        pass
