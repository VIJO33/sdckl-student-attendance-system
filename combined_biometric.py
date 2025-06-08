import usb.core
import usb.util
import http.server
import json
from urllib.parse import urlparse
import threading
import time

class FingerprintDevice:
    def __init__(self):
        self.device = None
        self.endpoint = None
        self.VENDOR_ID = 0x0408
        self.PRODUCT_ID = 0x5090

    def connect(self):
        try:
            self.device = usb.core.find(idVendor=self.VENDOR_ID, idProduct=self.PRODUCT_ID)
            if self.device is None:
                return False, "Device not found"
            self.device.set_configuration()
            cfg = self.device.get_active_configuration()
            intf = cfg[(0,0)]
            self.endpoint = usb.util.find_descriptor(
                intf,
                custom_match = \
                lambda e: \
                    usb.util.endpoint_direction(e.bEndpointAddress) == \
                    usb.util.ENDPOINT_IN
            )
            return True, "Device connected successfully"
        except Exception as e:
            return False, str(e)

    def scan_fingerprint(self):
        try:
            if not self.device:
                return False, "Device not connected"
            self.device.write(1, [0x01])  # Example command to start scan
            data = self.device.read(self.endpoint.bEndpointAddress, self.endpoint.wMaxPacketSize)
            return True, {"data": list(data)}
        except Exception as e:
            return False, str(e)

    def disconnect(self):
        if self.device:
            usb.util.dispose_resources(self.device)
            self.device = None
            self.endpoint = None

class FingerprintServer(http.server.HTTPServer):
    def __init__(self, server_address, handler_class):
        super().__init__(server_address, handler_class)
        self.fingerprint_device = FingerprintDevice()

class FingerprintHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/connect':
            success, message = self.server.fingerprint_device.connect()
            self.send_response(200 if success else 500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': success, 'message': message}).encode())
        elif parsed_path.path == '/scan':
            success, data = self.server.fingerprint_device.scan_fingerprint()
            self.send_response(200 if success else 500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': success, 'data': data}).encode())
        elif parsed_path.path == '/disconnect':
            self.server.fingerprint_device.disconnect()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': 'Device disconnected'}).encode())

def run_server():
    server = FingerprintServer(('localhost', 8001), FingerprintHandler)
    print('Starting fingerprint service on port 8001...')
    server.serve_forever()

# Start the server in a background thread
server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()

# Client functions to interact with the device directly
device = FingerprintDevice()

def connect_device():
    return device.connect()

def scan_fingerprint():
    return device.scan_fingerprint()

def disconnect_device():
    device.disconnect()
    return True, "Device disconnected"

if __name__ == "__main__":
    print("Connecting to biometric device...")
    connect_result = connect_device()
    print(connect_result)

    if connect_result[0]:
        print("Scanning fingerprint...")
        scan_result = scan_fingerprint()
        print(scan_result)

        print("Disconnecting device...")
        disconnect_result = disconnect_device()
        print(disconnect_result)
    else:
        print("Failed to connect to the biometric device.")

    # Keep the server running for a short while to allow any further interaction if needed
    time.sleep(5)
