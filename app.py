from flask import Flask, render_template, url_for, redirect, send_from_directory
import sqlite3
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

conn = sqlite3.connect('database.db')
c = conn.cursor()
c.execute("SELECT count(name) FROM sqlite_master WHERE type='table' AND name='colleges'")
if c.fetchone()[0] != 1:
    raise ValueError("colleges table does not exist")

conn.commit()
conn.close()

@app.route('/')
def main():
    return render_template("index.html")


if __name__ == "__main__":
    app.debug = True
    app.run()
