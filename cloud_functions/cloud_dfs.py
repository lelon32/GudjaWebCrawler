import json
import random
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

# Crawler Class
# Uses BeautifulSoup to parse information from web pages

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

# searches the soup for the keyword
# returns true if found
    def search_soup(self):
        check = self.soup.get_text().find(self.keyword)
        if check != -1:
            return True
        return False

#checks if url has a full scheme
    def check_url_allow_internal(self, url):
        parse = urlparse(url)
        if parse.scheme == 'http' or parse.scheme == 'https':
            return True
        return False

# Creates the soup to be used in other methods
    def create_soup(self, url):
        r = requests.get(url)
        self.soup = BeautifulSoup(r.text, 'html.parser')

# Creates the unique links by first adding all links (determined by href in beautifu soup),
# checking if they have data (some hrefs are empty), calling check_url and then using set to
# remove duplicates and making that into a list of "good" links
#
    def create_unique_link_list2(self):
        temp_list = []
        for link in self.soup.find_all('a'):
            if link is not None:
                if self.check_url_allow_internal(link.get('href')):
                    temp_list.append(link.get('href'))

        tset = set(temp_list)
        self.unique_links = list(tset)

# gets the domain of a url
    def get_domain(self):
        temp = urlparse(self.url)
        self.domain = temp.netloc

# appends a favicon to the base url
# does not check if favicon exists
    def get_favicon(self):
        temp = urlparse(self.url)
        base = temp.netloc
        self.favicon = base + "/favicon.ico"

# gets the web page title
    def get_title(self):
        self.title = self.soup.title



# Description: Used to strip a URL to its domain name
# https://www.quora.com/How-do-I-extract-only-the-domain-name-from-an-URL

    def strip_out_domain(self, URL):
        domain = URL.split("//")[-1].split("/")[0]
        domain = domain.split(".")[-2]
        return domain



# dfs Class to run a depth first search
# using the crawler class above.

class dfs():

    def __init__(self):
        self.next_link = ''
        self.nodes = []
        self.edges = []
        self.all_links = []
        self.depth = ''
        self.next_url = ''
        self.found_url = None


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
        dfs_crawl.get_favicon()

    #visit site and create soup
        dfs_crawl.create_soup(dfs_crawl.url)

    #get the title
        dfs_crawl.get_title()

    # get unique list of links
        dfs_crawl.create_unique_link_list2()

    # get the next link
        if len(dfs_crawl.unique_links) != 0: #avoid reaching outside of the list
            self.next_link = random.choice(dfs_crawl.unique_links)

            source_edge = len(self.nodes)

            node_dict = {"url": dfs_crawl.url, "domainName": dfs_crawl.strip_out_domain(dfs_crawl.url), "title": dfs_crawl.title.text, "favicon": dfs_crawl.favicon}
            self.nodes.append(node_dict)

            target_edge = len(self.nodes)

            edge_dict = {"source": source_edge, "target": target_edge}
            self.edges.append(edge_dict)


    # Executes a single crawl while employing a search
    # method that if found
    #
    def search_crawl(self, url, keyword):

        # instantiate the crawler class
        dfs_crawl = crawler(url)

        dfs_crawl.keyword = keyword

        # provide the first url
        dfs_crawl.url = url

        # get the domain
        dfs_crawl.get_domain()

        # get the favicon
        dfs_crawl.get_favicon()

        # visit site and create soup
        dfs_crawl.create_soup(dfs_crawl.url)

        # get the title
        dfs_crawl.get_title()

        if dfs_crawl.search_soup() == True:

            print("found ", dfs_crawl.keyword)
            self.found_url = dfs_crawl.url

            source_edge = len(self.nodes)

            node_dict = {"url": dfs_crawl.url, "domainName": dfs_crawl.strip_out_domain(dfs_crawl.url),
                         "title": dfs_crawl.title.text, "favicon": dfs_crawl.favicon}
            self.nodes.append(node_dict)

            target_edge = len(self.nodes)

            edge_dict = {"source": source_edge, "target": target_edge}
            self.edges.append(edge_dict)
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



# This is the primary Function that is called when
# an http request is sent to the Google Cloud Function
# URL. It instantiates the dfs class ans uses the crawler
# class to perform the search and return the JSON result
# Modify input method for local testing or Cloud deployement
# Method is wrapped in a try/except to help catch errors
# and will return empty JSON if an exception is raised

def cloud_dfs(input):
    try:
        run_dfs = dfs()

        #j_input = input.get_json() # Use fo GCF deployement
        j_input = json.loads(input) # Use for local testing

        if j_input["keyword"] is not None:
            keyword = j_input["keyword"]
            depth = j_input["depth"]
            new_url = j_input["url"]
            # add the url to the next link
            run_dfs.next_link = new_url

            # dfs can use a simple for loop to get all the links
            for i in range(0, depth):
                if run_dfs.search_crawl(run_dfs.next_link, keyword):
                    break
                else:
                    continue

            # build the final object for converting to stringified json
            export = {"nodes": run_dfs.nodes, "edges": run_dfs.edges[0:-1], "search": run_dfs.found_url}

            # once we have everything, write it to a file to be viewed by the front end
            export_json = json.dumps(export)

            return export_json

        else:
            #same as above except the search
            depth = j_input["depth"]
            new_url = j_input["url"]

            # add the url to the next link
            run_dfs.next_link = new_url

            # dfs can use a simple for loop to get all the links
            for i in range(0, depth):
                run_dfs.run_crawl(run_dfs.next_link)

            # build the final object for converting to stringified json
            export = {"nodes": run_dfs.nodes, "edges": run_dfs.edges[0:-1], "search": None}

            # once we have everything, write it to a file to be viewed by the front end
            export_json = json.dumps(export)

            return export_json
    except:
        #empty object to alert that there was an error
        err_msg = {"edges": [], "nodes": []}
        err_return = json.dumps(err_msg)
        return err_return


# "Main" below to test cloud function locally
#
out = {"url": "https://en.wikipedia.org/wiki/Main_Page", "depth": 23, "keyword": "twitter"}
expo = json.dumps(out)
final = cloud_dfs(expo)
print(final)
