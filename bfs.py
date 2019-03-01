#####################################################################
# Class: BFS Algorithm
# Author: Long Le
# Class: CS 467 Capstone
# Group: Gudja
# Project: Graphical Web Crawler
# Description: Breadth first search web crawler implemented using
# Python. 
#####################################################################

import sys
import requests
import json
import numpy as np
from crawler import crawler

class BFS:
    def read_in(self):
        lines = sys.stdin.readlines()
        return json.loads(lines[0])

    def __init__(self, *argv):
        self.keyword = ""

        # check the number of the arguments
        if len(argv) <= 0:
            lines = self.read_in()
            np_lines = np.array(lines)

            self.rootURL = np_lines[0]
            self.depthNumber = int(np_lines[1])
            self.keyword = np_lines[2]
        else: # run program with parameters
            self.rootURL = argv[0]
            self.depthNumber = int(argv[1])
            if len(argv) > 2:
                self.keyword = argv[2]

        self.bot = crawler(self.rootURL) # parse root URL
        self.bot.create_soup(self.rootURL)
        self.bot.add_keyword(self.keyword);
        #print("Keyword: " + self.bot.keyword)

        self.url = []
        self.domainName = []
        self.title = []
        self.favicon = []
        self.source = []
        self.target = []
        self.allSourceTargetLinks = []
        self.JSON_Nodes = {}
        self.JSON_Edges = {}
        self.depthBookmarks = 0

        self.start() # initiate the crawl

    def find_source_index(self, num):
        for item in self.allSourceTargetLinks:
            if item[1] == num:
                return item[0]

    def start(self):
        #print("**BFS CRAWLING INITIATED**\n\nUser Entered URL: " + self.rootURL + "\nUser Entered Depth Number: " + str(self.depthNumber))

        depthCount = 0
        linkIndex = 0

        # Implemented as a do while loop
        while True:
            # debugging
            #tmpStr = "\nDepth Number:  " + str(depthCount+1)
            #print( tmpStr )
            #if len(self.url) > 0:
            #    print(self.url[-1])

            # Start BFS algorithm
            # The initial start will utilize the root node url

            if linkIndex == 0:
                # Step 1a: grab all links from root url
                self.bot.get_all_links()

                # Step 2a: initiate visit the root url
                self.url.append(self.bot.web_links[linkIndex])

                # add a bookmark to know when to increase the depth count
                self.depthBookmarks = len(self.bot.web_links)-1
            else:
                # Step 1b: move to next indexed url
                self.url.append(self.bot.web_links[linkIndex])

                # Step 2b: grab links from the current url
                self.bot.get_all_links(self.url[-1])

            # Step 3: scrape information
            self.title.append(self.bot.title)
            self.domainName.append(self.bot.strip_out_domain(self.url[-1]))
            self.favicon.append(self.bot.favicon)

            if linkIndex < len(self.bot.web_links):
                # add to linkDictionary
                beg = linkIndex+1
                end = len(self.bot.web_links)
                for i in range(beg, end):
                    self.allSourceTargetLinks.append(tuple((linkIndex, i)))

                # Step 4: add visited edges - does not include the root
                if( linkIndex > 0 ):
                    self.source.append(self.find_source_index(linkIndex))
                    self.target.append(linkIndex)

            if self.keyword != "": 
                if self.bot.search_soup() == True:
                    # This print statement to stdout is sent to index.js when a keyword is found
                    print(self.rootURL + "," + self.url[-1]) # returns to index.js as data, then concat to dataString  
                    break

            linkIndex += 1

            # see if new BFS level has been reached
            if linkIndex > self.depthBookmarks:
                # set new bookmark
                self.depthBookmarks = len(self.bot.web_links)-1
                # Step 5: increase depth count if applicable
                depthCount += 1

            # debugging
            #self.bot.print_queue()
            #print("\nCurrent Link: " + self.url[-1])
            #print("\nTitles: ")
            #print(self.title)
            #print("\nDomain Names: ")
            #print(self.domainName)
            #print("\nFavicons: ")
            #print(self.favicon)

            # break if user entered depth number is reached or the link index has reached the end of the array
            if depthCount >= self.depthNumber or linkIndex >= len(self.bot.web_links):
                # This print statement to stdout is sent to index.js when there is no keyword entered or it is not found
                print(self.rootURL)
                break

        # https://stackoverflow.com/questions/42865013/python-create-array-of-json-objects-from-for-loops
        nodes = [ {"url": u, "domainName": d, "title": t, "favicon": f}
                        for u, d, t, f
                        in zip(self.url, self.domainName, self.title, self.favicon) ]

        edges = [ {"source": s, "target": t} for s, t in zip(self.source, self.target) ]

        # combine the two lists into a dictionary
        nodes_edges = {}
        nodes_edges["nodes"] = nodes
        nodes_edges["edges"] = edges

        # convert to JSON string
        #JSON_NodesEdges = json.dumps(nodes_edges, sort_keys=True, indent=4);

        with open('data.json', 'w') as outfile:
            json.dump(nodes_edges, outfile, sort_keys=True, indent=4)

        #print(JSON_NodesEdges) # debugging

# Initiate crawler for use with front-end site or console arguments  
def main():
    if len(sys.argv) < 3:
        bfs = BFS() # call BFS for use with front-end site
    elif len(sys.argv) < 4:
        bfs = BFS(sys.argv[1], sys.argv[2]) # use with console arguments
    else:
        bfs = BFS(sys.argv[1], sys.argv[2], sys.argv[3]) # use with console arguments

# Start program
if __name__ == '__main__':
    main()
