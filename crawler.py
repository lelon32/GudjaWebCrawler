import sys
import requests
from datetime  import datetime
#sys.path.insert(0, 'lib') #use this on GCP
from bs4 import BeautifulSoup

class crawler():

    def __init__(self):
        self.web_links = []
        self.favicon = ''


    def get_all_links(self, url):
        r = requests.get(url)
        soup = BeautifulSoup(r.text, 'html.parser')
        count = 0
        for link in soup.find_all('a'):
            self.web_links.append(link.get('href'))

            #print(link.get('href'))
