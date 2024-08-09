
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
import pandas as pd



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


# promotions dataframe load:
promotions_file_path = os.path.join(data_dir, 'Deals&promotions.csv')
promotions_df = pd.read_csv(promotions_file_path)

# boroughs information load
boroughs_info_path = os.path.join(data_dir, 'boroughs_information.json')
with open(boroughs_info_path, 'r') as file:
    boroughs_info= json.load(file)


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
        
        # Check if the option relates to a specific query about boroughs
        if from_option == "question-1":
            if user_message == "Manhattan":
                query = "Give me an explanation of how Manhattan is divided."
            
                manhattan_promotions = filter_promotions_by_borough(promotions_df, 'Manhattan')
                   
                # llm_response = run_llm(query=query, chat_history=chat_history)
                # llm_response = llm_response["answer"]

                # boroughs_info["Manhattan"]
                response_dict = {
                    'llm_response': {'info':"Manhattan, one of New York City's five boroughs, serves as a global hub for culture, finance, and media. It's structured into distinct areas: Downtown (Lower Manhattan) is the financial core with neighborhoods like Tribeca; Midtown features major tourist attractions like Times Square and the Empire State Building; the Upper East Side is known for its luxury living and museums along Museum Mile; the Upper West Side offers a more relaxed vibe near Central Park; Harlem celebrates African American culture with its rich history in jazz and arts; and Washington Heights and Inwood are noted for their strong Dominican community and scenic parks. Each neighborhood contributes to Manhattan's dynamic and diverse character." , "structured_data":False},
                    'identifier':"boroughs_info",
                    'message': "The following are some iconic neighborhoods in Manhattan. Are you interested in any of the following?",
                    'promotions_message':"Here are some activities you can do in Manhattan:",
                    'additional_option': {
                        "description": "manhattan_section",
                        "links":manhattan_promotions,
                        "options": {"Downtown":["Little Italy", "Chinatown", "Battery City Park", "Financial District"] , "Midtown": ["Times Square", "Soho", "Hell’s Kitchen", "Chelsea", "Flatiron District", "Soho","Koreatown","Herald Square" , "Diamond District", "Gramercy" ], "Uptown Manhattan & Upper Manhattan":["Upper East Side","Upper West Side", "Harlem", "Morningside Heights", "Washington Heights", "Inwood" ]},
                        "setNumber": 2  
                    }
                }
                return jsonify(response_dict)
            
            # there should be other if statements that check for other boroughts. elif bronx 
            elif user_message == "Brooklyn":
               
                query = f"Give me an explanation of {user_message}."

                brooklyn_promotions = filter_promotions_by_borough(promotions_df, 'Brooklyn')

                # llm_response = run_llm(query=query, chat_history=chat_history)
                # llm_response = llm_response["answer"]

                response_dict = {
                    'llm_response': {'info': "Brooklyn, one of New York City's five boroughs, offers a vibrant mix of neighborhoods each with its own unique personality. Downtown Brooklyn serves as the commercial heart and is rapidly growing with new developments. Williamsburg is known for its trendy vibe, bustling with arts, music, and nightlife. Park Slope features beautiful brownstones and proximity to Prospect Park, making it family-friendly. Brooklyn Heights offers stunning views of the Manhattan skyline and historic architecture. Bushwick is popular for its artistic community, street art, and eclectic dining scene. Coney Island provides a seaside escape with its famous boardwalk and amusement park. Each area of Brooklyn showcases its distinct charm, contributing to the borough's diverse and eclectic atmosphere.", "structured_data":False},
                    'identifier':"boroughs_info",
                    'message':"The followoing are some iconic neighborhoods in Brooklyn. Are you interested in any of the following?",
                    'promotions_message':"Here are some activities you can do in Brooklyn:",
                    'additional_option': {
                        "description": "brooklyn_section",
                        "links":brooklyn_promotions,
                        "options": {"North Brooklyn":["Williamsburg", "Greenpoint", "Bushwick", "DUMBO","Brooklyn Heights", "Fort Greene"] , 
                                    "Central Brooklyn": ["Bed-Stuy", "Crown Heights",  "Park Slope", "Prospect Heights", "Flatbush","Prospect Lefferts Gardens" ], 
                                    "South Brooklyn":["Bay Ridge","Bensonhurst", "Coney Island", "Brighton Beach", "Sunset Park", "Sheepshead Bay" ]},
                        "setNumber": 2  
                    }
                }
                return jsonify(response_dict)
            elif user_message == "Queens":
                query = f"Give me an explanation of {user_message}."

                queens_promotions = filter_promotions_by_borough(promotions_df, 'Queens')

                # llm_response = run_llm(query=query, chat_history=chat_history)
                # llm_response = llm_response["answer"]

                response_dict = {
                    'llm_response': {'info': "Queens, one of New York City's five boroughs, is celebrated for its incredible diversity, hosting vibrant neighborhoods each with distinct characteristics. Astoria is renowned for its eclectic dining scene, particularly strong in Greek and Middle Eastern cuisines. Flushing is a bustling hub with one of the largest Asian communities in the U.S., famous for its authentic Chinese and Korean eateries. Long Island City blends industrial heritage with modern developments, offering parks with stunning Manhattan views and a thriving arts community. Jackson Heights showcases a melting pot of cultures with a plethora of ethnic restaurants and shops. The Rockaways provide a beach getaway with boardwalks and surf spots. Each neighborhood in Queens offers a unique slice of the world, reflecting the borough's rich cultural tapestry.", "structured_data":False},
                    'message':"The followoing are some of the most iconic neighborhoods in Queens. Are you interested in any of the following?",
                    'promotions_message':"Here are some activities you can do in Queens:",
                    'additional_option': {
                        "description": "queens_section",
                        "links":queens_promotions,
                        "options": {
                            "Western Queens":["Astoria", "Long Island City (LIC)", "Sunnyside", "Woodside","Jackson Heights", "Flushing"] , 
                            "Central Queens": ["Forest Hills", "Kew Gardens", "Rego Park", "Middle Village", "Elmhurst", "Corona" ], 
                            "Eastern Queens":["Bayside","Floral Park", "Fresh Meadows", "Hollis", "Queens Village", "St. Albans" ]},
                        "setNumber": 2  
                    },
                   
                }
                return jsonify(response_dict)
            elif user_message == "The Bronx":
                query = f"Give me an explanation of {user_message}."

                bronx_promotions = filter_promotions_by_borough(promotions_df, 'Bronx')
                # llm_response = run_llm(query=query, chat_history=chat_history)
                # llm_response = llm_response["answer"]
                response_dict = {
                    'llm_response': {'info': "The Bronx, one of New York City's five boroughs, is rich in cultural diversity and historical landmarks. South Bronx is known for its vibrant street art and as the birthplace of hip-hop. Riverdale offers a more suburban feel with spacious homes and an affluent atmosphere. Fordham is bustling with students from Fordham University and features a lively shopping district. The Grand Concourse, inspired by Parisian boulevards, showcases art deco architecture and the Bronx Museum of the Arts. City Island resembles a quaint New England fishing village, popular for its seafood restaurants and maritime charm. The Bronx also hosts the New York Botanical Garden and the Bronx Zoo, two of the city's largest and most renowned green spaces. Each neighborhood contributes to the Bronx's unique character and resilience.", "structured_data":False},
                    'message':"The followoing are some of the most iconic neighborhoods in The Bronx. Are you interested in any of the following?",
                    'promotions_message':"Here are some activities you can do in The Bronx:",
                    'additional_option': {
                        "description": "bronx_section",
                        "links":bronx_promotions,
                         "options": {
                            "South Bronx":["Mott Haven", "Port Morris", "Melrose", "Hunts Point","Morrisania", "Highbridge"] , 
                            "Central Bronx": ["Fordham", "Belmont", "Kingsbridge", "University Heights", "Norwood", "Bedford Park" ], 
                            "North Bronx":["Riverdale","Woodlawn", "Wakefield", "Baychester", "City Island", "Co-op City" ]},
                        "setNumber": 2  
                    },
                   
                }
                return jsonify(response_dict)
            elif user_message == "Staten Island":
                query = f"Give me an explanation of {user_message}."
                # llm_response = run_llm(query=query, chat_history=chat_history)
                # llm_response = llm_response["answer"]
                staten_island_promotions = filter_promotions_by_borough(promotions_df, 'Staten Island')
                response_dict = {
                    'llm_response': {'info': "Staten Island, the least populated and most suburban of New York City's five boroughs, offers a unique blend of urban and suburban lifestyles. North Shore is known for its cultural diversity, featuring the Staten Island Ferry and the developing St. George waterfront. Mid-Island boasts quiet residential neighborhoods and the expansive Greenbelt, a network of parks and trails. South Shore features more suburban settings with larger homes and newer developments. Historic Richmond Town provides a glimpse into 17th-century life with well-preserved buildings and reenactments. The borough is also home to the Staten Island Zoo and the Snug Harbor Cultural Center and Botanical Garden, adding cultural and recreational depth. Staten Island's distinct areas provide a more relaxed pace compared to the rest of New York City.", "structured_data":False},
                    'message':"The followoing are some of the most iconic neighborhoods in Staten Island. Are you interested in any of the following?",
                    'promotions_message':"Here are some activities you can do in Staten Island:",
                    'additional_option': {
                        "description": "staten_island_section",
                        "links":staten_island_promotions,
                        "options": {
                            "North Shore":["St. George", "Tompkinsville", "Stapleton", "West Brighton","Port Richmond", "Mariners Harbor"] , 
                            "Mid-Island": ["New Springville", "Willowbrook", "Bulls Head", "Todt Hill", "Emerson Hill", "Grant City" ], 
                            "South Shore":["Tottenville","Great Kills", "Eltingville", "Annadale", "Huguenot", "Rossville" ]},
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
                'llm_response': {'info': llm_response, "structured_data":False},
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


def filter_promotions_by_borough(dataframe, borough):
    """
    Filter promotions based on a specific borough, remove unnecessary columns, and convert to a list of dictionaries.

    Parameters:
        dataframe (pd.DataFrame): The DataFrame containing promotion data.
        borough (str): The borough to filter by.

    Returns:
        list[dict]: A list of dictionaries representing the filtered promotions.
    """
    # Filter the DataFrame for entries containing the specified borough in the 'Location' column
    filtered_promotions = dataframe[dataframe['Location'].str.contains(borough, na=False)]
    
    # Drop unnecessary columns
    columns_to_drop = ['Tour ID', 'Area/State', 'Country', 'AVG Rating', 'Reviews', 'Save up to', 'From', 'Price from', 'City']
    filtered_promotions = filtered_promotions.drop(columns=columns_to_drop)
    
    # Convert the DataFrame to a list of dictionaries
    filtered_promotions = filtered_promotions.to_dict(orient="records")
    
    return filtered_promotions

def preprocess_chat_history(chat_history):
    new_history = []
    for entry in chat_history:
        if isinstance(entry['content'], dict):
            if 'info' in entry['content']:
                # Check for nested structure and extract description
                try:
                    if isinstance(entry['content']['info'], dict):
                        for key, value in entry['content']['info'].items():
                            if 'description' in value:
                                description = value['description']
                                new_history.append({'content': description, 'role': entry['role']})
                    else:
                        # If 'info' is not a dictionary, use it directly if it's a string
                        new_history.append({'content': entry['content']['info'], 'role': entry['role']})
                except KeyError as e:
                    print(f"Key error: {e} in entry: {entry}")
                    # Handle the case where the expected keys are not found
                    new_history.append({'content': "Error in data format.", 'role': entry['role']})
            else:
                # If 'info' key is not in the dictionary, append a placeholder or log an error
                new_history.append({'content': "Info not found in entry.", 'role': entry['role']})
        else:
            # Append the entry as is if it's not a dictionary
            new_history.append(entry)
    return new_history

def run_llm (query:str, chat_history: List [Dict[str, Any]]=[]):
  

    try:
        chat_history = preprocess_chat_history(chat_history)
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        docsearch = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings)

        chat = ChatOpenAI(verbose=True, temperature=0)
        retrieval_qa_chat_prompt = hub.pull("langchain-ai/retrieval-qa-chat")

        stuff_documents_chain = create_stuff_documents_chain(chat, retrieval_qa_chat_prompt)
        rephrase_prompt = hub.pull("langchain-ai/chat-langchain-rephrase") 

        history_aware_retriever = create_history_aware_retriever(
            llm=chat, retriever=docsearch.as_retriever(), prompt=rephrase_prompt
        )

        qa = create_retrieval_chain(
            retriever=history_aware_retriever, combine_docs_chain=stuff_documents_chain
        )

        result = qa.invoke(input={"input": query, "chat_history": chat_history})

        

    except Exception as e:
        print("An error occurred:", e)
        raise e  # Rethrow the exception if you need to handle it further up the call stack

    return result


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))


  