from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
from lobby import Lobby

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
    emit('getId')


@socketio.on('newId')
def new_id():
    session['id'] = str(uuid.uuid4())
    emit('setId', session['id'])


@socketio.on('setId')
def set_id(id):
    session['id'] = id


@socketio.on('disconnect')
def handle_disconnect():
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None:
        lobby.remove_player(sender_id)
        leave_room(lobby.get_id())
        emit('message', f'Player [{short(sender_id)}] has disconnected.', room=lobby.get_id())


@socketio.on('create lobby')
def create_lobby(data):
    print("Lobby creation request recieved.")
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
    print("Lobby join request recieved.")
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
            emit('message', "Successfully joined the lobby.")
            join_room(lobby_id)
            emit('message', f'Player [{short(sender_id)}] has joined the lobby.', room=lobby_id)
        else:
            emit('message', "Unable to join the lobby.")


@socketio.on('leave lobby')
def leave_lobby(data):
    print("Lobby leave request recieved.")
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
    print("Lobby start request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None:
        if lobby.is_owner(sender_id):
            success = lobby.start_game()
            if success:
                emit('message', "Starting game...", room=lobby.get_id())
                emit('start_game', {}, room=lobby.get_id())
            else:
                emit('message', "Not enough players to start.")
        else:
            emit('message', "Only the owner can start the game.")
    else:
        emit('message', "You are not in a lobby.")


# Unfinished game controls
@socketio.on('move')
def move(data):
    print("Game move request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None and lobby.get_board() is not None:
        print(2)
        socketio.emit('message', "Test")
        pass


@socketio.on('suggest')
def suggest(data):
    print("Game suggestion request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None and lobby.get_board() is not None:
        pass


@socketio.on('accuse')
def accuse(data):
    print("Game accusation request recieved.")
    sender_id = session.get('id')
    if sender_id is None:
        return
    
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None and lobby.get_board() is not None:
        pass


if __name__ == "__main__":
    socketio.run(app)
