
import json
import random
from crawler import crawler

import requests
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
            #print(self.url, " ", check)
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
        self.soup = BeautifulSoup(r.text, 'html.parser')

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
        self.soup = BeautifulSoup(r.text, 'lxml')
        # web_url = convert_to_base_url(currLink)
        for link in self.soup.find_all('a'):
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
        # https://stackoverflow.com/questions/53876649/beautifulself.soup-nonetype-object-has-no-attribute-gettext
        tmpString = self.soup.title
        tmpString = self.soup.title.get_text() if tmpString else "No Title"
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
        #print(self.dictionary)

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
        #print(len(self.unique_links))

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
       # print("Total links is: ", count)

class dfs():

    def __init__(self):
        self.next_link = ''
        self.nodes = []
        self.edges = []
        self.all_links = []
        self.depth = ''
        self.next_url = ''


#This is the primary function that runs the depth first search
    def run_crawl(self, url):

    # instantiate the crawler class
        dfs_crawl = crawler(url)

    # provide the first url
#dont need to do this as it was passed when instantiated
        dfs_crawl.url = url

    # get the domain
        dfs_crawl.get_domain()

    # get the favicon
        dfs_crawl.get_favicon_2()

    #visit site and create soup
        dfs_crawl.create_soup(dfs_crawl.url)

    #get the title
        dfs_crawl.get_title2()

    # get unique list of links
        dfs_crawl.create_unique_link_list2()

    # get the next link
        if len(dfs_crawl.unique_links) != 0:
            self.next_link = random.choice(dfs_crawl.unique_links)

            source_edge = len(self.nodes)

            node_dict = {"url": dfs_crawl.url, "domainName": dfs_crawl.strip_out_domain(dfs_crawl.url), "title": dfs_crawl.title.text, "favicon": dfs_crawl.favicon}
            self.nodes.append(node_dict)

            target_edge = len(self.nodes)

            edge_dict = {"source": source_edge, "target": target_edge}
            self.edges.append(edge_dict)

            export_json = {"nodes": self.nodes, "edges": self.edges }

    #create json
            json_node = json.dumps(node_dict)


    def search_crawl(self, url, keyword):

        # instantiate the crawler class
        dfs_crawl = crawler(url)

        dfs_crawl.keyword = keyword

        # provide the first url
        # dont need to do this as it was passed when instantiated
        dfs_crawl.url = url

        # get the domain
        dfs_crawl.get_domain()

        # get the favicon
        dfs_crawl.get_favicon_2()

        # visit site and create soup
        dfs_crawl.create_soup(dfs_crawl.url)

        # get the title
        dfs_crawl.get_title2()

        if dfs_crawl.search_soup() == True:

            #print("found ", dfs_crawl.keyword)
            return True

        else:

        # get unique list of links
            dfs_crawl.create_unique_link_list2()

            self.all_links = dfs_crawl.unique_links

        # get the next link
            if len(dfs_crawl.unique_links) != 0:
                self.next_link = random.choice(dfs_crawl.unique_links)

                source_edge = len(self.nodes)

                node_dict = {"url": dfs_crawl.url, "domainName": dfs_crawl.strip_out_domain(dfs_crawl.url),
                             "title": dfs_crawl.title.text, "favicon": dfs_crawl.favicon}
                self.nodes.append(node_dict)

                target_edge = len(self.nodes)

                edge_dict = {"source": source_edge, "target": target_edge}
                self.edges.append(edge_dict)

                export_json = {"nodes": self.nodes, "edges": self.edges}

                # create json
                json_node = json.dumps(node_dict)

#####################################################################
# Class: main
# Author: Brent Freeman
# Class: CS 467 Capstone
# Group: Gudja
# Project: Graphical Web Crawler
# Description: this section executes the dfs search and can either take
# 2 arguments (website and depth) or will run a from a random selection to a depth of 5
#####################################################################
# begin Main
# this is what would normally be the main function, this should be moved to a separeate file that can later call either bfs or dfs



def cloud_dfs(input):

    run_dfs = dfs()

    #use. .loads local testing and get_json for for deployemnt
    #j_input = input.get_json()
    j_input = json.loads(input)

    if j_input["keyword"] is not None:
        keyword = j_input["keyword"]
        depth = j_input["depth"]
        new_url = j_input["url"]

        # add the url to the next link
        run_dfs.next_link = new_url

        # dfs can use a simple for loop to get all the links
        for i in range(0, depth):

            if run_dfs.search_crawl(run_dfs.next_link, keyword):
               # print("found it")
                break
            else:
                # print("not found yet")
                #print(run_dfs.next_link)
                # print("all links: ", run_dfs.all_links)

                continue

        # build the final object for converting to stringified json
        export = {"nodes": run_dfs.nodes, "edges": run_dfs.edges[0:-1]}

        # once we have everything, write it to a file to be viewed by the front end
        export_json = json.dumps(export)

        return export_json

    else:
        depth = j_input["depth"]
        new_url = j_input["url"]

        # add the url to the next link
        run_dfs.next_link = new_url

        # dfs can use a simple for loop to get all the links
        for i in range(0, depth):
            run_dfs.run_crawl(run_dfs.next_link)

        # build the final object for converting to stringified json
        export = {"nodes": run_dfs.nodes, "edges": run_dfs.edges[0:-1]}

        # once we have everything, write it to a file to be viewed by the front end
        export_json = json.dumps(export)

        return export_json

out = {"url": "https://www.ktvu.com", "depth": 2, "keyword": None}
print(out)

expo = json.dumps(out)

print(expo)
final = cloud_dfs(expo)
print(final)
print(type(final))