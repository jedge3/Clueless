lobbies_created = 0

class Lobby(object):
    instances = []

    @classmethod
    def get_instances(cls):
        return cls.instances


    @classmethod
    def get_lobby_from_player(cls, player_id):
        for lobby in Lobby.get_instances():
            for id in lobby.get_players():
                if id == player_id:
                    return lobby
        return None
    
    
    @classmethod
    def get_lobby_by_id(cls, lobby_id):
        for lobby in Lobby.get_instances():
            if lobby.get_id() == lobby_id:
                return lobby
        return None



    def __init__(self, owner_id):
        self.owner_id = owner_id
        self.player_ids = [owner_id]
        Lobby.instances.append(self)
        global lobbies_created
        self.lobby_id = lobbies_created # want to make this an eight digit code in the future for security.
        lobbies_created += 1


    def add_player(self, player_id):
        if len(self.player_ids) < 6:
            self.player_ids.append(player_id)
            return True
        else:
            return False


    def remove_player(self, player_id):
        if player_id in self.player_ids:
            self.player_ids.remove(player_id)
            if len(self.player_ids) > 0:
                self.owner_id = self.player_ids[0]
            else:
                pass # remove the lobby


    def get_id(self):
        return self.lobby_id
    

    def get_players(self):
        return self.player_ids