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

    
    def move_to(self, position):
        if isinstance(self.position, Hallway):
            self.position.occupied = False
        if isinstance(position, Hallway):
            position.occupied = True
        self.position = position




class Room():
    def __init__(self, name):
        self.name = name
        self.hallways = []
        self.passageway = None # holds the room you will move to from the secret hallway



class Hallway():
    def __init__(self, room1, room2):
        self.rooms = [room1, room2]
        self.occupied = False
        room1.hallways.append(self)
        room2.hallways.append(self)

    
    def add_room(self, room):
        self.rooms.append(room)
        room.hallways.append(self)



class Card():
    def __init__(self, name):
        self.name = name
        if name in ROOM_NAMES:
            self.type = "room"
        elif name in WEAPON_NAMES:
            self.type = "weapon"
        elif name in CHARACTER_NAMES:
            self.type = "character"
        else:
            raise Exception("Invalid card name.")



class Board():
    def __init__(self, lobby):
        print("[Game Logic Subsystem]: Board created and state initialized.")
        global ROOM_NAMES
        global WEAPON_NAMES
        global CHARACTER_NAMES
        global START_HALLWAYS

        self.id = lobby.get_id()
        self.player_list = lobby.get_players()
        self.turn = 0 # this will index player_list
        self.disprove_turn = 0 # this will index player_list
        self.eliminated = [False] * len(self.player_list)

        # Rooms
        self.rooms = {}
        for room in ROOM_NAMES:
            self.rooms[room] = Room(room)
        self.rooms["Study"].passageway = self.rooms["Kitchen"]
        self.rooms["Kitchen"].passageway = self.rooms["Study"]
        self.rooms["Lounge"].passageway = self.rooms["Conservatory"]
        self.rooms["Conservatory"].passageway = self.rooms["Lounge"]

        # Hallways
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

        # Characters
        self.characters = [] # format: [player's id]:[character class]
        for i, name in enumerate(CHARACTER_NAMES):
            starting_room = Room(name + " Starting Room")
            self.hallways[START_HALLWAYS[i]].add_room(starting_room)
            self.characters.append(Character(name, starting_room))

        # Deck setup
        card_names = ROOM_NAMES + WEAPON_NAMES + CHARACTER_NAMES
        deck = []


        self.murder_room = Card(random.choice(ROOM_NAMES))
        self.murder_weapon = Card(random.choice(WEAPON_NAMES))
        self.murder_character = Card(random.choice(CHARACTER_NAMES))
        for name in card_names:
            if name not in [self.murder_character.name, self.murder_character.name, self.murder_weapon.name]:
                deck.append(Card(name))

        player_index = -1
        while len(deck) > 0:
            player_index +=1
            if player_index == len(self.player_list):
                player_index = 0
            character = self.characters[player_index]

            card_choice = random.choice(deck)
            character.cards.append(card_choice)
            deck.remove(card_choice)


    def get_hallway_from_rooms(self, room1, room2):
        for hallway in self.hallways:
            if room1 in hallway.rooms and room2 in hallway.rooms:
                return hallway
        return None


    def get_character_from_playerid(self, id):
        index = self.player_list.index(id)
        return self.characters[index]
        

    def is_turn(self, player_id):
        return self.player_list.index(player_id) == self.turn


    def end_turn(self):
        for i in range(len(self.player_list)):
            self.turn += 1
            self.turn = self.turn % len(self.player_list)

            if not self.eliminated[self.turn]:
                break
            elif i == len(self.player_list):
                winning_player_id = self.player_list[self.turn]
                # This player won


    def move(self, data):
        print("[Game Logic Subsystem]: Recieved board move request. Updating board state.")
        character = self.get_character_from_playerid(data['player_id'])
        pos_split = str.split(data['position'], ",")

        if pos_split[0] == "r": # Moving to a room
            room = self.rooms.get(pos_split[1])
            if isinstance(character.position, Hallway) and room in character.position.rooms:
                character.move_to(room)
            elif room == character.position.passageway:
                character.move_to(room)
            else:
                print("An error has occured")
                return False
        elif pos_split[0] == "h": # Moving to a hallway
            room1 = self.rooms.get(pos_split[1])
            room2 = self.rooms.get(pos_split[2])
            hallway = self.get_hallway_from_rooms(room1, room2)
            if not hallway.occupied and isinstance(character.position, Room) and character.position in hallway.rooms:
                character.move_to(hallway)
            else:
                print("An error has occured")
                return False
        else:
            print("An error has occured")
            return False

        self.end_turn()
        return True

        # data will contain data['position'] or data['direction'] depending on how we choose to implement it
        # check to see if the player can move to the position derived from the data
        # move the character object's position
        # update the hallway occupied tag
        # return true if successful | false otherwise
        pass


    def suggest(self, data):
        print("[Game Logic Subsystem]: Recieved suggestion request. Each player will decide which card to show the suggester, if they have one of the cards.")
        # data will contain strings data['weapon'] and data['character']. Check to make sure they are strings.
        # check to see if the suggestion is valid (suggestions should contain a character and weapon. The room will be whichever one the character occupies, so check to see 
        #   if the character is in a room and not a hallway)
        # go through the list of players and check if they have one of the cards in the suggestion
        # if they do, they will be given a choice of which card to show
        # return true if successful | false otherwise
        # note: this one might be hard to implement, so I'll probably handle this one.
        pass


    def accuse(self, data):
        print("[Game Logic Subsystem]: Recieved accusation request. If the accusation is correct, the game is over.")
        # data will contain strings data['room'], data['weapon'], and data['character']. Check to make sure they are strings.
        # check if the accusation if valid (accusations must have a character, weapon, and room)
        # check to see if the accusation matches the murder held in the game state
        # if it does, the game is over and the accuser wins.
        # otherwise, the accuser loses and is eliminated from the game (player is added to an eliminated player list).
        # return true if successful | false otherwise
        pass


    def disprove(self, data):
        pass


    def get_replicate_data(self, player_id):
        # turn game state into replicable data
        character = self.get_character_from_playerid(player_id)
        data = {}
        data['isRoom'] = [False] * 6
        data['roomName'] = [""] * 6
        data['room1Name'] = [""] * 6
        data['room2Name'] = [""] * 6
        for i, character in enumerate(self.characters):
            if isinstance(character.position, Room):
                data['isRoom'][i] = True
                data['roomName'][i] = character.position.name
            elif isinstance(character.position, Hallway):
                data['room1Name'][i] = character.position.rooms[0].name
                data['room2Name'][i] = character.position.rooms[1].name

        data['characterIndex'] = self.player_list.index(player_id)
        data['cards'] = []
        for card in character.cards:
            data['cards'].append(card.name)

        # send game state data to the client
        return data