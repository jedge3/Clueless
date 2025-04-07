import random

# Define classes for cards: suspects, weapons, and rooms
class Suspect:
    def __init__(self, name):
        self.name = name

class Weapon:
    def __init__(self, name):
        self.name = name

class Room:
    def __init__(self, name):
        self.name = name

# Create all the suspects, weapons, and rooms
suspects = [Suspect("Miss Scarlet"), Suspect("Professor Plum"), Suspect("Mrs. Peacock"),
            Suspect("Rev. Green"), Suspect("Colonel Mustard"), Suspect("Mrs. White")]

weapons = [Weapon("Candlestick"), Weapon("Dagger"), Weapon("Lead Pipe"),
           Weapon("Revolver"), Weapon("Rope"), Weapon("Wrench")]

rooms = [Room("Kitchen"), Room("Ballroom"), Room("Conservatory"),
         Room("Dining Room"), Room("Library"), Room("Billiard Room"),
         Room("Lounge"), Room("Hall"), Room("Study")]

# Game logic: Randomly select the solution
def select_solution():
    suspect = random.choice(suspects)
    weapon = random.choice(weapons)
    room = random.choice(rooms)
    return suspect, weapon, room

# Example of a suggestion being made
def make_suggestion(player, suspect, weapon, room):
    print(f"{player} suggests: {suspect.name} in the {room.name} with the {weapon.name}")
    # In a real game, you would check if someone has one of these cards to disprove the suggestion

# Example of player making an accusation
def make_accusation(player, suspect, weapon, room, solution):
    if (suspect == solution[0] and weapon == solution[1] and room == solution[2]):
        print(f"Correct accusation by {player}! The solution is {suspect.name}, {weapon.name}, {room.name}.")
        return True
    else:
        print(f"Incorrect accusation by {player}.")
        return False

# Initialize the game and select the solution
solution = select_solution()

# Players make suggestions
make_suggestion("Player1", suspects[0], weapons[0], rooms[0])
make_suggestion("Player2", suspects[1], weapons[1], rooms[1])

# Player makes an accusation
make_accusation("Player1", suspects[0], weapons[0], rooms[0], solution)
