
from flask import Flask, jsonify, request, make_response
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

allowed_origins = [
    base_url, 
    "https://www.insiderhood.com", 
    "https://insiderhood.com"
]

CORS(app, resources={r"/311calls": {"origins": allowed_origins}}, supports_credentials=True)

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
        # Fallback to plain JSON loading if data is not compressed
        return json.loads(data)


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
    filters = { # 1. get the filters coming from the client side 
        'Incident Zip': request.args.get('IncidentZip', ''),
        'Borough': request.args.get('Borough', ''),
        'Agency': request.args.get('Agency', ''),
        'Created Date': request.args.get('CreatedDate', '')
    }

    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 5))
    cached_data = redis.get('complaints_data') # 2. get the data stored on redis

    print("hola")

    if cached_data:
        data = decompress_data(cached_data)

        filtered_data = [
            item for item in data
            if (not filters['Incident Zip'] or filters['Incident Zip'] in item['Incident Zip']) and
               (not filters['Borough'] or filters['Borough'].lower() == item['Borough'].lower()) and
               (not filters['Agency'] or filters['Agency'].lower() == item['Agency'].lower()) and
               (not filters['Created Date'] or filters['Created Date'] in item['Created Date'])
        ]

        # Handle pagination
        start = (page - 1) * limit
        end = start + limit
        paginated_data = filtered_data[start:end]
        response = make_response(jsonify(paginated_data))
        response.headers['Cache-Control'] = 'public, max-age=3600, s-maxage=86400'
        return response
    
    else:
        fetch_and_cache_data()

        
def filter_data(data, filters):
    if all(value == '' for value in filters.values()):  # Check if all filter values are empty
        return data  # Return all data if no filters are specified
    else:
        return [
            item for item in data
            if all(
                not filters[key] or str(item.get(key, '')).lower() == str(filters[key]).lower()
                for key in filters
            )
        ]



if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google Cloud Run,
    # a webserver process such as Gunicorn will serve the app.
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))


  


