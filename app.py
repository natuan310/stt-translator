from flask import Flask, render_template, request, jsonify
import os
import json
from eng2jap import main as e2j_main
from eng2jap import translator as e2j_translator
from jap2eng import main as j2e_main
from zoomus import ZoomClient
import jwt
import hashlib
import hmac
import base64
import requests
from time import time

import http.client

conn = http.client.HTTPSConnection("api.zoom.us")
# jwt_token = '''eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6Ik4wUXVyZzdIUTNpeXlqZ2xjY2JvV1EiLCJleHAiOjE2MDQwNDkzNzUsImlhdCI6MTYwNDA0Mzk3OX0.DZK2QV1kq-s3WLsk3r5OhY5RiSOg6Pq6rgDzqfrQgso'''
# headers = {'authorization': "Bearer {jwt_token}"}

STATIC_DIR = os.path.join(os.getcwd(), 'static')
TEMPLATE_DIR = os.path.join(os.getcwd(), 'templates')


app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

# Zoom API-KEY: N0Qurg7HQ3iyyjglccboWQ
# Zoom API-SECRET-KEY: oyY7225Qoe0NaTtV9ZkVgWmqgl9fY8VTCPh4
api_key = 'N0Qurg7HQ3iyyjglccboWQ'
api_secret_key = 'oyY7225Qoe0NaTtV9ZkVgWmqgl9fY8VTCPh4'


def generateSignature(data):
    ts = int(round(time() * 1000)) - 30000
    msg = data['apiKey'] + str(data['meetingNumber']) + \
        str(ts) + str(data['role'])
    message = base64.b64encode(bytes(msg, 'utf-8'))
    # message = message.decode("utf-8")
    secret = bytes(data['apiSecret'], 'utf-8')
    hash = hmac.new(secret, message, hashlib.sha256)
    hash = base64.b64encode(hash.digest())
    hash = hash.decode("utf-8")
    tmpString = "%s.%s.%s.%s.%s" % (data['apiKey'], str(
        data['meetingNumber']), str(ts), str(data['role']), hash)
    signature = base64.b64encode(bytes(tmpString, "utf-8"))
    signature = signature.decode("utf-8")
    return signature.rstrip("=")

# create a function to generate a token using the pyjwt library
def generateToken():
    token = jwt.encode(
        # Create a payload of the token containing API Key & expirlsvirtualeation time
        {"iss": api_key, "exp": time() + 3600},
        # Secret used to generate token signature
        api_secret_key,
        # Specify the hashing alg
        algorithm='HS256'
        # Convert token to utf-8
    ).decode('utf-8')

    return token


data = {'apiKey': api_key,
        'apiSecret': api_secret_key,
        'meetingNumber': 888,
        'role': 0}

signature = generateSignature(data)
print(signature)

token = generateToken()

headers = {
    "Authorization": f"Bearer {token}"
}
print(headers)

client = ZoomClient(api_key, api_secret_key)

user_list_response = client.user.list()
user_list = json.loads(user_list_response.content)

for user in user_list['users']:
    print(user)
    user_id = user['id']  # P4Degq3hTMKiHgCK1EKUiw
    email = user['email']
    print(user_id, email)
    print(json.loads(client.meeting.list(user_id=user_id).content))


url = f"https://api.zoom.us/v2/users/{email}"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    conn.request("GET",
        f"/v2/users/{user_id}/meetings?page_size=30&type=live",
        headers=headers)

    res = conn.getresponse()
    meeting = res.read()

    print(meeting.decode("utf-8"))
    return render_template('index.html', result='START')


@app.route('/main/', methods=['POST'])
def main():
    cc_api = request.form.get('api')
    print(cc_api)
    return render_template('index.html', result='START')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
