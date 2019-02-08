#####################################################################
# Class: BFS Algorithm
# Author: Long Le
# Class: CS 467 Capstone
# Group: Gudja
# Project: Graphical Web Crawler
# Description: 
#
#####################################################################

import requests
import json
from crawler import crawler

class BFS:
    def __init__(self, URL, userEnteredDepth):
        self.bot = crawler(URL)
        self.depthNumber = userEnteredDepth
        self.url = []
        self.domainName = []
        self.title = []
        self.favicon = []
        self.source = []
        self.target = []
        self.JSON_Nodes = {}
        self.JSON_Edges = {}

    def start(self):
        depthCount = 0
        linkIndex = 0

        # Implemented as a do while loop
        while True:
            tmpStr = "\nDepth Number:  " + str(depthCount+1)
            print( tmpStr )

            # Start BFS algorithm 
            # The initial start will utilize the root node url

            if linkIndex == 0: 
                # Step 1a: grab all links from root url
                self.bot.get_all_links()

                # Step 2a: initiate visit the root url 
                self.url.append(self.bot.web_links[linkIndex])
            else:
                # Step 1b: move to next indexed url
                self.url.append(self.bot.web_links[linkIndex])
                
                # Step 2b: grab links from the current url 
                self.bot.get_all_links(self.url[-1])

            # Step 3: scrape information
            self.title.append(self.bot.title)
            self.domainName.append(self.bot.strip_out_domain(self.url[-1]))
            self.favicon.append(self.bot.favicon)

            # Step 4: add edges
            beg = linkIndex+1
            end = len(self.bot.web_links)
            for i in range(beg, end):
                self.source.append(linkIndex)
                self.target.append(i)

            linkIndex += 1

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
                break

        # https://stackoverflow.com/questions/42865013/python-create-array-of-json-objects-from-for-loops    
        nodes = [ {"url": u, "domainName": d, "title": t, "favicon": f} 
                        for u, d, t, f 
                        in zip(self.url, self.domainName, self.title, self.favicon) ] 

        edges = [ {"source": s, "target": t} for s, t in zip(self.source, self.target) ]

        self.JSON_Nodes = json.dumps(nodes)
        self.JSON_Edges = json.dumps(edges)

        # debugging
        # print("\nNodes: \n")
        # print(nodes)

        print("\nJSON Nodes: \n")
        print(self.getNodes())

        print("\nJSON Edges: \n")
        print(self.getEdges())

    def getNodes(self):
        return self.JSON_Nodes

    def getEdges(self):
        return self.JSON_Edges

# Test Driver Program
bfs = BFS("https://en.wikipedia.org/wiki/SMALL", 2)
bfs.start()
