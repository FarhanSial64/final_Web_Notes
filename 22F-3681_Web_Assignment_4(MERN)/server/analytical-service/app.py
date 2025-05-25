from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import MONGO_URI
from .controllers.analyticsController import analytics_bp

app = Flask(__name__)
CORS(app)

client = MongoClient(MONGO_URI)
db = client.get_default_database()

app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

if __name__ == '__main__':
    app.run(port=5002, debug=True)
