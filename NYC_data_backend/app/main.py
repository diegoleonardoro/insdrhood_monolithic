
from flask import Flask, jsonify
import requests
import os
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv


load_dotenv()

baseUrl = os.environ.get("BASE_URL")



app = Flask(__name__)
CORS(app, resources={r"/311calls": {"origins": baseUrl}}, supports_credentials=True)

@app.route('/')
def hello_world():
    return 'Hello, Worls!'

@app.route('/311calls', methods=['GET'])
# @cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def calls311():
    # API URL with a limit to avoid fetching too much data at once (you might need to paginate or adjust this)
    # response = requests.get('https://data.cityofnewyork.us/resource/erm2-nwe9.json')
    # if response.status_code == 200:
    #     data = response.json()
    #     filtered_data = []

    #     for item in data:
    #         # Check if the created date is within May 2024
    #         created_date = item.get('created_date', '')
    #         if created_date.startswith('2024-05'):
    #             filtered_item = {
    #                 'Created Date': created_date,
    #                 'Agency': item.get('agency', 'Not specified'),
    #                 'Agency Name': item.get('agency_name', 'Not specified'),
    #                 'Complaint Type': item.get('complaint_type', 'Not specified'),
    #                 'Descriptor': item.get('descriptor', 'Not specified'),
    #                 'Location Type': item.get('location_type', 'Not specified'),
    #                 'Incident Zip': item.get('incident_zip', 'Not specified'),
    #                 'Incident Address': item.get('incident_address', 'Not specified'),
    #                 'Borough': item.get('borough', 'Not specified'),
    #                 'Location': item.get('location', {'latitude': 'Not specified', 'longitude': 'Not specified'})
    #             }
    #             filtered_data.append(filtered_item)

    #     return jsonify(filtered_data)  # Return the filtered data as JSON
    # else:
    #     return 'Failed to retrieve data', 500 
    return []
  


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google Cloud Run,
    # a webserver process such as Gunicorn will serve the app.
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))