from crawler import crawler
import sys
import json
from urllib.parse import urlparse
import random

class dfs():

    def __init__(self):
        self.next_link = ''
        self.nodes = []
        self.edges = []


#This is the primary function that ruuns the depth first search
    def run_crawl(self, url):
        source_edge = len(self.nodes)

    # instantiate the crawler class
        dfs_crawl = crawler()

    # provide the first url
        dfs_crawl.url = url

    # get the domain
        dfs_crawl.get_domain()

    # get the favicon
        dfs_crawl.get_favicon()

    #visit site and create soup
        dfs_crawl.create_soup()

    #get the title
        dfs_crawl.get_title()

    # get unique list of links
        dfs_crawl.create_unique_link_list()

    # get the next link
        if len(dfs_crawl.unique_links) != 0:
            self.next_link = random.choice(dfs_crawl.unique_links)

    #build the object
            nodes_url = {"url": dfs_crawl.url}
            nodes_domain = {"domainName": dfs_crawl.domain}
            nodes_title = {"title": dfs_crawl.title}
            nodes_favicon = {"favicon": dfs_crawl.favicon}

            node_dict = {"url": dfs_crawl.url, "domainName": dfs_crawl.domain, "title": dfs_crawl.title.text, "favicon": dfs_crawl.favicon}
            self.nodes.append(node_dict)

            target_edge = len(self.nodes)

            edge_dict = {"source": source_edge, "target": target_edge}
            self.edges.append(edge_dict)

            export_json = {"nodes": self.nodes, "edges": self.edges }

    #create json
            json_node = json.dumps(node_dict)

# begin Main
# this is what would normally be the main function, this should be moved to a separeate file that can later call either bfs or dfs

#instantiate the dfs class
run_dfs = dfs()

#here are some test links that i use during testing
test_links = ["http://www.cnn.com", "http://www.oregonlive.com", "http://www.gizmodo.com", "http://www.stackexchange.com", "http://www.engadget.com", "http://xkcd.com", "http://www.wired.com"]

print(len(sys.argv))
if len(sys.argv) == 3:
    new_url = sys.argv[1]
    depth = sys.argv[2]
    print("url is ", new_url)
    print("depth is ", depth)
else:
    depth = 5
    new_url = random.choice(test_links)

#add the url to the next link
run_dfs.next_link = new_url


#dfs can use a simple for loop to get all the links
for i in range(0, depth):
    run_dfs.run_crawl(run_dfs.next_link)

#build the final object for converting to stringified json
export = {"nodes": run_dfs.nodes, "edges": run_dfs.edges }

#create json
export_json = json.dumps(export)

#print out the stingified json to console (where it can be picked up by)
print(export_json)


# Resources I used
# https://www.crummy.com/software/BeautifulSoup/bs4/doc/
# http://blog.adnansiddiqi.me/tag/scraping/
# https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/
# https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
# https://stackoverflow.com/questions/48136501/run-python-script-from-index-js-cloud-function
# https://stackoverflow.com/questions/45092342/using-google-cloud-function-to-spawn-a-python-script
# https://www.scrapehero.com/how-to-prevent-getting-blacklisted-while-scraping/
# https://stackoverflow.com/questions/43052290/representing-a-graph-in-json
# https://www.reddit.com/r/learnpython/comments/1br6u6/how_do_i_pass_arguments_to_a_py_script_in_pycharm/
# https://stackoverflow.com/questions/46941312/python-create-dictionary-from-lines-of-txt-file
# https://www.geeksforgeeks.org/working-with-json-data-in-python/
# https://www.jetbrains.com/help/pycharm/commit-and-push-changes.html#push
# https://www.peterbe.com/plog/uniqifiers-benchmark
# https://cloud.google.com/appengine/docs/standard/python/tools/using-libraries-python-27