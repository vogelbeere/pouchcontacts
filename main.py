from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
import os
import requests
from oauth import oauth 
import httplib

class MainPage(webapp.RequestHandler):
  def get(self):
    self.redirect('/index.html')

class CORSEnabledHandler(webapp.RequestHandler):
	def get(self, path):
		path = os.path.join(os.path.dirname(__file__), 'static', path.split('/')[-1])
		self.response.headers.add_header("Access-Control-Allow-Origin", "*")
# any type
		self.response.headers['Content-Type'] = '*.*'
		self.response.out.write(open(path, 'rb').read())

application = webapp.WSGIApplication(

        [('/(.+)$', CORSEnabledHandler),
        ('/', MainPage)], 
    debug=True)

# ssh -N -L 5984:127.0.0.1:5984 -i ppk-google-cloud-couchdb-admin bitnami@35.195.181.16
# requests.get('http://bitnami@35.195.181.16%0A%0Acurl')



def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
	
# https://github.com/BauweBijl/gaecors

# Enable CORS (Cross-Origin Resource Sharing) with static hosted content on Google Appengine

	
# couchDbConnName = os.environ.get("COUCHDB_CONNECTION_NAME")
# couchDbUser = os.environ.get("COUCHDB_USER")
# couchDbPassword = os.environ.get("COUCHDB_PASSWORD")
# couchDb = os.environ.get("COUCHDB_DATABASE")

# URL = 'http://localhost:5984/_session'
# CONSUMER_KEY = 'consumer1'
# CONSUMER_SECRET = 'sekr1t'
# TOKEN = 'token1'
# SECRET = 'tokensekr1t'

# consumer = oauth.OAuthConsumer(CONSUMER_KEY, CONSUMER_SECRET)
# token = oauth.OAuthToken(TOKEN, SECRET)
# req = oauth.OAuthRequest.from_consumer_and_token(
    # consumer,
    # token=token,
    # http_method='GET',
    # http_url=URL,
    # parameters={}
# )
# req.sign_request(oauth.OAuthSignatureMethod_HMAC_SHA1(), consumer,token)

# headers = req.to_header()
# headers['Accept'] = 'application/json'

# con = httplib.HTTPConnection('localhost', 5984)
# con.request('GET', URL, headers=headers)
# resp = con.getresponse()