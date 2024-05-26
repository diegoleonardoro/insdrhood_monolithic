
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
from collections import Counter
from datetime import datetime

load_dotenv()

app = Flask(__name__)
base_url = os.environ.get("BASE_URL", "http://localhost:3000")

allowed_origins = [
    base_url, 
    "https://www.insiderhood.com", 
    "https://insiderhood.com"
]

CORS(app, resources={
    r"/311calls": {"origins": allowed_origins},
    r"/dob_approved_permits": {"origins": allowed_origins}
}, supports_credentials=True)


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
def fetch_and_cache_data(data_source):

    if data_source == '311calls':
        response = requests.get('https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit=50000')
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

            dates = [datetime.strptime(item["Created Date"], "%Y-%m-%dT%H:%M:%S.%f") for item in filtered_data]
            min_date = min(dates)
            max_date = max(dates)

            min_date_str = min_date.strftime("%Y-%m-%dT%H:%M:%S.%f")
            max_date_str = max_date.strftime("%Y-%m-%dT%H:%M:%S.%f")
            redis.hset("complaints_date_range", "min_date", min_date_str)
            redis.hset("complaints_date_range", "max_date", max_date_str)
            redis.expire("complaints_date_range", 86400)  # Set expiration to 24 hours

            compressed_data = compress_data(filtered_data)
            redis.setex('complaints_data', 86400, compressed_data)
            print("Data fetched and compressed and cached")
            return filtered_data
        else:
            print("Failed to fetch data from API")
            return []
    elif data_source == "dob_approved_permits":
        # make the request to the dob approved permits:
        response = requests.get('https://data.cityofnewyork.us/resource/rbx6-tga4.json')
        if response.status_code == 200:
            raw_data = response.json()
            filtered_data = [
                {
                    'House Number': item.get('house_no', 'Not specified'),
                    'Street Name': item.get('street_name', 'Not specified'),
                    'Borough': item.get('borough', 'Not specified'),
                    'Community Board': item.get('c_b_no', 'Not specified'),
                    'Work Floor': item.get('work_on_floor', 'Not specified'),
                    'Work Type': item.get('work_type', 'Not specified'),
                    'Applicant Business Name': item.get('applicant_business_name', 'Not specified'),
                    'Approved Date': item.get('approved_date', 'Not specified'),
                    'Issued Date': item.get('issued_date', 'Not specified'),
                    'Expired Date': item.get('expired_date', 'Not specified'),
                    'Job Description': item.get('job_description', 'Not specified'),
                    'Estimated Cost': item.get('estimated_job_costs', 'Not specified'),
                    'Owner Business Name': item.get('owner_business_name', 'Not specified')
                } for item in raw_data
            ]

            compressed_data = compress_data(filtered_data)
            redis.setex('dob_approved_permits', 86400, compressed_data)
            print("Data fetched and compressed and cached")
            return filtered_data
        else:
            print("Failed to fetch data from API")
            return []

# Schedule the fetch_and_cache_data to run daily at 4:00 AM
scheduler.add_job(fetch_and_cache_data, 'cron', args=['311calls'], hour=4)

@app.route('/')
def hello_world():
    return 'Hello, Worls!'


@app.route('/311calls', methods=['GET'])
@cross_origin(origin='*', supports_credentials=True)
def calls311():
    filters = {
        # 'Incident Zip': request.args.get('IncidentZip', '').strip(),
        'Borough': request.args.get('Borough', '').strip(),
        'Agency': request.args.get('Agency', '').strip(), 
        'Created Date': request.args.get('CreatedDate', '').strip()
    }

    print('filters', filters)

    zip_codes = request.args.getlist('zip[]')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 0))
    cached_data = redis.get('complaints_data') 
    date_range = redis.hgetall('complaints_date_range')

    if cached_data and date_range:
            
        data = decompress_data(cached_data)

        min_date = date_range.get(b'min_date').decode('utf-8')  # Ensure to handle byte keys if necessary
        max_date = date_range.get(b'max_date').decode('utf-8')

        if zip_codes:
            filters['Incident Zip'] = zip_codes
        
        # Filter data with updated filters, including zip codes if provided
        filtered_data = filter_data(data, filters)


        # Calculate counts of descriptors and times for the filtered data
        descriptor_counts = Counter(item['Complaint Type'].title() for item in filtered_data)

        hour_minute_counts = count_hour_minute(filtered_data)

        # Check if a valid limit is provided
        if limit > 0:
                start = (page - 1) * limit
                end = start + limit
                paginated_data = filtered_data[start:end]
                response = paginated_data
        else:
                # If limit is 0 or not provided, return all filtered data
                response = filtered_data

        response_data = {
                "original_data": response,
                "hour_minute_counts": hour_minute_counts,
                "descriptor_counts":descriptor_counts,
                "min_date": min_date,  # Add min date to response
                "max_date": max_date, 
                "data_length":len(filtered_data)
        }
        return jsonify(response_data)
    else:
        # If no cached data, fetch and cache the data
        fetch_and_cache_data("311calls")



@app.route('/dob_approved_permits', methods=['GET'])
@cross_origin(origin='*', supports_credentials=True)
def dob_approved_permits():

    filters ={
        # 'Incident Zip': request.args.get('IncidentZip', '').strip(),
        # 'Borough': request.args.get('Borough', '').strip(),
        # 'Agency': request.args.get('Agency', '').strip(), 
        # 'Created Date': request.args.get('CreatedDate', '').strip()
    }

    cached_data = redis.get("dob_approved_permits")
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 0))

    if cached_data:
        data = decompress_data(cached_data)
        filtered_data = filter_data(data, filters)
         # Check if a valid limit is provided
        if limit > 0:
            start = (page - 1) * limit
            end = start + limit
            paginated_data = filtered_data[start:end]
            response = make_response(jsonify(paginated_data))
        else:
                 # If limit is 0 or not provided, return all filtered data
            response = make_response(jsonify(filtered_data))
        return response #response
    else:
        fetch_and_cache_data("dob_approved_permits")

        
def filter_data(data, filters):
    filtered_data = [
        item for item in data
        if all(
            (item[key] == value if isinstance(value, str) else item[key] in value)
            or value == '' 
            for key, value in filters.items()
        )
    ]
    return filtered_data



def count_hour_minute(data):
    # Extract 'hour:minute' and count occurrences
    hour_minute_list = [
        datetime.strptime(item['Created Date'], '%Y-%m-%dT%H:%M:%S.%f').strftime('%H:%M')
        for item in data if 'Created Date' in item
    ]
    return dict(Counter(hour_minute_list))


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google Cloud Run,
    # a webserver process such as Gunicorn will serve the app.
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))


  


