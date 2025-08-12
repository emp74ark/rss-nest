#!/bin/sh
echo UPDATE PACKAGE LISTS
apt-get -y update

echo INSTALL PUPPETEER DEPS
apt-get -y install \
        libglibd-2.0-0 libnspr4 libnss3 libdbus-1-3 \
        libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 libxcomposite1 \
        libxdamage1 libxfixes3 libxrandr2 libgbm1 libcairo2 libpango-1.0-0 \
        libasound2

echo DOWNLOAD CHROME
npx puppeteer browsers install chrome
