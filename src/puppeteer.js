/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-11-23 13:23:08
 * @LastEditTime: 2021-11-25 08:51:32
 */

const puppeteer = require('puppeteer');
const { domLinks, domCommunities, domCommunityDetails, domHouseDetails, domHouses, domTotalPage } = require('./dom');
const { readJson, writeJson } = require('./fs');

/**
 * 打开窗口
 */
exports.initWindow = (headless = false) => {
  return new Promise(async (resolve, reject) => {
    // 创建浏览器窗口
    const browser = await puppeteer.launch({
      headless: headless, // 有界面模式，可以查看执行详情
      devtools: true,
    });

    // 创建标签页
    const page = await browser.newPage();

    console.log('打开浏览器窗口');
    resolve({ page, browser });
  })
}

/**
 * 获取所有街道链接(含去重)
 * 增加缓存机制: 
 *   - 因为每次服务断开, 都需要重新初始化街道链接, 还挺耗时间的
 *   - 选择用 json 形式存储下来, 链接作为键名, 以支持爬取其它城市或页面
 * @param page 页面操作对象
 * @param cityLink 需要爬取的页面
 * @returns Object[] 返回的信息，同时缓存在 streets.json 里
 *   [{
 *     link: '', // 链接
 *    name: '', // 街道
 *    district: '', // 政区
 *    }, ...]
 */
exports.getStreetLinks = (page, cityLink) => {
  return new Promise(async (resolve, reject) => {
    // 尝试读取缓存
    const storage = await readJson('../json/streets.json');
    if (storage[cityLink]) return resolve(storage[cityLink]);

    // 进入二手房页面
    await page.goto(cityLink);
    // 当页面出现指定元素时，表示已可爬
    await page.waitForSelector('div.position');

    const districts = await page.$$eval('div[data-role=ershoufang]>div>a', domLinks)

    const streetSet = new Set();
    const streetLinks = [];
    for (const district of districts) {
      const { link: dLink, name: dName } = district;

      await page.goto(dLink)
      await page.waitForSelector('div[data-role=ershoufang]');

      // 找二级菜单，继续遍历
      let streets = await page.$$eval('div[data-role=ershoufang] div:last-child a', domLinks);
      for (const street of streets) {
        const { link: sLink, name: sName } = street;

        if (streetSet.has(sName)) continue;

        streetSet.add(sName);
        streetLinks.push({
          link: sLink,
          name: sName,
          district: dName,
        })
      }

      // TEST
      // break;
    }

    // 写入缓存
    await writeJson('../json/streets.json', { ...storage, [cityLink]: streetLinks });

    resolve(streetLinks);
  })
}

exports.getTotalPage = (page, street) => {
  return new Promise(async (resolve, reject) => {
    await page.goto(street.link);
    const totalPage = await page.$eval('div.house-lst-page-box', domTotalPage);
    // console.log(`当前页面共有 ${totalPage} 页`)

    resolve(totalPage);
  })
}

const getItemsFromOnePage = (page, street, cur, selector, domFn) => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.goto(`${street.link}pg${cur}/`);
  
      // 从当前页获取信息
      const curPageItems = await page.$$eval(selector, domFn);
      // 添加行政区和街道信息
      curPageItems.forEach(item => {
        item.district = street.district;
        item.street = street.name;
      });
  
      resolve(curPageItems);
    } catch (err) {
      reject(err);
    }
  })
}

exports.getHousesFromOnePage = (page, street, cur) => {
  return getItemsFromOnePage(page, street, cur, 'ul.sellListContent > li', domHouses);
}

exports.getCommunitiesFromOnePage = (page, street, cur) => {
  return getItemsFromOnePage(page, street, cur, 'ul.listContent > li', domCommunities);
}

const getDetails = (page, link, domFn) => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.goto(link);
      const details = page.$eval('body', domFn);
  
      resolve(details);
    } catch (err) {
      reject(err);
    }
  })
}

exports.getCommunityDetails = (page, community) => {
  return getDetails(page, community.link, domCommunityDetails);
}

exports.getHouseDetails = (page, house) => {
  return getDetails(page, house.link, domHouseDetails);
}
