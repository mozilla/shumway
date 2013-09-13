#!/usr/bin/env python
import SimpleHTTPServer
 
class MyHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
	def end_headers(self):
		self.send_my_headers()
		SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)
	 
	def send_my_headers(self):
		self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
		self.send_header("Pragma", "no-cache")
		self.send_header("Expires", "0")
 
 
if __name__ == '__main__':
	SimpleHTTPServer.test(HandlerClass=MyHTTPRequestHandler)