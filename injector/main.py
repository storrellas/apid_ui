from bs4 import BeautifulSoup
import os, sys

currentdir = os.path.dirname(os.path.abspath(__file__))

BASE_PATH = f"{currentdir}/../RWOz/www.runningwarehouse.com.au"

if __name__ == "__main__":


  soup = None
  with open(f'{BASE_PATH}/index.html', 'r', encoding="ISO-8859-1") as f:

    contents = f.read()

    soup = BeautifulSoup(contents, 'html.parser')
    script = soup.new_tag("script")
    script['src'] = "https://apid.duckdns.org/apid/js/bundle.js"

    link = soup.new_tag("link")
    link['href'] = "https://apid.duckdns.org/apid/css/apid.css"



    soup.html.head.append(link)
    soup.html.body.append(script)
    # print(soup.body)    



  with open(f'{currentdir}/../RWOz/www.runningwarehouse.com.au/index.html', "w", encoding="ISO-8859-1" ) as file:
    file.write(str(soup))
