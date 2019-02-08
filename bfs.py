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
        self.initiated = False

    def start(self):
        count = 0

        while True:
            tmpStr = "\nDepth Number:  " + str(count+1) + "\n"
            print( tmpStr )

            # Start BFS algorithm 
            # The initial start will utilize the root node url

            if self.initiated is False: 
                # Step 1a: grab all links from root url
                self.bot.get_all_links()

                # Step 2a: initiate visit the root url 
                self.url.append(self.bot.web_links_queue.pop(0))
                self.initiated = True
            else:
                # Step 1b: move to next queued url
                self.url.append(self.bot.web_links_queue.pop(0))
                # Step 2b: initiate visit the current url 
                self.bot.get_all_links(self.url[-1])

            # Step 3: scrape information
            self.title.append(self.bot.title)
            self.domainName.append(self.bot.strip_out_domain(self.url[-1]))
            self.favicon.append(self.bot.favicon)

            # Step 4: increase the depth count
            count += 1

            # debugging
            self.bot.print_queue()
            print("\nCurrent Link: " + self.url[-1])
            print("\nTitles: ")
            print(self.title)
            #self.bot.strip_out_domain(self.url[-1])
            print("\nDomain Names: ")
            print(self.domainName)
            print("\nFavicons: ") 
            print(self.favicon)
            
            # break if user entered depth number is reached or the web link queue is empty
            if count >= self.depthNumber or len(self.bot.web_links_queue) <= 0:
                break

# Test Driver Program
bfs = BFS("https://en.wikipedia.org/wiki/SMALL", 2)
bfs.start()
