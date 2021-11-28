import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as urlParser from 'url';
import * as fs from 'fs';
import path from 'path';

const darzelis = 'http://per4mans.hr/';

const seenUrls = {};

const getUrl = (link) => {
  if (!link.includes('http')) {
    return darzelis;
  } else {
    return link;
  }
};

const crawl = async ({ url }) => {
  if (seenUrls[url]) return;
  console.log('crawling', url);
  seenUrls[url] = true;
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const links = $('a')
    .map((i, link) => link.attribs.href)
    .get();

  const imageUrls = $('img')
    .map((i, link) => link.attribs.src)
    .get();

  imageUrls.forEach((imageUrl) => {
    fetch(getUrl(imageUrl)).then((res) => {
      const filename = path.basename(imageUrl);
      const dest = fs.createWriteStream(`images/${filename}`);
      res.body.pipe(dest);
    });
  });

  const { host } = urlParser.parse(url);
  links
    .filter((link) => link.includes(host))
    .forEach((link) => {
      crawl({ url: getUrl(link) });
    });
};

crawl({ url: darzelis });
