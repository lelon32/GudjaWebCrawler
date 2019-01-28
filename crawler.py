import sys
import requests
from datetime  import datetime
#sys.path.insert(0, 'lib') #use this on GCP
from bs4 import BeautifulSoup

class crawler():

    def __init__(self, url):
        self.url = url
        self.web_links = []
        self.favicon = ''


    def get_all_links(self):
        r = requests.get(self.url)
        soup = BeautifulSoup(r.text, 'html.parser')
        count = 0
        for link in soup.find_all('a'):
            self.web_links.append(link.get('href'))

            #print(link.get('href'))


    def get_rel_links(self):
        r = requests.get(self.url)
        soup = BeautifulSoup(r.text, 'html.parser')
        count = 0
        for link in soup.find_all('a'):
            self.web_links.append(link.get('href'))

    def get_favicon(self):
        # need to add some checks here to return a blank or default favicon if none exists
        self.favicon = self.url + "/favicon.ico"

    # method to check that urls have correct syntax
    def check_urls(self):
        pass

    # method to add links to data structure
    def build_tree(self):
        pass


    # method to return data to server
    def send_tree(self):
        pass



    # I created this so we can hava static document to test on
    def write_to_file(self):
        r = requests.get(self.url)
        f = open("giz.txt", "w+")
        for line in r.text:
            f.write(line)
        f.close()