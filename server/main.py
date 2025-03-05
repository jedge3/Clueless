from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
from lobby import Lobby


app = Flask(__name__)
app.config['SECRET_KEY'] = "themagnificent6_clueless"
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route('/../client')
def index():
    return render_template("index.html")


@socketio.on('connect')
def handle_connect():
    session['id'] = str(uuid.uuid4())


@socketio.on('disconnect')
def handle_disconnect():
    sender_id = session['id']
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None:
        lobby.remove_player(sender_id)
        leave_room(lobby.get_id())
        emit('message', f'Player [{sender_id}] has disconnected.', room=lobby.get_id())


@socketio.on('create lobby')
def create_lobby(data):
    sender_id = session['id']
    if Lobby.get_lobby_from_player(sender_id) is not None:
        emit('message', "Already in a lobby.")
        return
    else:
        lobby = Lobby(sender_id)
        join_room(lobby.get_id())
        emit('message', f'Created lobby. [id={str(lobby.get_id())}]')


@socketio.on('join lobby')
def join_lobby(data):
    sender_id = session['id']
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
            emit('message', f'Player [{str(sender_id)}] has joined the lobby.', room=lobby_id)
        else:
            emit('message', "Unable to join the lobby.")


@socketio.on('leave lobby')
def leave_lobby(data):
    sender_id = session['id']
    lobby = Lobby.get_lobby_from_player(sender_id)
    if lobby is not None:
        lobby.remove_player(sender_id)
        leave_room(lobby.get_id())
        emit('message', f'Successfully left the lobby.')
        emit('message', f'Player [{sender_id}] has left the lobby.', room=lobby.get_id())
    else:
        emit('message', f'You are not in a lobby.')


if __name__ == "__main__":
    socketio.run(app)