import nmap_scans as ns
from threading import Thread
from database import Database as db
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    jsonify
    )

app = Flask(__name__)

db.initial()

@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route("/process_form", methods=["POST"])
def form():
    ip = request.form["ip-address"]
    scan_mode = request.form["scan-mode"]

    try:
        sleeper = request.form["sleep-timer"]
    except:
        sleeper = "0"

    try:
        notation = request.form["notation"]
    except:
        notation = "0"

    try:
        top = request.form["top-scan"]
    except:
        top = False

    try:
        auto = request.form["auto-scan"]
    except:
        auto = False

@app.route("/data")
def get_data():
    print(db.data())   

    return jsonify(db.data())

if __name__ == "__main__":
    auto_thread = Thread(target=ns.scan.scan)
    auto_thread.daemon = True
    auto_thread.start()
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)