#!/bin/bash
cd "$(dirname "$0")"
git pull origin master
npm run compile
# Upload to server
echo "------------------"
echo "Deploying to apid.duckdns.org ..."
echo "------------------"
ssh apid -t "cd workspace/apid_ui/ && rm -r *"
scp -r public/* apid:/home/ubuntu/workspace/apid_ui


echo "------------------"
echo "Deploying to runningwarehouse.duckdns.org ..."
echo "------------------"

ssh -tt apid "rm -r /home/ubuntu/workspace/RWOz/www.runningwarehouse.com.au/apid"
ssh -tt apid "mkdir /home/ubuntu/workspace/RWOz/www.runningwarehouse.com.au/apid"
scp -r public/apid/* apid:/home/ubuntu/workspace/RWOz/www.runningwarehouse.com.au/apid
scp -r public/apid/* apid:/home/ubuntu/workspace/apid_ui_github/injector/RWOz/www.runningwarehouse.com.au
