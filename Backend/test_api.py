import requests

# The URL of your local Flask server
url = "http://127.0.0.1:5000/api/users"

# The data that React will eventually send when the user submits the form
react_data = {
    "email": "nouveaux.testeur@omnisave.com",
    "password": "secure_api_password",
    "first_name": "API",
    "last_name": "Tester",
    "country": "France"
}

print(f"📡 Sending POST request to {url}...")

# Sending the POST request with the JSON payload
response = requests.post(url, json=react_data)

# Displaying the result returned by Flask
print(f"Status Code: {response.status_code}")
print("Response JSON:")
print(response.json())