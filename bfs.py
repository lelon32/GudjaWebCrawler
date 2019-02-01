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
from crawler import crawler

class BFS:
    def __init__(self, URL):
        self.bot = crawler(URL)

    def start(self):
        self.bot.get_all_links()

# Test
bfs = BFS("https://en.wikipedia.org/wiki/SMALL")
bfs.start()
