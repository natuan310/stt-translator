from flask import Flask, render_template, request, jsonify
import os
from eng2jap import main as e2j_main
from eng2jap import translator as e2j_translator
from jap2eng import main as j2e_main

STATIC_DIR = os.path.join(os.getcwd(), 'static')
TEMPLATE_DIR = os.path.join(os.getcwd(), 'templates')


app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/main/', methods=['POST'])
def main():
    cc_api = request.form.get('api')
    print(cc_api)
    return render_template('index.html', result = 'START')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
