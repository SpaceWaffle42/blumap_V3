import nmap_scans as ns
from database import Database as db
from flask import Flask, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)

db.initial()


@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")


@app.route("/process_form", methods=["POST"])
def form():
    ip = request.form.get("ip-address", "127.0.0.1")

    sleeper = request.form.get("sleep-timer", "0")

    notation = request.form.get("notation", "0")

    top = request.form.get("top-scan", "false") == "true"

    auto = request.form.get("auto-scan", "false") == "true"

    ns.scan.scan(
        ip,
        notation,
        top,
        auto,
        sleeper,
    )
    return redirect(url_for("index"))

@app.route("/data")
def get_data():
    return jsonify(db.data())

@app.route("/summaryData")
def get_summary():
    return jsonify(db.summary())

if __name__ == "__main__":

    app.run(debug=True, host="0.0.0.0", port=5000)
