from board import Board
import uuid


def get_unique_id():
    while True:
        id = uuid.uuid4().hex[:4]
        if Lobby.get_instances().get(id) is not None:
            continue
        else:
            return id



class Lobby():
    instances = {}

    @classmethod
    def get_instances(cls):
        return cls.instances


    @classmethod
    def add_instance(cls, instance):
        cls.instances[instance.get_id()] = instance


    @classmethod
    def get_lobby_from_player(cls, player_id):
        for lobby in Lobby.get_instances().values():
            for id in lobby.get_players():
                if id == player_id:
                    return lobby
        return None
    
    
    @classmethod
    def get_lobby_by_id(cls, lobby_id):
        return cls.instances.get(lobby_id)


    def __init__(self, owner_id):
        print("[Game Logic Subsystem]: Lobby created.")
        self.owner_id = owner_id
        self.player_ids = [owner_id]
        self.lobby_id = get_unique_id()

        self.board = None

        Lobby.add_instance(self)


    def add_player(self, player_id):
        print("[Game Logic Subsystem]: Added player to lobby.")
        if len(self.player_ids) < 6 or self.Board is not None:
            self.player_ids.append(player_id)
            return True
        else:
            return False


    def remove_player(self, player_id):
        print("[Game Logic Subsystem]: Removed player from lobby.")
        if player_id in self.player_ids:
            self.player_ids.remove(player_id)
            if len(self.player_ids) > 0:
                self.owner_id = self.player_ids[0]
            else:
                pass # remove the lobby


    def start_game(self):
        print("[Game Logic Subsystem]: Starting game request received.")
        if len(self.get_players()) > 1:
            self.board = Board(self)
            return True
        return False


    def end_game(self):
        self.board = None


    def is_owner(self, player_id):
        return self.owner_id == player_id


    def get_id(self):
        return self.lobby_id
    

    def get_players(self):
        return self.player_ids
    
    
    def get_board(self):
        return self.board