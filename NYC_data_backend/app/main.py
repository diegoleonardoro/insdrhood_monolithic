
from flask import Flask, jsonify, request
import requests
import os
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
from redis import Redis
from apscheduler.schedulers.background import BackgroundScheduler
import json
from pytz import utc
import gzip


load_dotenv()

app = Flask(__name__)
base_url = os.environ.get("BASE_URL", "http://localhost:3000")
print ('base urlll', base_url);


CORS(app, resources={r"/311calls": {"origins": [base_url, "https://www.insiderhood.com"]}}, supports_credentials=True)

# Use environment variables for Redis host and port
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 6379))
redis = Redis(host=redis_host, port=redis_port, db=0, decode_responses=False)  


scheduler = BackgroundScheduler(timezone=utc)
scheduler.start()

def compress_data(data):
    # Ensure data is a JSON string and then compress
    if not isinstance(data, bytes):
        data = json.dumps(data).encode('utf-8')
    return gzip.compress(data)

def decompress_data(data):
    # Check if data needs decompression
    try:
        # Attempt to decompress and decode
        return json.loads(gzip.decompress(data).decode('utf-8'))
    except (OSError, gzip.BadGzipFile):
        # Handle cases where data is not compressed
        # This should be logged and investigated
        print("Data was not in compressed format, attempting to load as JSON")
        return json.loads(data.decode('utf-8') if isinstance(data, bytes) else data)

# filter the data based on the parameters coming from the client
def filter_data(data, filters):
    filtered_data = []
    for item in data:
        if (not filters['zip'] or item['Incident Zip'] == filters['zip']) and \
           (not filters['borough'] or item['Borough'].lower() == filters['borough'].lower()) and \
           (not filters['agency'] or item['Agency'].lower() == filters['agency'].lower()) and \
           (not filters['createdDate'] or item['Created Date'].startswith(filters['createdDate'])):
            filtered_data.append(item)
    return filtered_data

# Background task to fetch data and cache in Redis
def fetch_and_cache_data():
    response = requests.get('https://data.cityofnewyork.us/resource/erm2-nwe9.json')
    if response.status_code == 200:
        raw_data = response.json()
        filtered_data = [
            {
                'Created Date': item.get('created_date', 'Not specified'),
                'Agency': item.get('agency', 'Not specified'),
                'Agency Name': item.get('agency_name', 'Not specified'),
                'Complaint Type': item.get('complaint_type', 'Not specified'),
                'Descriptor': item.get('descriptor', 'Not specified'),
                'Location Type': item.get('location_type', 'Not specified'),
                'Incident Zip': item.get('incident_zip', 'Not specified'),
                'Incident Address': item.get('incident_address', 'Not specified'),
                'Borough': item.get('borough', 'Not specified'),
                'Location': item.get('location', {'latitude': 'Not specified', 'longitude': 'Not specified'})
            } for item in raw_data
        ]
        compressed_data = compress_data(filtered_data)
        redis.setex('complaints_data', 86400, compressed_data)
        print("Data fetched and compressed and cached")
        return filtered_data
    else:
        print("Failed to fetch data from API")
        return []

# Schedule the fetch_and_cache_data to run daily at 4:00 AM
scheduler.add_job(fetch_and_cache_data, 'cron', hour=4)




@app.route('/')
def hello_world():
    return 'Hello, Worls!'

@app.route('/311calls', methods=['GET'])
@cross_origin(origin='*', supports_credentials=True)
def calls311():

    filters = {
        'zip': request.args.get('zip', ''),
        'borough': request.args.get('borough', ''),
        'agency': request.args.get('agency', ''),
        'createdDate': request.args.get('createdDate', '')
    }

    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 50))

    cached_data = redis.get('complaints_data')
    if cached_data:
        data = decompress_data(cached_data)
        filtered_data = filter_data(data, filters)
        start = (page - 1) * limit
        end = start + limit
        paged_data = filtered_data[start:end]
        response = jsonify(paged_data)
        response.headers['Cache-Control'] = 'public, max-age=3600, s-maxage=86400'
        return response
    else:
        return jsonify({"error": "Data not available"}), 404
    

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google Cloud Run,
    # a webserver process such as Gunicorn will serve the app.
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))






    # page = int(request.args.get('page', 1))
    # limit = int(request.args.get('limit', 50))
    # offset = (page - 1) * limit
    # response = requests.get(f'https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit={limit}&$offset={offset}')
    # print ("serverrr hit")
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
 
  


