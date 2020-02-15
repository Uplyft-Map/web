from flask import Flask, render_template, url_for, redirect, send_from_directory

app = Flask(__name__)


@app.route('/')
def main():
    return render_template("index.html")

@app.route('/templates/<path:path>')
def send_static_files(path):
    return send_from_directory('templates', path)

@app.route('/bar')
def barGraph():
    return render_template("bar.html")


if __name__ == "__main__":
    app.debug = True
    app.run()
