#####################################################################
#
# Class: BFS Algorithm
# Author: Long Le
# Class: CS 467 Capstone
# Group: Gudja
# Project: Graphical Web Crawler
# Description: 
#
#
#####################################################################

import requests
from crawler import crawler

class BFS:
    # Python list used as a Queue to hold the next layer of URLs
    URL_queue = []
    currentURL = "" 

    def __init__(self, URL):
        pass

# Test
bfs = BFS_Crawler("https://en.wikipedia.org/wiki/Cat")
bfs.get_all_links()
