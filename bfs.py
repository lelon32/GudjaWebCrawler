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
        self.currentLink = ""

    def start(self):
        count = 0

        #for i in range(self.depthNumber): 
        while True:
            tmpStr = "\nDepth Number:  " + str(count+1) + "\n"
            print( tmpStr )

            # Start BFS 
            self.bot.get_all_links()
            self.currentLink = self.bot.web_links_queue.pop(0)
            count += 1

            # debugging
            print("\nCurrent Link: " + self.currentLink)
            
            if count >= self.depthNumber or len(self.bot.web_links_queue) <= 0:
                break

# Test Driver Program
bfs = BFS("https://en.wikipedia.org/wiki/SMALL", 2)
bfs.start()
