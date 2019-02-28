#####################################################################
# Class: Crawler
# Author: Brent Freeman, Long Le
# Class: CS 467 Capstone
# Group: Gudja
# Project: Graphical Web Crawler
# Description: HTML parser using Beautiful Soup 4.
#####################################################################

import sys
import requests
from datetime  import datetime
#sys.path.insert(0, 'lib') #use this on GCP
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import lxml

class crawler():

    def __init__(self, url):
        self.url = url
        self.web_links = []
        self.favicon = ''
        self.page_data = ''
        self.dictionary = {}
        self.unique_links = []
        self.soup = None
        self.domain = ""
        self.title = ""
        self.keyword = ""

    def add_keyword(self, keyword):
        self.keyword = keyword

    def search_soup(self):
        check = self.soup.get_text().find(self.keyword)
        if check != -1:
            print(self.url, " ", check)
            return True
        return False

    def check_url(self, url):
        parse = urlparse(url)
        page_host = urlparse(self.url).netloc
        if parse.scheme == 'http' or parse.scheme == 'https':
            if parse.netloc != page_host:
                return True
        return False

    def create_soup(self, url):
        r = requests.get(url)
        self.soup = BeautifulSoup(r.text, 'lxml')

    def create_unique_link_list2(self):
        temp_list = []
        for link in self.soup.find_all('a'):
            if link is not None:
                if self.check_url(link.get('href')):
                    temp_list.append(link.get('href'))

        tset = set(temp_list)
        self.unique_links = list(tset)

    def create_unique_link_list(self):
        temp_list = []
        for link in self.soup.find_all('a'):
            if link is not None:
                temp_list.append(link.get('href'))
        self.unique_links = set(temp_list)

    def get_domain(self):
        temp = urlparse(self.url)
        self.domain = temp.netloc

    def get_favicon(self):
        self.favicon = self.favicon = self.url + "/favicon.ico"

    def get_favicon_2(self):
        temp = urlparse(self.url)
        base = temp.netloc
        self.favicon = base + "/favicon.ico"

    def get_title2(self):
        self.title = self.soup.title

    # Maybe need to use this later
    # https://www.geeksforgeeks.org/python-remove-duplicates-list/   
    def remove(self, duplicate): 
        final_list = [] 
        for num in duplicate: 
            if num not in final_list: 
                final_list.append(num) 
        return final_list  

    #####################################################################
    # Description: Finds all links on the current URL page. Uses lxml parser.
    # https://stackoverflow.com/questions/44001007/scrape-the-absolute-url-instead-of-a-relative-path-in-python
    #####################################################################
    def get_all_links(self, URL=None):

        # check if URL parameter is passed; use root url otherwise
        currLink = ""
        if URL is None:
            currLink = self.url
            self.web_links.append(currLink)
        else:
            currLink = URL

        r = requests.get(currLink)
        soup = BeautifulSoup(r.text, 'lxml')
        # web_url = convert_to_base_url(currLink)
        for link in soup.find_all('a'):
            tmpString = str(link.get('href'))
            # Include external links (links only starting with "http") and only adds unique links 
            if tmpString.startswith("http") and tmpString not in self.web_links:
                self.web_links.append(tmpString)
            else:
                # option to include internal links as absolute links
                # self.web_links.append(urljoin(web_url,link.get('href'))) # used to convert relative links to absolute
                pass

        # scrape some other info
        # check to see if title exists
        # https://stackoverflow.com/questions/53876649/beautifulsoup-nonetype-object-has-no-attribute-gettext
        tmpString = soup.title
        tmpString = soup.title.get_text() if tmpString else "No Title"
        self.title = str(tmpString) 
        self.favicon = self.convert_to_base_url(currLink) + "/favicon.ico"

    # for debugging
    def print_queue(self):
        print("Queue: \n")
        for i in self.web_links:
            print(i)

    #####################################################################
    # Description: Used to strip a URL to its domain name 
    # https://www.quora.com/How-do-I-extract-only-the-domain-name-from-an-URL
    #####################################################################
    def strip_out_domain(self, URL):
        domain = URL.split("//")[-1].split("/")[0]
        domain = domain.split(".")[-2]
        return domain

    #####################################################################
    # Description: Used to strip a URL to its base URL 
    # https://www.quora.com/How-do-I-extract-only-the-domain-name-from-an-URL
    #####################################################################
    def convert_to_base_url(self, URL):
        baseURL = urlparse(URL)
        return baseURL.scheme + "://" + baseURL.netloc

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

    def get_all_links_and_add_them_to_a_list_from_file(self,):
        r = requests.get(self.url)
        soup = BeautifulSoup(r.text, 'html.parser')
        for link in soup.find_all('a'):
            if link is not None:
                self.web_links.append(link.get('href'))

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

    def create_unique_list(self):
        self.unique_links = set(self.web_links)
        print(len(self.unique_links))

    # I created this so we can hava static document to test on
    def write_website_to_file(self):
        r = requests.get(self.url)
        f = open("giz.txt", "w+")
        for line in r.text:
            f.write(line)
        f.close()

    def write_data_structure_to_file(self, data, name):
        f = open(name, "w+")
        for entry in data:
            if entry is not None:
                f.write("%s\n" % entry)
        f.close()

    #method to open file and use its data for testing BS4
    def open_file_test(self):
        test_file = open("giz.txt", 'r')
        soup = BeautifulSoup(test_file, "html.parser")
        count = 0
        for link in soup.find_all('a'):
            self.web_links.append(link.get('href'))
            count += 1
        print("Total links is: ", count)
