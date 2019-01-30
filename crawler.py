#####################################################################
# Class: Crawler 
# Author: Brent Freeman, Long Le
# Class: CS 467 Capstone
# Group: Gudja
# Project: Graphical Web Crawler
# Description: 
#
#####################################################################

import sys
import requests
from datetime  import datetime
#sys.path.insert(0, 'lib') #use this on GCP
from bs4 import BeautifulSoup
from urlparse import urljoin # used to convert relative links to absolute

class crawler():

    def __init__(self, url):
        self.url = url
        self.web_links = []
        self.favicon = ''
        self.page_data = ''
        self.dictionary = {}


    def get_all_links_and_put_them_in_a_dictionary(self):
        r = requests.get(self.url)
        soup = BeautifulSoup(r.text, 'html.parser')
        count = 1
        for link in soup.find_all('a'):
            self.web_links.append(link.get('href'))
            self.dictionary[count] = link.get('href')
            count += 1

            #print(link.get('href'))
        print(self.dictionary)

    #####################################################################
    # Description: Long - Using to test  
    # Testing Relative Links Conversion
    # Testing Dictionary Title:URL pair
    # https://stackoverflow.com/questions/44001007/scrape-the-absolute-url-instead-of-a-relative-path-in-python 
    #####################################################################
    def get_all_links(self):
        r = requests.get(self.url)
        soup = BeautifulSoup(r.text, 'lxml')
        depthCount = 0 # for use with user entered limit
        web_url = "https://en.wikipedia.org/"
        for link in soup.find_all('a'):
            self.web_links.append(urljoin(web_url,link.get('href'))) # used to convert relative links to absolute

        for i in self.web_links:
            print(i)

    def get_rel_links(self):
        r = requests.get(self.url)
        soup = BeautifulSoup(r.text, 'html.parser')
        count = 0
        for link in soup.find_all('a'):
            self.web_links.append(link.get('href'))

    def get_favicon_and_add_to_dictionary(self):
        # need to add some checks here to return a blank or default favicon if none exists
        self.favicon = self.url + "/favicon.ico"
        self.dictionary["favicon"] = self.favicon

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


    #method to open file and use its data for testing BS4
    def open_file_test(self):
        f = open("giz.txt", 'r')
        soup = BeautifulSoup(f, "html.parser")
        for link in soup.find_all('a'):
            self.web_links.append(link.get('href'))
