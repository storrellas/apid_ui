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

def html_inject_file(file_html_path, html_files_count = 1, html_files_total = 1):
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

      script_test = soup.html.body.findAll('script',  {"src" : "https://apid.duckdns.org/apid/js/bundle.js"})
      if len(script_test) > 0:
        logger.info(f"File ({html_files_count}/{html_files_total}) '{file_html_path}' already parsed ...")
        return
      

      # Check HTML
      if soup.html is None:
        logger.info(f"Non-parseable file ({html_files_count}/{html_files_total}) '{file_html_path}' ...")
        return

      # Create scripts
      script = soup.new_tag("script")
      script['src'] = "https://apid.duckdns.org/apid/js/bundle.js"

      link = soup.new_tag("link")
      link['href'] = "https://apid.duckdns.org/apid/css/apid.css"
      link['rel'] = "stylesheet"


      # Append both tags
      soup.html.head.append(link)
      soup.html.body.append(script)
      # print(soup.body)    

    if soup.html is None:
      return

    soup_str = str(soup.prettify())
    # Write file
    with open(file_html_path, "w") as file:
      file.write( soup_str )
    logger.info(f"Completed file ({html_files_count}/{html_files_total}) '{file_html_path}' ...")
  except Exception as e:
    logger.error(f"FAILED FILE '{file_html_path}'")
    logger.error(str(e))
    traceback.print_exc()

if __name__ == "__main__":
  # Parser
  parser = argparse.ArgumentParser(description='Injector HTML')
  parser.add_argument('-b', '--path', type=str, help='Introduces the path for processing file')
  parser.add_argument('-f', '--file', type=str, help='Introduces the file to process')
  args = parser.parse_args()

  # Check folder exists
  if args.path and os.path.isdir(args.path) == False:
    logger.error(f"Folder '{args.base_path}' does not exist")
    sys.exit(0)

  # Check folder exists
  if args.file and os.path.isfile(args.file) == False:
    logger.error(f"Folder '{args.base_path}' does not exist")
    sys.exit(0)

  if args.path is None and args.file is None:
    logger.error(f"Should select either path of file")
    sys.exit(0)

  BASE_PATH = args.path
  
  ##
  if args.file:
    html_inject_file(args.file)
    sys.exit(0)


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
        file_html_path = f"{root}/{filename}"
        html_inject_file(file_html_path, html_files_count, html_files_total)

        # # Generating path
        
        # try:

        #   # print(f"Processing file ({html_files_count}/{html_files_total}) '{file_html_path}' ...")
        #   logger.info(f"Processing file ({html_files_count}/{html_files_total}) '{file_html_path}' ...")

        #   # Read file
        #   soup = None
        #   with open(file_html_path, 'r', encoding="ISO-8859-1") as f:

        #     # Read file
        #     contents = f.read()
        #     # Process with Beautifulsoup
        #     soup = BeautifulSoup(contents, 'html.parser')

        #     # Check HTML
        #     if soup.html:

        #       script = soup.new_tag("script")
        #       script['src'] = "https://apid.duckdns.org/apid/js/bundle.js"

        #       link = soup.new_tag("link")
        #       link['href'] = "https://apid.duckdns.org/apid/css/apid.css"
        #       link['rel'] = "stylesheet"


        #       # Append both tags
        #       soup.html.head.append(link)
        #       soup.html.body.append(script)
        #       # print(soup.body)    


        #   # Write file
        #   if soup:
        #     with open(file_html_path, "w", encoding="ISO-8859-1" ) as file:
        #       file.write(str(soup))
        # except Exception as e:
        #   logger.error(f"FAILED FILE '{file_html_path}'")
        #   logger.error(str(e))
        #   traceback.print_exc()

