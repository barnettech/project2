import os
import requests

from flask import Flask, jsonify, render_template, request, session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

votes = {"yes": 0, "no": 0, "maybe": 0}

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# list of chat rooms
channel_list = [['Lobby', 'test']]
# matrix of messages in each given chat room
chats_in_rooms = [['Lobby', 'Welcome!', 'To the lobby']]
# matrix of persons in each given chat room
persons_in_rooms = [['Lobby']]


votes = {"yes": 0, "no": 0, "maybe": 0}

@app.route("/")
def index():
    return(render_template("index.html", votes=votes, channel_list=channel_list, chats_in_rooms=chats_in_rooms))

@socketio.on("submit vote")
def vote(data):
    selection = data["selection"]
    votes[selection] += 1
    print(votes[selection])
    emit("vote totals", votes, broadcast=True)

@socketio.on("chat emit")
def chat(data):
    print(data)
    chattext = data["chattext"]
    print(chattext)
    chats_in_rooms[0].append(chattext.rstrip())
    print(chats_in_rooms)
    emit("chat emit", chattext, broadcast=True)

@socketio.on("add channel")
def addchannel(data):
    print('here I am');
    print(data)
    newchannel = data["newchannel"]
    channel_list[0].append(newchannel)
    print(channel_list)
    emit("new channel", newchannel, broadcast=True)