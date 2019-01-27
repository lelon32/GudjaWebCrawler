from crawler import crawler

class dfs():
    pass




dfs_crawl = crawler()

dfs_crawl.get_all_links("https://www.cnn.com")

for link in dfs_crawl.web_links:
    print(link)
