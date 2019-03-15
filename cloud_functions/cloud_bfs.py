import json
import sys
import requests
from bs4 import BeautifulSoup, SoupStrainer
from urllib.parse import urlparse, urljoin
import lxml
import numpy as np
import urllib.robotparser as robot

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
        self.rp = robot.RobotFileParser()
        self.curr_robots_url = ""

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

    def create_soup_with_lxml(self, url):
        r = requests.get(url)
        self.soup = BeautifulSoup(r.text, 'lxml')

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

            # Preparing to respect robots.txt
            self.curr_robots_url = self.convert_to_base_url(currLink) + "/robots.txt" # used for comparison for robots.txt check
            print("Robots: " + self.curr_robots_url) # debugging
            self.rp.set_url(self.curr_robots_url)
            self.rp.read()
        else:
            currLink = URL

        try:
            # Check to see if site is a new external site.
            # Prepare to respect new robots.txt
            # https://docs.python.org/3/library/urllib.robotparser.html
            tmpRobotsURL = self.convert_to_base_url(currLink) + "/robots.txt"
            
            if self.curr_robots_url != tmpRobotsURL:
                self.curr_robots_url = tmpRobotsURL
                self.rp.set_url(self.curr_robots_url)
                self.rp.read()

            if self.rp.can_fetch("*", currLink) == False:
                #print("Respect robots.txt - current: " + currLink)
                pass
            else:
                r = requests.get(currLink)
                counter = 1
                limit = 20
                self.soup = BeautifulSoup(r.text, 'lxml', parse_only=SoupStrainer({'a' : True, 'title' : True}))
                
                #for link in self.soup.find_all('a', recursive=False):
                # https://stackoverflow.com/questions/35465182/how-to-find-all-divs-whos-class-starts-with-a-string-in-beautifulsoup 
                for link in self.soup.find_all("a", href=lambda value: value and value.startswith("http"), recursive=False):
                    #print("link: " + str(link))    # debugging             
                    tmpString = str(link.get('href'))
                    #  Only adds unique links
                    if tmpString not in self.web_links:
                        # Include external links (links only starting with "http")
                        #if tmpString.startswith("http"):
                        if self.rp.can_fetch("*", tmpString) == False:
                            #print("Respect robots.txt - external link: " + tmpString)
                            pass
                        else:
                            self.web_links.append(tmpString)
                            counter += 1
                        #else:
                            # option to include internal links as absolute links
                            # need to respect robots.txt with this option
                            #web_url = self.convert_to_base_url(currLink)
                            #tmpURL = urljoin(web_url,link.get('href'))
                            #if self.rp.can_fetch("*", tmpURL) == False:
                                #print("Respect robots.txt - internal link: " + tmpURL)
                            #    pass
                            #else:
                            #    self.web_links.append(tmpURL) # used to convert relative links to absolute
                            #    counter += 1
                            #pass
                            
                    # this limits the links to speed up BFS
                    if counter > limit:
                        #print("limit reached - breaking")
                        break

                # scrape some other info
                # check to see if title exists
                # https://stackoverflow.com/questions/53876649/beautifulself.soup-nonetype-object-has-no-attribute-gettext
                tmpString = self.soup.title
                tmpString = self.soup.title.get_text() if tmpString else "No Title"
                self.title = str(tmpString)
                self.favicon = self.convert_to_base_url(currLink) + "/favicon.ico"
        except:
            pass

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


class BFS:
    def read_in(self):
        lines = sys.stdin.readlines()
        return json.loads(lines[0])

    def __init__(self, input_list):
        self.keyword = ""

        # check the number of the arguments
        if len(input_list) <= 0:
            lines = self.read_in()
            np_lines = np.array(lines)

            self.rootURL = np_lines[0]
            self.depthNumber = int(np_lines[1])
            self.keyword = np_lines[2]

        else: # run program with parameters
            self.rootURL = input_list[0]
            self.depthNumber = input_list[1]
            if len(input_list) > 2:
                self.keyword = input_list[2]

        self.bot = crawler(self.rootURL) # parse root URL
        self.bot.create_soup(self.rootURL)
        self.bot.add_keyword(self.keyword);
        #print("Keyword: " + self.bot.keyword)

        self.url = []
        self.keyword_url = ""
        self.domainName = []
        self.title = []
        self.favicon = []
        self.source = []
        self.target = []
        self.allSourceTargetLinks = []
        self.JSON_Nodes = {}
        self.JSON_Edges = {}
        self.depthBookmarks = 0
        self.json_nodes_edges = None

        self.start() # initiate the crawl

    def find_source_index(self, num):
        for item in self.allSourceTargetLinks:
            if item[1] == num:
                return item[0]

    def start(self):
        print("**BFS CRAWLING INITIATED**\nURL: " + self.rootURL + "\nDepth: " + str(self.depthNumber) + "\nKeyword: " + self.keyword)

        endLoop = False
        depthCount = 0
        linkIndex = 0

        # Implemented as a do while loop
        while endLoop is False:
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

                if self.keyword != "":
                    self.bot.create_soup_with_lxml(self.rootURL)
                    if self.bot.search_soup() == True:
                        # This print statement to stdout is sent to index.js when a keyword is found
                        #print(self.rootURL + "," + self.url[-1]) # returns to index.js as data, then concat to dataString
                        self.keyword_url = self.rootURL
                        #print(self.rootURL + "," + self.url[-1])
                        endLoop = True
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

            if self.keyword != "" and endLoop is False:
                if self.bot.search_soup() == True:
                    # This print statement to stdout is sent to index.js when a keyword is found
                    #print(self.rootURL + "," + self.url[-1]) # returns to index.js as data, then concat to dataString
                    self.keyword_url = self.url[-1]
                    #print(self.rootURL + "," + self.url[-1])
                    endLoop = True

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
                endLoop = True

        # https://stackoverflow.com/questions/42865013/python-create-array-of-json-objects-from-for-loops
        nodes = [ {"url": u, "domainName": d, "title": t, "favicon": f}
                        for u, d, t, f
                        in zip(self.url, self.domainName, self.title, self.favicon) ]

        edges = [ {"source": s, "target": t} for s, t in zip(self.source, self.target) ]

        # combine the two lists into a dictionary
        nodes_edges = {}
        nodes_edges["nodes"] = nodes
        nodes_edges["edges"] = edges

        # check if a keyword was found
        if self.keyword_url != "":
            nodes_edges["search"] = self.keyword_url
        else:
            nodes_edges["search"] = None

        # convert to JSON string
        JSON_NodesEdges = json.dumps(nodes_edges)

        #with open('data.json', 'w') as outfile:
            #json.dump(nodes_edges, outfile, sort_keys=True, indent=4)

        #print("NodesEdges: " + JSON_NodesEdges)

        self.json_nodes_edges = JSON_NodesEdges

# Initiate crawler for use with front-end site or console arguments
def cloud_bfs(input):
    #j_input = input.get_json() #use on cloud function
    j_input = json.loads(input) #use on local development
    new_url = j_input["url"]
    depth = j_input["depth"]
    keyword = j_input["keyword"]

    try:
        if j_input["keyword"] is None:
            params = [new_url, depth]
            bfs = BFS(params)
        else:
            params = [new_url, depth, keyword]

            bfs = BFS(params)

        return bfs.json_nodes_edges
    except:
        err_msg = {"edges": [], "nodes": []}
        err_return = json.dumps(err_msg)
        return err_return

# Test program, do not use on cloud function
if __name__ == '__main__':
    out = {"url": "https://en.wikipedia.org/wiki/SMALL", "depth": 2, "keyword": None}
    expo = json.dumps(out)
    final = cloud_bfs(expo)
    print(final)