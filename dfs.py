import sys
import json

import random
import requests
from datetime  import datetime
sys.path.insert(0, 'lib') #use this on GCP
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from crawler import crawler


class dfs():

    def __init__(self):
        self.next_link = ''
        self.nodes = []
        self.edges = []
        self.all_links = []


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

    #build the object
            #nodes_url = {"url": dfs_crawl.url}
            #nodes_domain = {"domainName": dfs_crawl.domain}
            #nodes_title = {"title": dfs_crawl.title}
            #nodes_favicon = {"favicon": dfs_crawl.favicon}

            source_edge = len(self.nodes)

            node_dict = {"url": dfs_crawl.url, "domainName": dfs_crawl.strip_out_domain(dfs_crawl.url), "title": dfs_crawl.title.text, "favicon": dfs_crawl.favicon}
            self.nodes.append(node_dict)

            target_edge = len(self.nodes)

            edge_dict = {"source": source_edge, "target": target_edge}
            self.edges.append(edge_dict)

            export_json = {"nodes": self.nodes, "edges": self.edges }

    #create json
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

#instantiate the dfs class
run_dfs = dfs()

#here are some test links that i use during testing
test_links = ["https://www.cnn.com", "https://www.oregonlive.com", "https://www.gizmodo.com", "https://www.stackexchange.com", "https://www.engadget.com", "https://xkcd.com", "https://www.wired.com"]

#print(len(sys.argv))
if len(sys.argv) == 3:
    new_url = sys.argv[1]
    depth = int(sys.argv[2])

else:
    depth = 5
    new_url = random.choice(test_links)

#add the url to the next link
run_dfs.next_link = new_url


#dfs can use a simple for loop to get all the links
for i in range(0, depth):
    run_dfs.run_crawl(run_dfs.next_link)

#build the final object for converting to stringified json
export = {"nodes": run_dfs.nodes, "edges": run_dfs.edges[0:-1] }

#create json
#export_json = json.dumps(export)

#print out the stingified json to console (where it can be picked up by)
#print(export_json)

with open('data.json', 'w+') as outfile:
    json.dump(export, outfile)


