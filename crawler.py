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
#from urllib.parse import urlparse


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


    def create_soup(self, url):
        r = requests.get(url)
        self.soup = BeautifulSoup(r.text, 'html.parser')

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

    def get_title(self):
        self.title = self.soup.title

    # https://www.geeksforgeeks.org/python-remove-duplicates-list/   
    def remove(self, duplicate): 
        final_list = [] 
        for num in duplicate: 
            if num not in final_list: 
                final_list.append(num) 
        return final_list  

    #####################################################################
    # Description: Long - Using to test BFS search
    # Testing Relative Links Conversion
    # Testing Dictionary Title:URL pair
    # https://stackoverflow.com/questions/44001007/scrape-the-absolute-url-instead-of-a-relative-path-in-python
    #####################################################################
    def get_all_links(self):
        r = requests.get(self.url)
        soup = BeautifulSoup(r.text, 'lxml')
        depthCount = 0 # for use with user entered limit
        web_url = "https://en.wikipedia.org/wiki/SMALL"
        for link in soup.find_all('a'):
            tmpString = str(link.get('href'))
            # Include external links (links only starting with "http")
            if tmpString.startswith("http"):
                self.web_links.append(tmpString);
            else:
                # option to include internal links as absolute links
                # self.web_links.append(urljoin(web_url,link.get('href'))) # used to convert relative links to absolute
                pass

        # remove duplicates
        self.web_links = self.remove(self.web_links)
        
        # for debugging
        for i in self.web_links:
            print(i)


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

    # method to check that urls have correct syntax
    def check_urls(self):
        pass

    # method to add links to data structure
    def build_tree(self):
        pass


    # method to return data to server
    def send_tree(self):
        pass

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
