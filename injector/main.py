from bs4 import BeautifulSoup
import os, sys

currentdir = os.path.dirname(os.path.abspath(__file__))

BASE_PATH = f"{currentdir}/../RWOz/www.runningwarehouse.com.au"

if __name__ == "__main__":


  for root, dirnames, filenames in os.walk(BASE_PATH):
    for filename in filenames:
      if filename.endswith('.html'):

        file_html_path = f"{root}/{filename}"
        try:

          print(f"Processing file '{file_html_path}' ...")

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
          print(f"FAILED FILE '{file_html_path}'")


        # fname = os.path.join(root, filename)
        # print('Filename: {}'.format(fname))
        # with open(fname) as handle:
        #   soup = BeautifulSoup(handle.read(), 'html.parser')
        #   for item in soup.contents:
        #     if isinstance(item, Doctype):
        #       print('Doctype: {}'.format(item))
        #       break

  # soup = None
  # with open(f'{BASE_PATH}/index.html', 'r', encoding="ISO-8859-1") as f:

  #   contents = f.read()

  #   soup = BeautifulSoup(contents, 'html.parser')
  #   script = soup.new_tag("script")
  #   script['src'] = "https://apid.duckdns.org/apid/js/bundle.js"

  #   link = soup.new_tag("link")
  #   link['href'] = "https://apid.duckdns.org/apid/css/apid.css"



  #   soup.html.head.append(link)
  #   soup.html.body.append(script)
  #   # print(soup.body)    



  # with open(f'{currentdir}/../RWOz/www.runningwarehouse.com.au/index.html', "w", encoding="ISO-8859-1" ) as file:
  #   file.write(str(soup))
