from crawler import crawler
import sys

class dfs():
    pass





# Code Execution begins here, may move to another file
dfs_crawl = crawler(sys.argv[1])

#dfs_crawl.get_all_links()
dfs_crawl.write_to_file()
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
#
#
# https://www.jetbrains.com/help/pycharm/commit-and-push-changes.html#push
#