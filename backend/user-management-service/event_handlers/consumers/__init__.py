import threading
from .jwt_consumer import start_jwt_consumer

def start_consumers():
    # Start in separate threads
    jwt_thread = threading.Thread(target=start_jwt_consumer, daemon=True)
    
    jwt_thread.start()