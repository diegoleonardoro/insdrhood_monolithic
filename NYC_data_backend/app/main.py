
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
from collections import defaultdict
from datetime import datetime, timedelta
import base64
from collections import Counter
load_dotenv()
#----------------------------------------------
from langchain.chains.retrieval import create_retrieval_chain
from langchain import hub
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_pinecone import PineconeVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import os
from typing import List
from typing import Dict
from typing import Any
from langchain.chains.history_aware_retriever import create_history_aware_retriever
#----------------------------------------------



# MODULE_PATH = '.'
# if os.getenv('ENVIRONMENT') == 'production':
#     MODULE_PATH = '/app'
# sys.path.append(MODULE_PATH)
# print("Environment:", os.getenv('ENVIRONMENT'))
# try:
#     from llm import run_llm
# except ImportError as e:
#     print("Import error:", e)
# except Exception as e:
#     print("General error during import:", e)
# from llm import run_llm



app = Flask(__name__)
base_url = os.environ.get("BASE_URL", "http://localhost:3000")


allowed_origins = [
    base_url, 
    "https://www.insiderhood.com", 
    "https://insiderhood.com"
]

CORS(app, resources={
    r"/311calls": {"origins": allowed_origins},
    r"/311calls_complaint_types_count": {"origins": allowed_origins},
    r"/dob_approved_permits": {"origins": allowed_origins},
    r"/neighborhood_report_data": {"origins": allowed_origins},
    r"/chat": {"origins": allowed_origins}
}, supports_credentials=True)



PINECONE_INDEX_NAME = os.environ.get('PINECONE_INDEX_NAME') 
data_dir = os.environ.get('DATA_DIR', './app/data')  # Default to './data' if not set
print("data_dir==>>>", data_dir)

file_path = os.path.join(data_dir, 'nyc_cb_neighborhoods.json')

with open(file_path, 'r') as file:
    community_boards = json.load(file)


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
    compressed_data = gzip.compress(data)
    # Encode compressed data in base64 to store as string in Redis
    base64_encoded_data = base64.b64encode(compressed_data).decode('utf-8')
    return base64_encoded_data


def decompress_data(data):
  
    try:
        # Decode the data from base64
        base64_decoded_data = base64.b64decode(data)
        # Attempt to decompress and decode
        decompressed_data = gzip.decompress(base64_decoded_data).decode('utf-8')
        return json.loads(decompressed_data)
    except (OSError, gzip.BadGzipFile, json.JSONDecodeError) as e:
        # Fallback to plain JSON loading if data is not compressed or base64 encoded
        print("Error during decompression or decoding:", e)
        try:
            # This assumes the data could be plain JSON text
            return json.loads(data)
        except json.JSONDecodeError as json_error:
            print("Final fallback, unable to decode JSON:", json_error)
            return None


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
                    'Location': item.get('location', {'latitude': 'Not specified', 'longitude': 'Not specified'}),
                    'Community Board':item.get('community_board', 'Not specified'),
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
        response = requests.get('https://data.cityofnewyork.us/resource/rbx6-tga4.json?$limit=50000')
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
        # 'Borough': request.args.get('Borough', '').strip(),
        'Agency': request.args.get('Agency', '').strip(), 
        'Created Date': request.args.get('CreatedDate', '').strip()
    }
    boroughs = request.args.getlist('Borough[]')
    zip_codes = request.args.getlist('zip[]')
    complaint_type = request.args.get('ComplaintType')
    initialLoad= request.args.get("initialLoad")

    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 0))
    cached_data = redis.get('complaints_data') 
    date_range = redis.hgetall('complaints_date_range')


    if cached_data and date_range:
            
        data = decompress_data(cached_data)
        min_date = date_range.get(b'min_date').decode('utf-8')  # Ensure to handle byte keys if necessary
        max_date = date_range.get(b'max_date').decode('utf-8')

        if boroughs:
            filters['Borough'] = [borough.upper() for borough in boroughs] 

        if zip_codes:
            filters['Incident Zip'] = zip_codes

        if complaint_type:
            filters['Complaint Type'] = complaint_type
        
        # Filter data with updated filters, including zip codes if provided
        filtered_data = filter_data(data, filters)

        # Prepare descriptor counts
        if zip_codes:
            # Count by Complaint Type and Zip Code
            descriptor_counts = defaultdict(lambda: defaultdict(int))
            for item in filtered_data:
                complaint_type = item['Complaint Type'].title()
                item_zip = item.get('Incident Zip', 'Unknown')
                descriptor_counts[complaint_type][item_zip] += 1
            
            # Convert dictionary to list format
            descriptor_counts = [
                {"name": complaint, **dict(zip_counts)} for complaint, zip_counts in descriptor_counts.items()
            ]
        else:
            # Original counting method when no zip codes are provided
            descriptor_counts = Counter(item['Complaint Type'].title() for item in filtered_data)

        # Calculate counts of descriptors and times for the filtered data
        # descriptor_counts = Counter(item['Complaint Type'].title() for item in filtered_data)

        hour_minute_counts = count_hour_minute(filtered_data)
        data_count_by_day = [] 


        # this will only take place in the first request:
        if initialLoad:

            aggregated_data = defaultdict(lambda: defaultdict(int))
            # Formatting the output
            data_count_by_day = []  # Ensure data_count_by_day is define

            # Check if zip_codes is provided and filter items based on 'Incident Zip'
            if zip_codes:
                # Only process if zip_codes are provided
                for item in filtered_data:
                    zip_code = item['Incident Zip']
                    if zip_code in zip_codes:
                        date_only = item['Created Date'][:10]  # Extract only the date part (YYYY-MM-DD)
                        aggregated_data[date_only][zip_code] += 1

                # Reformat the output to be by date, with zip code counts
                for date, zips in aggregated_data.items():
                    response_entry = {"date": date}
                    for zip_code, count in zips.items():
                        response_entry[zip_code] = count
                    data_count_by_day.append(response_entry)
            else:
                for item in filtered_data:
                    borough = item['Borough']
                    date_only = item['Created Date'][:10]  # Extract only the date part (YYYY-MM-DD)
                    aggregated_data[borough][date_only] += 1

                for borough, dates in aggregated_data.items():
                    response_entry = {"Borough": borough}
                    for date, count in dates.items():
                        response_entry[date] = count
                    data_count_by_day.append(response_entry)



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
                "data_length":len(filtered_data),
                "data_count_by_day":data_count_by_day
        }
        return jsonify(response_data)
    else:
        # If no cached data, fetch and cache the data
        fetch_and_cache_data("311calls")


@app.route('/311calls_complaint_types_count', methods=['GET'])
@cross_origin(origin='*', supports_credentials=True)
def complaint_types_count():

    print("base_urlbase_url", base_url)
    
    boroughs = request.args.getlist('boroughs[]')
    zip_codes = request.args.getlist('zipcodes[]')
    complaint_types = request.args.getlist('complaint_types[]')

    # Redis: Retrieve the date range
    date_range = redis.hgetall('complaints_date_range')
    start_date = date_range.get(b'min_date').decode('utf-8')  
    end_date = date_range.get(b'max_date').decode('utf-8')

    filters={}
    if boroughs:
        filter_type = 'Borough'
        filter_keys = [borough.upper() for borough in boroughs]

    if zip_codes:
        filter_type = 'Incident Zip'
        filter_keys = zip_codes

    cached_data = redis.get('complaints_data') 
    data = []
    if cached_data:
        data = decompress_data(cached_data)

    chart_ready_data = format_data_for_chart(data, start_date, end_date, filter_type, filter_keys, complaint_types)

    return jsonify(chart_ready_data)
    
    
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
    limit = int(request.args.get('limit', 20))

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

        
        return response 
    else:
        fetch_and_cache_data("dob_approved_permits")


@app.route('/neighborhood_report_data', methods=['GET'])
@cross_origin(origin='*', supports_credentials=True)
def neighborhood_report_data():

    neighborhood = request.args.get('neighborhood')

    # retreive data date range:
    date_range = redis.hgetall('complaints_date_range')
    start_date = date_range.get(b'min_date').decode('utf-8')  # Ensure to handle byte keys if necessary
    end_date = date_range.get(b'max_date').decode('utf-8')

    cached_data = redis.get('complaints_data') 
    data = []
    if cached_data:
        data = decompress_data(cached_data)

  
    # Convert dictionaries to dictionary format required for analysis
    documents = process_dictionaries(data)

    # Get the community boards of the chosen neighborhood 
    cbs = find_community_boards(community_boards, neighborhood)
    
    # select the documents that include the community boards
    documents_filtered_by_cb = filter_documents_by_cb(documents, cbs)

    analyzed_data = analyze_complaints(documents_filtered_by_cb)


    return analyzed_data


@app.route('/chat', methods=['POST'])
@cross_origin(origin='*', supports_credentials=True)
def chat():
   
    user_message = request.json["message"]
    chat_history = request.json["chatHistory"]
    from_option = request.json.get("fromOption")

    if from_option:
        print('from_option', from_option)
        # Check if the option relates to a specific query about boroughs
        if from_option == "question-1":
            if user_message == "Manhattan":
                query = "Give me an explanation of how Manhattan is divided."
                llm_response = run_llm(query=query, chat_history=chat_history)
                llm_response = llm_response["answer"]
                response_dict = {
                    'llm_response': llm_response,
                    'message': "he followoing are some iconic neighborhoods in Manhattan. Are you interested in any of the following?",
                    'additional_option': {
                        "description": "manhattan_section",
                        "options": ["Upper East Side", "Upper West Side", "Harlem", "Greenwich Village", "Tribeca", "East Village", "Chelsea", "Financial District", "Midtown", "Times Square", "Little Italy", "Chinatown"],
                        "setNumber": 2  
                    }
                }
                return jsonify(response_dict)
            
            # there should be other if statements that check for other boroughts. elif bronx 
            elif user_message == "Brooklyn":
               
                query = f"Give me an explanation of {user_message}."
                llm_response = run_llm(query=query, chat_history=chat_history)
                llm_response = llm_response["answer"]

                response_dict = {
                    'llm_response': llm_response,
                    'message':"The followoing are some iconic neighborhoods in Brooklyn. Are you interested in any of the following?",
                    'additional_option': {
                        "description": "brooklyn_section",
                        "options": ["Brooklyn Heights", "DUMBO", "Williamsburg", "Greenpoint", "Fort Greene", "Downtown Brooklyn", "Bushwick", "Park Slope", "Prospect Park", "Sunset Park"],
                        "setNumber": 2  
                    }
                }
                return jsonify(response_dict)
            elif user_message == "Queens":
                query = f"Give me an explanation of {user_message}."
                llm_response = run_llm(query=query, chat_history=chat_history)
                llm_response = llm_response["answer"]

                response_dict = {
                    'llm_response': llm_response,
                    'message':"The followoing are some of the most iconic neighborhoods in Queens. Are you interested in any of the following?",
                    'additional_option': {
                        "description": "queens_section",
                        "options": ["Long Island City", "Astoria", "Jackson Heights", "Flushing", "Kew Gardens", "Sunnyside", "Forest Hills", "The Rockaways"],
                        "setNumber": 2  
                    },
                   
                }
                return jsonify(response_dict)
            elif user_message == "The Bronx":
                query = f"Give me an explanation of {user_message}."
                llm_response = run_llm(query=query, chat_history=chat_history)
                llm_response = llm_response["answer"]

                response_dict = {
                    'llm_response': llm_response,
                    'message':"The followoing are some of the most iconic neighborhoods in The Bronx. Are you interested in any of the following?",
                    'additional_option': {
                        "description": "bronx_section",
                        "options": ["Mott Haven", "Kingsbridge", "Fordham", "Parkchester", "Woodlawn", "Bedford Park", "Riverdale", "Baychester", "Concourse", "Co-op City"],
                        "setNumber": 2  
                    },
                   
                }
                return jsonify(response_dict)
            elif user_message == "Staten Island =":
                query = f"Give me an explanation of {user_message}."
                llm_response = run_llm(query=query, chat_history=chat_history)
                llm_response = llm_response["answer"]

                response_dict = {
                    'llm_response': llm_response,
                    'message':"The followoing are some of the most iconic neighborhoods in Staten Island. Are you interested in any of the following?",
                    'additional_option': {
                        "description": "bronx_section",
                        "options": ["Huguenot", "St. George", "New Dorp", "Todt Hill", "West New Brighton", "Livingston"],
                        "setNumber": 2  
                    },
                   
                }
                return jsonify(response_dict)
            
        # question-2 means that the user selected any of the suggested neighborhoods
        elif from_option == "question-2":
            query = f"Give me a concise explanation of {user_message}."
            llm_response = run_llm(query=query, chat_history=chat_history)
            llm_response = llm_response["answer"]
            response_dict = {
                'llm_response': llm_response,
                'message':f"What are you interested to explore in{user_message}?",
                 'additional_option': {
                        "description": "places_section",
                        "options": ["Restaurants", "Museums", "Public Spaces", "Parks", "Nighclubs", "Everything"],
                        "setNumber": 3  
                },
            }
            return jsonify(response_dict)
        # question-3 means that the user has asked for places recommendations in a specific neighborhood
        elif from_option == "question-3":
            print("holisss")
            query = f"Recommend me some {user_message} in the neighborhood I just mentioned"
            llm_response = run_llm(query=query, chat_history=chat_history)
            response_dict = {
                'llm_response': llm_response["answer"],
                'additional_option': None
            }

            # return generated_response
            return jsonify(response_dict)
            
    # this will take place when user sends text
    llm_response = run_llm(query=user_message, chat_history=chat_history)
    response_dict = {
        'llm_response': llm_response["answer"],
        'additional_option': None
    }

    # return generated_response
    return jsonify(response_dict)



# ----- HELPER FUNCTIONS:
        
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

def format_data_for_chart(data, start_date, end_date, filter_type, filter_keys, complaint_types):
    current_date = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S.%f")
    end_date = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S.%f")
    date_format = "%Y-%m-%d"

    # Create a list to hold the data in the required format for the chart
    chart_data = []

    # Initialize data structure for each day
    while current_date <= end_date:
        formatted_date = current_date.strftime(date_format)
        day_data = {'date': formatted_date}
        for key in filter_keys:
            day_data[key] = 0  # Initialize each filter key count as 0 for this day
        chart_data.append(day_data)
        current_date += timedelta(days=1)

    # Populate the data
    for entry in data:
        entry_date = datetime.strptime(entry['Created Date'], "%Y-%m-%dT%H:%M:%S.%f").strftime(date_format)
        if entry[filter_type] in filter_keys and (not complaint_types or entry['Complaint Type'] in complaint_types):
            for day_data in chart_data:
                if day_data['date'] == entry_date:
                    day_data[entry[filter_type]] += 1

    return chart_data

def count_hour_minute(data):
    # Extract 'hour:minute' and count occurrences
    hour_minute_list = [
        datetime.strptime(item['Created Date'], '%Y-%m-%dT%H:%M:%S.%f').strftime('%H:%M')
        for item in data if 'Created Date' in item
    ]
    return dict(Counter(hour_minute_list))

def process_dictionaries(data):
   
    documents = [
        {
            "page_content": f"Date: {entry['Created Date']}, Agency: {entry['Agency']}, Complaint: {entry['Complaint Type']}, Location: {entry['Location Type']}, Zip: {entry['Incident Zip']}, Address: {entry['Incident Address']}, Borough: {entry['Borough']}, CB:{entry['Community Board']}, Descriptor:{entry['Descriptor']}"
        } for entry in data
    ]
    return documents

def find_community_boards(data, neighborhood):
    boards_with_neighborhood = []
    for borough, communities in data.items():
        for board, areas in communities.items():
            if neighborhood.lower() in areas.lower():
                boards_with_neighborhood.append(f"{board}")
    return boards_with_neighborhood

def filter_documents_by_cb(documents, cb_list):
    # Normalize all community board entries and format them
    cb_normalized = [f"CB:{cb}".upper().strip() for cb in cb_list]

    # Filter documents to include those containing any of the normalized community board strings
    return [doc for doc in documents if any(cb in doc['page_content'].upper() for cb in cb_normalized)]

def analyze_complaints(data):
    
    # Parsing documents from dictionaries
    parsed_data = [parse_document(doc['page_content']) for doc in data]  # Access dictionary with key

    # Most Common Complaint and its frequency
    complaints = Counter(doc['Complaint'] for doc in parsed_data)
    complaints_in_order = complaints.most_common()

    # Adding top 3 addresses to each complaint type in complaints_in_order
    complaints_with_addresses = []
    for complaint, count in complaints_in_order:
        top_addresses = [doc['Address'] for doc in parsed_data if doc['Complaint'] == complaint]
        address_frequency = Counter(top_addresses)
        top_three_addresses = [address for address, count in address_frequency.most_common(3)]
        complaints_with_addresses.append({
            "complaint": complaint,
            "count": count,
            "top_addresses": top_three_addresses
        })

    # Most Common Complaint - deduce from the sorted list
    most_common_complaint = complaints_with_addresses[0]['complaint']
    top_addresses_for_common_complaint = complaints_with_addresses[0]['top_addresses']

    

    # Most Repeated Addresses
    addresses = Counter(doc['Address'] for doc in parsed_data)
    most_common_addresses = addresses.most_common()

    address_to_complaints = {}
    for address, _ in most_common_addresses:
        address_to_complaints[address] = [doc['Descriptor'] for doc in parsed_data if doc['Address'] == address]

    address_to_complaints = sorted(address_to_complaints.items(), key=lambda item: len(item[1]), reverse=True)


    # Most Repeated Responding Agencies
    agencies = Counter(doc['Agency'] for doc in parsed_data)
    agency_info = {
        agency: [(doc['Complaint'], doc['Address']) for doc in parsed_data if doc['Agency'] == agency]
        for agency, _ in agencies.most_common()
    }

    return {
        "common_complaints": {
            "most_common": most_common_complaint,
            "count": complaints[most_common_complaint],
            "top_addresses": top_addresses_for_common_complaint
        },
        "complaints_by_frequency": complaints_with_addresses,
        "addresses_with_complaints": address_to_complaints,
        "agencies_and_complaints": agency_info
    }

def parse_document(document):
    """Extract key information from the document string."""
    info = {}
    entries = document.split(", ")
    for entry in entries:
        parts = entry.split(":", 1)
        if len(parts) == 2:
            key, value = parts[0].strip(), parts[1].strip()
            info[key.strip()] = value.strip()
        else:
            # Handle the case where no ":" is found
            # Optionally log this or handle it in another suitable way
            continue
    # print('infoo', info)
    return info

def run_llm (query:str, chat_history: List [Dict[str, Any]]=[]):

  embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
  docsearch = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)

  chat = ChatOpenAI(verbose=True, temperature=0)
 
  retrieval_qa_chat_prompt = hub.pull("langchain-ai/retrieval-qa-chat")
  
  stuff_documents_chain = create_stuff_documents_chain(chat, 
  retrieval_qa_chat_prompt)

  rephrase_prompt = hub.pull("langchain-ai/chat-langchain-rephrase") 

  history_aware_retriever = create_history_aware_retriever(
    llm=chat, retriever=docsearch.as_retriever(), prompt=rephrase_prompt
  )

  history_aware_retriever = create_history_aware_retriever(
    llm=chat, retriever=docsearch.as_retriever(), prompt=rephrase_prompt
  )

  qa = create_retrieval_chain(
    retriever=history_aware_retriever, combine_docs_chain=stuff_documents_chain
  )

  result = qa.invoke(input={"input": query, "chat_history": chat_history})

  return result


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))


  