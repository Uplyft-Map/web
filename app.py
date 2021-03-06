from flask import Flask, render_template, url_for, redirect, send_from_directory, jsonify, request
from flask_socketio import SocketIO, emit, send, ConnectionRefusedError
import sqlite3
import logging

from nlp.greenred import cool

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)
socketio = SocketIO(app)

conn = sqlite3.connect('database.db')
c = conn.cursor()
c.execute("SELECT count(name) FROM sqlite_master WHERE type='table' AND name='colleges'")
if c.fetchone()[0] != 1:
    raise ValueError("colleges table does not exist")

conn.close()

@app.route('/')
def main():
    return render_template("index.html")

@app.route('/getData', methods=['GET'])
def get_data():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    coll_resp = cursor.execute("SELECT name, size, lat, long, depression FROM colleges").fetchall()

    coll_list = []

    for college in coll_resp:
        top_words = cursor.execute("SELECT word FROM top_words INNER JOIN colleges s WHERE college_id = s.id AND name=?", (college[0], )).fetchall()

        d = {}
        d['name'] = college[0]
        d['size'] = college[1]
        d['coord'] = [-college[2], college[3]]
        d['depression'] = college[4]
        d['top_words'] = [i[0] for i in top_words]

        coll_list.append(d)

    conn.close()

    return jsonify(coll_list)

@app.route('/getConfessions/<college>/<number>', methods=['GET'])
def get_confessions(college, number):
    num_recent = int(number)

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    resp = cursor.execute("SELECT confession FROM confessions WHERE id IN (SELECT c.id FROM confessions c INNER JOIN colleges s WHERE college_id = s.id and name=? ORDER BY RANDOM() LIMIT ?)", (college, num_recent))

    confs = [conf[0] for conf in resp.fetchall()]
    confs = list(zip(confs, cool(confs)))
    print(confs)

    conn.close()

    return jsonify(confs)

@socketio.on('tx-msg', namespace='/uplyft-msg')
def start_audio_tx(msg_txt):
    emit('rx-msg', [msg_txt, request.sid], broadcast=True)

def run_sentiment(college):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    resp = cursor.execute("SELECT confession FROM confessions INNER JOIN colleges s WHERE college_id = s.id AND name=?", (college,))

    confs = [conf[0] for conf in resp.fetchall()]

    dep_score = get_dep_score(confs)

    cursor.execute("UPDATE colleges SET depression=? WHERE name=?", (college, dep_score))
    conn.commit()
    conn.close()


if __name__ == "__main__":
    app.debug = True
    socketio.run(app)
