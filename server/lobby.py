class Lobby(object):
    instances = []

    @classmethod
    def get_instances(cls):
        return cls.instances

    @classmethod
    def player_in_lobby(cls, player_id):
        for lobby in Lobby.get_instances():
            for id in lobby.get_players():
                if id == player_id:
                    return True
        return False
    
    
    @classmethod
    def get_lobby_by_id(cls, lobby_id):
        for lobby in Lobby.get_instances():
            if lobby.get_id() == lobby_id:
                return lobby
        return None


    def __init__(self, owner_id):
        self.owner_id = owner_id
        self.players_ids = [owner_id]
        Lobby.instances.append(self)
        self.lobby_id = len(Lobby.get_instances())


    def add_player(self, player_id):
        if len(self.players_ids) < 6:
            self.players_ids.append(player_id)
            return True
        else:
            return False


    def get_id(self):
        return self.lobby_id
    

    def get_players(self):
        return self.players_ids