from crawler import crawler
import sys
import json
from urllib.parse import urlparse
import random

class dfs():
    pass

#new


# Live tests
# Code Execution begins here, may move to another file

# create the crawler with provided url
#pycharm set to send an argument at execution
dfs_crawl = crawler(sys.argv[1])

# get the domain
dfs_crawl.get_domain()

# get the favicon
dfs_crawl.get_favicon()



#visit site and create soup
# still need to determine where the URL should 'live'
dfs_crawl.create_soup(dfs_crawl.url)

#get the title
dfs_crawl.get_title()

# get unique list of links
dfs_crawl.create_unique_link_list()

# get the next link
#Wnext_link = random.choice(dfs_crawl.unique_links)

#build object
nodes_url = {"url": dfs_crawl.url}
nodes_domain = {"domainName": dfs_crawl.domain}
nodes_title = {"title": dfs_crawl.title}
nodes_favicon = {"favicon": dfs_crawl.favicon}

node_dict = {"nodes": [{"url": dfs_crawl.url, "domainName": dfs_crawl.domain, "title": dfs_crawl.title.text, "favicon": dfs_crawl.favicon}]}


#create json


json_node = json.dumps(node_dict)

print("here is the JSON data")
print(node_dict)
print(json_node)


#dfs_crawl.get_all_links_and_put_them_in_a_dictionary()

#dfs_crawl.get_favicon_and_add_to_dictionary()

#json_data = json.dumps(dfs_crawl.dictionary)

#print("here is the JSON data: ")
#print(json_data)



# File IO tests
#dfs_crawl.write_to_file()
#for link in dfs_crawl.web_links:
#    print(link)

#dfs_crawl.open_file_test()
#print(dfs_crawl.web_links)

#dfs_crawl.create_unique_list()
#dfs_crawl.write_data_structure_to_file(dfs_crawl.unique_links, "unique_gizmodo_links.txt")
#print(dfs_crawl.unique_links)

#for link in dfs_crawl.web_links:
#    print(link)



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