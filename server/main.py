from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
from lobby import Lobby
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = "themagnificent6_clueless"
socketio = SocketIO(app, cors_allowed_origins="*")


def short(id):
    return id[0:8]


@app.route('/../client')
def index():
    return render_template("index.html")


@socketio.on('connect')
def handle_connect():
    session['true_id'] = str(uuid.uuid4())
    emit('getId')


@socketio.on('newId')
def new_id():
    session['id'] = str(uuid.uuid4())
    emit('setId', session['id'])


@socketio.on('setId')
def set_id(id):
    session['id'] = id


@socketio.on('create lobby')
def create_lobby(data):
    print("[Server Networking Subsystem] Lobby creation request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    if Lobby.get_lobby_from_player(sender_id) is not None:
        emit('message', "Already in a lobby.")
        return
    else:
        lobby = Lobby(sender_id)
        join_room(lobby.get_id())
        emit('message', f'Created lobby. [id={str(lobby.get_id())}]')


@socketio.on('join lobby')
def join_lobby(data):
    print("[Server Networking Subsystem] Lobby join request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    if Lobby.get_lobby_from_player(sender_id) is not None:
        emit('message', "Already in a lobby.")
        return
    else:
        lobby_id = 0
        try:
            lobby_id = int(data['id'])
            lobby = Lobby.get_lobby_by_id(int(lobby_id))
            assert(lobby is not None)
        except:
            emit('message', f'There is no lobby with the id {str(lobby_id)}.')
            return
        success = lobby.add_player(sender_id)
        if success:
            emit('message', f'Player [{short(sender_id)}] has joined the lobby.', room=lobby_id)
            join_room(lobby_id)
            emit('message', "Successfully joined the lobby.")
        else:
            emit('message', "Unable to join the lobby.")


@socketio.on('leave lobby')
def leave_lobby(data):
    print("[Server Networking Subsystem] Lobby leave request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None:
        lobby.remove_player(sender_id)
        leave_room(lobby.get_id())
        emit('message', "Successfully left the lobby.")
        emit('message', f'Player [{short(sender_id)}] has left the lobby.', room=lobby.get_id())
    else:
        emit('message', "You are not in a lobby.")


@socketio.on('start lobby')
def start_lobby(data):
    print("[Server Networking Subsystem] Lobby start request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None:
        if lobby.is_owner(sender_id):
            if len(lobby.get_players()) >= 2:
                lobby.start_game()
                board = lobby.get_board()
                cards = board.get_character_from_playerid(sender_id).cards
                for i, card in enumerate(cards):
                    cards[i] = card
                emit('message', "Starting game...", room=lobby.get_id())
                emit('redirect', {'name':'game'}, room=lobby.get_id())
            else:
                emit('message', "Not enough players to start.")
        else:
            emit('message', "Only the owner can start the game.")
    else:
        emit('message', "You are not in a lobby.")


# Unfinished game controls
@socketio.on('move')
def move(data):
    print("[Server Networking Subsystem] Game move request recieved.")
    sender_id = session.get('id')
    data['player_id'] = sender_id
    if sender_id is None:
        return
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is None:
        socketio.emit('message', "You are not currently in a lobby.")
    else:
        board = lobby.get_board()
        if board is not None:
            if board.is_turn(sender_id):
                success = board.move(data)
                if success:
                    print("replicating game state")
                    socketio.emit('replicate', board.get_replicate_data(None), room=lobby.get_id())
                else:
                    emit('message', "An error occured.")
            else:
                emit('message', "It is not your turn.")
        else:
            socketio.emit('message', "You are not currently in a game.")
        


@socketio.on('suggest')
def suggest(data):
    print("[Server Networking Subsystem] Game suggestion request recieved.")
    sender_id = session.get('id')
    data['player_id'] = sender_id
    if sender_id is None:
        return
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is None:
        socketio.emit('message', "You are not currently in a lobby.")
    else:
        board = lobby.get_board()
        if board is not None:
            if board.is_turn(sender_id):
                success = board.suggest(data)

                if success:
                    player_character = board.get_character_from_playerid(sender_id)
                    room = player_character.position.name
                    weapon = data['weapon']
                    character = data['character']
                    board.suggester = request.sid
                    emit('message', f'{player_character.name} suggests {room}, {weapon}, {character}.', room=lobby.get_id())
                    time.sleep(1)
                    socketio.emit('replicate', board.get_replicate_data(None), room=lobby.get_id())
                else:
                    emit('message', "Invalid suggestion.")
            else:
                emit('message', "It is not your turn.")
        else:
            socketio.emit('message', "You are not currently in a game.")


@socketio.on('accuse')
def accuse(data):
    print("[Server Networking Subsystem] Game accusation request recieved.")
    sender_id = session.get('id')
    data['player_id'] = sender_id
    if sender_id is None:
        return
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is None:
        socketio.emit('message', "You are not currently in a lobby.")
    else:
        board = lobby.get_board()
        if board is not None:
            if board.is_turn(sender_id):
                success = board.accuse(data)
                character = board.get_character_from_playerid(sender_id)
                if success == True:
                    emit('message', f"{character.name} has successfully accused the murderer. Game over.", room=lobby.get_id())
                    emit('message', "Correct accusation. You have won!")
                    emit('replicate', board.get_replicate_data(None), room=lobby.get_id())
                    lobby.end_game()
                    time.sleep(5)

                    emit('redirect', {'name':'lobby'}, room=lobby.get_id())
                elif success == False:
                    emit('message', "Incorrect accusation. You have been eliminated.")
                    emit('message', f"{character.name} has been eliminated by a false accusation.", room=lobby.get_id())
                else:
                    emit('message', "Cannot accuse at this time.")
            else:
                emit('message', "It is not your turn.")
        else:
            socketio.emit('message', "You are not currently in a game.")

        
@socketio.on('disprove')
def disprove(data):
    print("[Server Networking Subsystem] Game disproof request recieved.")
    sender_id = session.get('id')
    data['player_id'] = sender_id
    if sender_id is None:
        return
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is None:
        socketio.emit('message', "You are not currently in a lobby.")
    else:
        board = lobby.get_board()
        if board is not None:
            if board.is_disproof_turn(sender_id):
                able_disprove = board.is_able_disprove(sender_id)
                if data['card'] in [board.suggested_room, board.suggested_weapon, board.suggested_character] or not able_disprove:
                    success = board.disprove(data)
                    character = board.get_character_from_playerid(sender_id)
                    if success:
                        emit('message', f"{character.name} was able to disprove the suggestion.", room=lobby.get_id())
                        socketio.emit('message', f'You have recieved the card {data['card']}.', to=board.suggester)
                        emit('replicate', board.get_replicate_data(None), room=lobby.get_id())
                    else:
                        if board.suggesting:
                            emit('message', f"{character.name} was unable to disprove the suggestion.", room=lobby.get_id())
                        else:
                            emit('message', "Noone was able to disprove the suggestion.", room=lobby.get_id())
                else:
                    emit('message', "That is not a valid disproof.")
            else:
                emit('message', "It is not your turn.")
        else:
            socketio.emit('message', "You are not currently in a game.")


@socketio.on('end_turn')
def end_turn():
    print("[Server Networking Subsystem] Game end turn request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is None:
        socketio.emit('message', "You are not currently in a lobby.")
    else:
        board = lobby.get_board()
        if board is not None:
            if board.is_turn(sender_id):
                success = board.end_turn()
                character = board.get_character_from_playerid(sender_id)
                if success:
                    emit('message', f'Player {character.name} has ended their turn.', room=lobby.get_id())
                    socketio.emit('replicate', board.get_replicate_data(None), room=lobby.get_id())
                else:
                    emit('message', "Unable to end your turn at this moment.")
            else:
                socketio.emit('message', "It is not your turn.",  to=request.sid)
        else:
            socketio.emit('message', "You are not currently in a game.")

    
@socketio.on('game_connection')
def game_connect():
    print("[Server Networking Subsystem] Game connection request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is None:
        emit('message', "You are not currently in a lobby.")
        emit('redirect', {'name':'lobby'})
    else:
        board = lobby.get_board()
        if board is not None:
            time.sleep(0.1)
            emit('replicate', board.get_replicate_data(sender_id))
        else:
            emit('message', "You are not currently in a game.")


@socketio.on('lobby_connection')
def lobby_connection():
    print("[Server Networking Subsystem] Lobby connection request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None:
        board = lobby.get_board()
        if board is not None:
            time.sleep(0.1)
            emit('redirect', {'name':'game'})


if __name__ == "__main__":
    socketio.run(app)
